# Sandbox Execution & Boundary Isolation Governance Contract

## Metadata
- **contract_id**: `sandbox_governance`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions
- **status**: `ACTIVE`
- **scope**: Provider-neutral execution sandbox boundaries, container/MicroVM isolation tiers, hardware resource quotas, network egress proxy schema, environment sanitization, and escape violation telemetry.

---

## 1. Purpose & Scope

Executing arbitrary agent-generated commands, build tools, tests, or linters directly on host OS infrastructure introduces critical risks of unauthorized filesystem access, process hijacking, data exfiltration, or host escalation.

This contract defines the provider-neutral runtime execution contract between **Vibe Coding Instructions** (policy layer), **CHAD** (agent orchestration runtime), and **LapisLLM** (model runtime) to enforce secure sandbox boundaries, deterministic resource quotas, strict network egress rules, secret stripping, and audit telemetry.

---

## 2. Isolation Level Taxonomy (`isolation_levels`)

Every agent tool dispatch (`.ai/contracts/tool.contract.md`) MUST map to an authorized isolation level:

| Level | Name | Permitted Tool Permissions | Runtime Boundary Specification |
|---|---|---|---|
| **Level 0** | **Unconstrained Host** | *FORBIDDEN* | Full host OS access. Direct execution strictly blocked for autonomous agents. |
| **Level 1** | **Workspace Jail** | `READ_ONLY`, `WORKSPACE_WRITE` | Path-restricted to `/workspace` root via `chroot` or read-only system bind-mounts. No write access to system directories. |
| **Level 2** | **Containerized Sandbox** | `ISOLATED_EXECUTE` | Non-root gVisor / Docker / Firecracker MicroVM container. Read-only rootfs (`ro`), dropped Linux capabilities (`CAP_DROP_ALL`), strict PID and cgroup limits. |
| **Level 3** | **Air-Gapped / Filtered Network Sandbox** | `NETWORK_ACCESS` | Level 2 container combined with intercepting network egress proxy enforcing domain allowlists and payload secret redaction. |

---

## 3. Sandbox Lifecycle State Machine

A sandbox environment follows a deterministic state machine managed by the CHAD runtime:

```text
  [UNINITIALIZED]
         │
         ▼
  [PROVISIONING] ──(Hardware quota / Mount setup)──► [READY]
                                                       │
                                            (Tool dispatch)
                                                       │
                                                       ▼
  [ESCAPE_VIOLATION] ◄──(Security breach)──── [EXECUTING]
         │                                             │
         │                                     (Task complete / Timeout)
         ▼                                             │
   [ABORTED & LOGGED] ◄──[TEARDOWN] ◄──────────────────┘
                            │
                            ▼
                       [DESTROYED]
```

### Lifecycle States
- `PROVISIONING`: Allocating ephemeral cgroups, namespaces, volume mounts, and secret stripping filters.
- `READY`: Container initialized, health-checked, and waiting for tool execution payload.
- `EXECUTING`: Active process execution under hardware and timeout limits.
- `TEARDOWN`: Terminating processes, unmounting workspace volumes, and collecting execution telemetry.
- `DESTROYED`: Complete destruction of container instance and network namespace.
- `ESCAPE_VIOLATION`: Security trigger activated due to forbidden host path access, privilege escalation, or unauthorized egress attempt.

---

## 4. Hardware Resource Quotas (`resource_quotas`)

All Level 2 and Level 3 sandboxed executions MUST be constrained by hard system resource quotas:

```json
{
  "resource_quotas": {
    "cpu_vcpu_limit": 2.0,
    "memory_ram_mb": 2048,
    "ephemeral_disk_mb": 1024,
    "process_pid_limit": 64,
    "step_timeout_seconds": 30,
    "max_timeout_seconds": 300
  }
}
```

### Quota Enforcement Rules
1. **Memory OOM**: Exceeding RAM limit triggers cgroup OOM termination, setting stop condition `MAX_BUDGET_REACHED` or `GOAL_BLOCKED`.
2. **Fork Bomb Prevention**: Process count exceeding `process_pid_limit` (64) immediately terminates execution and flags potential resource exhaustion.
3. **Execution Timeout**: Exceeding `step_timeout_seconds` sends `SIGTERM`, followed by `SIGKILL` after 5 seconds grace period.

---

## 5. Secret Sanitization & Filesystem Controls (`secret_sanitization`)

### Filesystem Isolation
- **Read-Only Root Filesystem**: Container root `/` MUST be mounted read-only (`ro`).
- **Workspace Mount**: Target project repository bind-mounted at `/workspace`.
- **Tmpfs Mounts**: Minimal tmpfs mounted on `/tmp` with `noexec,nosuid,nodev` options.
- **Forbidden Host Paths**: Access to host sensitive directories (`/etc/shadow`, `/root`, `/home/*/.ssh`, `/home/*/.aws`, `/var/run/docker.sock`) MUST trigger an immediate sandbox escape violation.

### Environment & Payload Sanitization
```json
{
  "secret_sanitization": {
    "policy": "DENY_ALL_EXCEPT_EXPLICIT_ALLOWLIST",
    "stripped_patterns": [
      "*KEY*", "*TOKEN*", "*SECRET*", "*PASSWORD*", "*CREDENTIAL*"
    ],
    "permitted_env_vars": [
      "PATH", "TERM", "LANG", "LC_ALL", "NODE_ENV", "PYTHONPATH"
    ]
  }
}
```

---

## 6. Network Egress Governance (`network_egress_policy`)

Network access inside Level 3 sandboxes MUST obey intercepting proxy enforcement:

```json
{
  "network_egress_policy": {
    "default_action": "DENY",
    "domain_allowlist": [
      "registry.npmjs.org",
      "pypi.org",
      "github.com",
      "api.anthropic.com"
    ],
    "blocked_ip_ranges": [
      "127.0.0.0/8",
      "10.0.0.0/8",
      "172.16.0.0/12",
      "192.168.0.0/16",
      "169.254.169.254/32"
    ],
    "credential_masking_enabled": true
  }
}
```

### Egress Interception Protocol
1. **Proxy Redirection**: All HTTP/HTTPS egress redirected through an intercepting proxy.
2. **Domain Allowlist Validation**: Requests to domains outside `domain_allowlist` return HTTP 403 Forbidden and record telemetry.
3. **Metadata Service Blocking**: Requests to cloud metadata IP `169.254.169.254` MUST be blocked at network boundary.
4. **Credential Masking**: Interceptor scans outbound headers and body for secrets matching `secret_sanitization` patterns and redacts them before transmission.

---

## 7. Escape Violation Telemetry & Incident Reporting (`escape_violation_telemetry`)

When a process attempts host escalation, container escape, or forbidden path/network access, the CHAD runtime MUST generate a structured telemetry event conforming to `.ai/contracts/tool-audit.contract.md`:

```json
{
  "event_type": "SANDBOX_ESCAPE_VIOLATION",
  "trace_id": "tr-98123-abc",
  "agent_id": "coder-agent-1",
  "sandbox_id": "sbx-872134-gvisor",
  "isolation_level": "LEVEL_2_CONTAINER",
  "violation_type": "FORBIDDEN_PATH_ACCESS | PRIVILEGE_ESCALATION | UNAPPROVED_EGRESS | RESOURCE_EXHAUSTION",
  "details": {
    "attempted_target": "/etc/shadow",
    "command": "cat /etc/shadow",
    "exit_code": 126
  },
  "stop_condition": "SAFETY_TRIGGERED",
  "timestamp": "2025-02-18T12:00:00Z"
}
```

### Mapped Stop Conditions
- `FORBIDDEN_PATH_ACCESS` / `PRIVILEGE_ESCALATION` -> `SAFETY_TRIGGERED`
- `RESOURCE_EXHAUSTION` (OOM / Fork bomb) -> `MAX_BUDGET_REACHED`
- `UNAPPROVED_EGRESS` -> `SAFETY_TRIGGERED`

---

## 8. Ecosystem Compatibility (CHAD & LapisLLM)

### CHAD Agent Runtime
- Proactively provisions Level 1-3 sandbox containers prior to dispatching agent tool requests.
- Applies cgroup resource caps, filesystem mounts, secret stripping filters, and proxy rules dynamically.
- Intercepts container exit codes, maps sandbox errors to standard stop conditions, and emits structured audit events.

### LapisLLM Model Runtime
- Ingests sandbox level constraints in system prompts to avoid recommending commands requiring root privileges or unrestricted access.
- Validates output commands against expected sandbox permission boundaries.
