# Sandbox Requirements & Execution Governance

## Metadata
- **reference_id**: `sandbox_requirements`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions
- **scope**: Provider-neutral runtime sandbox requirements, isolation boundaries, resource quotas, and environment controls for AI agents

---

## 1. Purpose & Scope

When AI agents execute tools (such as build tools, tests, shell scripts, or linters), executing untrusted code or LLM-generated commands directly on the host operating system creates significant risk of data exfiltration, system compromise, or unauthorized side-effects.

This reference defines provider-neutral sandbox execution requirements for the **CHAD + LapisLLM** ecosystem.

---

## 2. Sandbox Isolation Levels

Agent execution tasks MUST be mapped to one of four standard isolation levels based on tool permission levels (`.ai/contracts/tool.contract.md`):

| Level | Name | Target Operations | Isolation Requirements | Permitted Tools |
|---|---|---|---|---|
| **Level 0** | **Unconstrained Host** | *Forbidden for autonomous agent execution* | Full host OS access. | None (Blocked) |
| **Level 1** | **Workspace Jail** | File inspection, local edits | Path restricted to workspace root (`chroot` / mount bind). No system path write access. | `READ_ONLY`, `WORKSPACE_WRITE` |
| **Level 2** | **Containerized Sandbox** | Test execution, code compilation, linting | Isolated container or MicroVM (gVisor / Docker / Firecracker). Non-root user, read-only rootfs, resource caps. | `ISOLATED_EXECUTE` |
| **Level 3** | **Air-Gapped / Filtered Network Sandbox** | External documentation search, controlled API calls | Level 2 container + egress network filtering (domain allowlist, DNS proxy, credential masking). | `NETWORK_ACCESS` |

---

## 3. Container & MicroVM Resource Quotas

For Level 2 and Level 3 sandboxes (`ISOLATED_EXECUTE`), runtime environments (CHAD) MUST enforce strict hardware and execution limits:

- **CPU Quota**: Default limit of 2 vCPUs per tool execution step.
- **Memory Limit**: Default cap of 2.0 GB RAM. OOM-killed if exceeded, triggering `MAX_BUDGET_REACHED` or `GOAL_BLOCKED`.
- **Disk Storage / Ephemeral Volume**: Ephemeral write layer capped at 1.0 GB. Restricted `/tmp` tmpfs mount.
- **Execution Timeout**: Default step timeout of 30 seconds; hard maximum limit of 300 seconds for heavy compilation/test jobs.
- **Process Limit (`pids_limit`)**: Capped at 64 concurrent processes to prevent fork bombs.

---

## 4. Network Egress Governance

Network access within sandboxed execution environments MUST obey the following controls:

1. **Default Egress Policy**: DENY ALL outbound network traffic unless explicitly elevated to Level 3 (`NETWORK_ACCESS`).
2. **Domain Allowlisting**: When `NETWORK_ACCESS` is granted, egress traffic MUST pass through an intercepting proxy enforcing a predefined domain allowlist (e.g., package registries, official documentation sites, approved API endpoints).
3. **Credential & Token Redaction**: Outbound requests MUST be scanned by the runtime proxy to prevent leakage of environment credentials, secrets, or API tokens.
4. **Local Network Isolation**: Egress to internal host services (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, cloud metadata services `169.254.169.254`) MUST be explicitly blocked.

---

## 5. Filesystem & Environment Variable Isolation

### Filesystem Controls
- **Root Filesystem**: Read-only (`ro`) mount for container OS image.
- **Workspace Mount**: Bind-mounted into container at designated working directory (e.g., `/workspace`).
- **Forbidden Host Paths**: Host system directories (`/etc`, `/var`, `/usr`, `/home/*/.ssh`, `/home/*/.aws`) MUST NOT be mounted or accessible inside the sandbox.

### Secret & Environment Sanitization
- **Secret Stripping**: Environment variables containing sensitive credentials (`AWS_SECRET_ACCESS_KEY`, `GITHUB_TOKEN`, API keys) MUST NOT be passed into `ISOLATED_EXECUTE` sandboxes unless explicitly required for the specific tool and user-authorized.
- **Controlled Passthrough**: Provide sanitized minimal PATH, TERM, LANG, and mock environment configuration variables.

---

## 6. Lifecycle & Cleanup Policies

- **Ephemeral State**: Sandbox containers MUST be ephemeral and destroyed after tool call completion or session termination.
- **Garbage Collection**: Orphaned sandbox processes, dangling container volumes, and network namespaces MUST be automatically pruned by the CHAD runtime daemon.
- **Audit Logging**: Sandbox creation, execution return codes, resource utilization, and network access attempts MUST be logged with structured telemetry.

---

## 7. Ecosystem Compatibility (CHAD & LapisLLM)

### CHAD Runtime Layer
- CHAD provisions containerized sandboxes (e.g., Docker / gVisor / WASM runtimes) enforcing Level 1-3 isolation.
- CHAD enforces resource limits, timeouts, and filesystem bind mounts before dispatching tools.
- CHAD intercepts sandbox errors (OOM, timeout, egress block) and maps them to standard stop conditions (`GOAL_BLOCKED`, `SAFETY_TRIGGERED`).

### LapisLLM Model Runtime
- LapisLLM receives sandbox status context in system instructions to understand execution constraints.
- LapisLLM avoids generating tools or scripts that rely on unrestricted root access or prohibited external network calls.
