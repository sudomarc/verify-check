# Agent Failure Taxonomy

This document establishes a standardized taxonomy for classifying, analyzing, and mitigating agent failures across the CHAD execution runtime and LapisLLM model backend ecosystem.

## Overview

A standardized failure taxonomy allows autonomous agents and human operators to:
1. Standardize failure classification during operational execution and periodic evaluation loops.
2. Isolate failure root causes (distinguishing model defects, runtime errors, tool contract violations, and governance/safety stops).
3. Automate escalation, fallback routing, and self-improvement proposals.

---

## Primary Failure Categories

All agent execution failures MUST be classified under one of the following primary categories:

| Category Code | Name | Description | Responsible Layer |
|---|---|---|---|
| `PERM_DENIED` | Permission Denied | Operation blocked due to insufficient agent permission tier or missing explicit human approval. | Runtime (CHAD) / Governance |
| `TOOL_EXEC_ERR` | Tool Execution Error | Tool failed during execution due to runtime exception, bad arguments, or unexpected environmental state. | Tool / Runtime |
| `PLAN_DEFECT` | Planning Defect | Agent produced an invalid, cyclic, incomplete, or unexecutable plan. | Agent / Model (LapisLLM) |
| `VERIF_FALSE_POS` | Verification False Positive | Agent claimed task completion or success without actual supporting empirical verification evidence. | Agent |
| `CONTEXT_EXCEEDED` | Context Exceeded | Context budget or model token limit exceeded, resulting in unexpected truncation or loss of state. | Model Gateway / Token Economy |
| `MODEL_HALLUC` | Model Hallucination | Model generated non-existent tool calls, invalid paths, invented APIs, or non-factual outputs. | Model (LapisLLM) |
| `SAFETY_BLOCKED` | Safety / Policy Blocked | Execution stopped due to prompt injection detection, sandbox security violation, or secret leak risk. | Security / Policy Layer |
| `INFRA_FAIL` | Environment & Infra Failure | Network egress failure, sandbox crash, database unavailability, or provider API downtime. | Infrastructure / Provider |

---

## Failure Category Breakdown

### 1. Permission Denied (`PERM_DENIED`)
- **Subcategories:**
  - `PERM_TIER_EXCEEDED`: Agent attempted an action above its assigned permission level (e.g. `READ_ONLY` agent trying `WORKSPACE_WRITE`).
  - `HUMAN_APPROVAL_MISSING`: Operation requires explicit human approval checkpoint (e.g. credential mutation or destructive Git command) which was not granted.
  - `ISOLATION_VIOLATION`: Agent attempted to access paths or resources outside its bounded sandbox scope.
- **Mitigation & Recovery:** Request privilege escalation via human checkpoint or route task to an appropriately authorized role.

### 2. Tool Execution Error (`TOOL_EXEC_ERR`)
- **Subcategories:**
  - `TOOL_INVALID_ARGS`: Input arguments failed schema validation or parameter constraints.
  - `TOOL_RUNTIME_EXCEPTION`: Tool crashed or returned an unexpected exit code / unhandled exception.
  - `TOOL_TIMEOUT`: Tool execution exceeded specified time budget.
  - `TOOL_OUTPUT_MALFORMED`: Tool response was unparseable or missing required output fields.
- **Mitigation & Recovery:** Validate tool contract parameters, retry with modified inputs (max 2 retries), or invoke fallback capability.

### 3. Planning Defect (`PLAN_DEFECT`)
- **Subcategories:**
  - `PLAN_CIRCULAR`: Agent entered a non-terminating retry or reasoning loop.
  - `PLAN_MISSING_STEPS`: Plan omitted necessary prerequisite inspection or verification steps.
  - `PLAN_SCOPE_CREEP`: Plan attempted changes outside the authorized task goal or non-goals.
  - `PLAN_UNREALISTIC`: Plan relied on non-existent tooling or impossible execution conditions.
- **Mitigation & Recovery:** Trigger plan review, compact context, escalate reasoning effort (e.g. from `medium` to `high`), or re-plan with explicitly bounded subgoals.

### 4. Verification False Positive (`VERIF_FALSE_POS`)
- **Subcategories:**
  - `UNOBSERVED_SUCCESS_CLAIM`: Agent claimed tests/builds passed without actual command execution output.
  - `INCOMPLETE_ASSERTION`: Verification tested irrelevant behavior or passed due to flawed test logic.
  - `STALE_EVIDENCE`: Agent reused verification results from a prior run without re-testing after code edits.
- **Mitigation & Recovery:** Enforce empirical verification rule: success claims require direct observation log attached to evidence output.

### 5. Context Exceeded (`CONTEXT_EXCEEDED`)
- **Subcategories:**
  - `INPUT_CONTEXT_BLOAT`: Incoming context exceeded maximum model window.
  - `OUTPUT_TRUNCATION`: Generated output hit maximum token output cap mid-response.
  - `TRAJECTORY_DEGRADATION`: Accumulation of stale context degradation caused reasoning failure.
- **Mitigation & Recovery:** Trigger trajectory compaction (`/compact`), load minimum sufficient context, or write structured handoff (`.ai/templates/handoff.md`).

### 6. Model Hallucination (`MODEL_HALLUC`)
- **Subcategories:**
  - `HALLUCINATED_TOOL`: Agent called a tool name or function signature that does not exist in the environment.
  - `HALLUCINATED_PATH`: Agent referenced or attempted to read non-existent repository paths without prior inspection.
  - `HALLUCINATED_API`: Agent generated syntactically plausible but non-existent language or API methods.
- **Mitigation & Recovery:** Provide exact schema error feedback to model, execute repository search/inspection before referencing paths, or fall back to higher-capability model.

### 7. Safety / Policy Blocked (`SAFETY_BLOCKED`)
- **Subcategories:**
  - `PROMPT_INJECTION_DETECTED`: Untrusted input contained indirect or direct prompt injection vectors.
  - `SECRET_LEAK_PREVENTED`: Tool output or agent response contained raw credentials or tokens.
  - `SANDBOX_ESCAPE_ATTEMPT`: Command attempted forbidden container/host privilege escalation.
- **Mitigation & Recovery:** Immediately halt execution, sanitize untrusted data inputs, redact secrets, and escalate incident log to security audit log (`.ai/contracts/tool-audit.contract.md`).

### 8. Environment & Infrastructure Failure (`INFRA_FAIL`)
- **Subcategories:**
  - `PROVIDER_DOWNTIME`: LapisLLM model backend or external API provider unavailable.
  - `NETWORK_EGRESS_BLOCKED`: Required outbound network connection timed out or was blocked by firewall.
  - `SANDBOX_CRASH`: Underlying execution environment or container crashed due to resource exhaustion.
- **Mitigation & Recovery:** Activate capability fallback cascade (`.ai/contracts/capability-fallback.contract.md`), retry with backoff, or report infrastructure degraded state.

---

## Severity Levels

Each failure event MUST be assigned a severity tier:

1. `CRITICAL` — Security boundary breach, secret leak, or irreversible data corruption. Execution MUST halt immediately.
2. `MAJOR` — Task failure blocking progress where no automated fallback exists. Requires human intervention or replanning.
3. `MINOR` — Bounded tool execution error or transient model defect recovered via automated fallback or retry loop.
4. `INFORMATIONAL` — Suboptimal plan or minor context bloat corrected automatically without task interruption.

---

## Integration with CHAD and LapisLLM

- **CHAD Agent Runtime:** Maps runtime error codes to this taxonomy in `tool-audit.contract.md` events and telemetry traces.
- **LapisLLM Model Runtime:** Uses model hallucination and context truncation metrics from evaluation suites to benchmark model release candidates.
- **Vibe Coding Self-Improvement:** Aggregates failure taxonomy counts across daily/weekly cycles to identify `RECURRING_FAILURE` or `SYSTEMIC_FAILURE` patterns for governance or skill proposals.
