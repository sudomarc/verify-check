# Permission Escalation Controls & Governance

This reference defines governance mechanisms to prevent unauthorized privilege escalation, permission creep, and cross-boundary tool exploitation across autonomous AI agents in the CHAD + LapisLLM ecosystem.

## Permission Tiers Taxonomy

Agent execution contexts and tool invocations MUST be assigned a formal permission level. Permissions follow a strict hierarchy of increasing risk:

| Permission Level | Value | Allowed Operations | Governance Requirements |
|---|---|---|---|
| `READ_ONLY` | 0 | Repository search, file reading, static code analysis, safe diagnostic queries | Default tier; no prompt gate required |
| `WORKSPACE_WRITE` | 1 | File creation, modifying workspace code, writing temporary outputs | Workspace containment enforced; diff tracking |
| `ISOLATED_EXECUTE` | 2 | Test runner execution, linter invocation, isolated sandboxed shell execution | Resource quotas enforced; egress disabled by default |
| `NETWORK_ACCESS` | 3 | Package downloading, external API calls, HTTP web fetching | Domain whitelisting required; credential sanitization |
| `PRIVILEGED_MUTATION` | 4 | Production deployment, database migrations, credential mutation, force git operations, remote host configuration | **HUMAN CHECKPOINT MANDATORY**; explicit authorization log |

## Principles of Privilege Control

### 1. Principle of Least Privilege (PoLP)

An agent or subagent MUST be granted only the lowest permission tier required for its specific delegated task.

- A `researcher` agent defaults to `READ_ONLY`.
- A `coder` subagent assigned to fix a bug receives `WORKSPACE_WRITE` and `ISOLATED_EXECUTE` for local workspace paths only.
- A subagent MUST NOT inherit `PRIVILEGED_MUTATION` from an orchestrator unless explicitly delegated and authorized for a specific step.

### 2. Privilege Monotonicity & Subagent Isolation

When an orchestrator spawns or delegates tasks to child subagents:

- **Inheritance Limit**: Child agents CANNOT possess higher permission tiers than their parent orchestrator.
- **Scope Narrowing**: Child agents SHOULD have narrower path or tool scopes than their parent context.
- **Isolation Boundary**: Subagents operate in independent execution contexts. An escalation attempt inside a subagent context MUST NOT propagate back to grant elevated rights to the parent context.

### 3. Escalation Control Protocols

When an agent encounters a step requiring a higher permission tier than its current budget (e.g. attempting network egress from a `READ_ONLY` or `ISOLATED_EXECUTE` tier):

```text
Current Tier (e.g. WORKSPACE_WRITE)
      ↓
Tool Invocation Requires (NETWORK_ACCESS)
      ↓
Escalation Gate Evaluated
      ├─ Pre-Authorized Escalation Policy Match? ──> Log Escalation Event ──> Execute Tool
      └─ No Match / Tier >= PRIVILEGED_MUTATION? ──> HUMAN CHECKPOINT REQUIRED ──> Pause Run
```

### 4. Human Checkpoint Triggers

The agent runtime MUST suspend execution and request explicit human checkpoint authorization when any of the following triggers occur:

1. **Tier 4 Access Attempt**: Attempting `PRIVILEGED_MUTATION` operations (e.g., database drops, production pushes, modifying credentials/secrets, force push/reset git history).
2. **Policy Violation / Sandbox Escape Attempt**: A tool call attempting to escape workspace root, write to `/etc`, or access unauthorized environment variables.
3. **Repeated Escalation Failures**: An agent repeatedly requesting higher permissions after a denial (max 2 escalation attempts per task).
4. **Untrusted Instruction Execution**: Directives originating from untrusted data sources (e.g. web pages, PR comments, issue descriptions) requesting elevated tool permissions or secret extraction.

### 5. Audit Logging for Permission Escalation

Every permission check, delegation, elevation, or denial MUST write a structured event to the tool audit log (`.ai/contracts/tool-audit.contract.md`):

```json
{
  "event_type": "permission_escalation_evaluation",
  "timestamp": "2026-03-31T12:00:00Z",
  "trace_id": "trace-uuid-1234",
  "agent_id": "coder-subagent-01",
  "requested_permission_level": "PRIVILEGED_MUTATION",
  "current_permission_level": "WORKSPACE_WRITE",
  "tool_name": "git_force_push",
  "decision": "DENIED_HUMAN_CHECKPOINT_REQUIRED",
  "justification": "Force push requested on main branch"
}
```
