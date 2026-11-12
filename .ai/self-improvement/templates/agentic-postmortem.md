# Agentic System Postmortem Report

> **Incident ID:** `inc-YYYYMMDD-xxx`
> **Trace ID:** `tr-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
> **Session ID:** `sess-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
> **Incident Date:** `YYYY-MM-DD`
> **Target Repository:** `org/repo`
> **Agents Involved:** `{orchestrator_id}`, `{subagent_id_1}`, `{subagent_id_2}`
> **Severity Tier:** `CRITICAL` | `MAJOR` | `MINOR` | `INFORMATIONAL`

---

## 1. Executive Summary & Impact

- **Incident Summary:** {Concise 2-3 sentence description of the failure, cascade, or unexpected agent behavior}
- **Impact Area:** `CODE_CORRUPTION` | `SECURITY_BREACH` | `TOKEN_BURN` | `UNAUTHORIZED_MUTATION` | `VERIFICATION_FALSE_POSITIVE` | `SERVICE_DISRUPTION`
- **Duration / Time to Detection:** `{duration_hh_mm}`
- **Autonomy Tier at Incident:** `L0` | `L1` | `L2` | `L3` | `L4`

---

## 2. Timeline & Cascade Breakdown

| Timestamp (UTC) | Agent / Actor | Tool / Event | Observed Behavior & Evidence Label |
|---|---|---|---|
| `HH:MM:SS` | `orchestrator` | `delegate_task` | `OBSERVED`: Task delegated to subagent |
| `HH:MM:SS` | `subagent_1` | `execute_tool` | `FACT`: Tool returned error `ERR_xxx` |
| `HH:MM:SS` | `subagent_1` | `retry_tool` | `OBSERVED`: Unjustified retry loop initiated |
| `HH:MM:SS` | `orchestrator` | `circuit_breaker` | `VERIFIED`: Circuit breaker activated / Failed to activate |

### Failure Cascade Analysis
{Describe how initial failure propagated across agent boundaries, tool calls, or context compaction passes}

---

## 3. Token & Cost Burn Analysis

| Resource Metric | Budget / Baseline | Actual Observed | Variance / Delta |
|---|---|---|---|
| **Input Tokens Total** | `0` | `0` | `+0` |
| **Cached Input Tokens** | `0` | `0` | `+0` |
| **Output Tokens** | `0` | `0` | `+0` |
| **Reasoning Tokens** | `0` | `0` | `+0` |
| **Tool Calls Count** | `0` | `0` | `+0` |
| **Compaction Operations** | `0` | `0` | `+0` |
| **Estimated Cost ($)** | `$0.00` | `$0.00` | `+$0.00` |

---

## 4. Root Cause Decomposition

### Primary Failure Category (Taxonomy)
Select primary classification:
- [ ] `PERM_DENIED` — Permission or autonomy tier limit exceeded.
- [ ] `TOOL_EXEC_ERR` — Unhandled tool execution error or schema mismatch.
- [ ] `PLAN_DEFECT` — Plan hallucination, scope inflation, or missing verification step.
- [ ] `VERIF_FALSE_POS` — False positive verification passed corrupted state.
- [ ] `CONTEXT_EXCEEDED` — Context overflow, truncation, or stale context corruption.
- [ ] `MODEL_HALLUC` — Model instruction drift or invented capabilities.
- [ ] `SAFETY_BLOCKED` — Safety boundary triggered or missed trigger.
- [ ] `INFRA_FAIL` — Network, provider, or environment infrastructure failure.

### Detailed Root Cause Analysis
- **Observed Symptom:** {Directly observed behavior}
- **Root Cause Hypothesis:** {Technical root cause explanation}
- **Contributing Factors:** {Context bloat, missing guardrails, prompt drift, etc.}

---

## 5. Bounded Autonomy & Governance Evaluation

- **Human Checkpoint Status:** `TRIGGERED_PROMPTLY` | `TRIGGERED_LATE` | `MISSED` | `NOT_APPLICABLE`
- **Circuit Breaker Behavior:** `ACTIVATED` | `FAILED_TO_ACTIVATED` | `BYPASSED`
- **Governance Rules Triggered:**
  - Rule 1: {e.g. `explicit human approval`}
  - Rule 2: {e.g. `permission escalation controls`}

---

## 6. Actionable Remediation & Self-Improvement Items

| Action Item ID | Target Component / File | Proposed Change | Owner | Proposal ID |
|---|---|---|---|---|
| `ACT-001` | `.ai/skills/{domain}/SKILL.md` | Add defensive check for error state | `governance` | `IMP-YYYY-xxx` |
| `ACT-002` | `.ai/contracts/tool.contract.md` | Enforce tighter tool result bounds | `runtime` | `IMP-YYYY-xxx` |
| `ACT-003` | `scripts/validate_instructions.py` | Add validator rule for missing marker | `governance` | `IMP-YYYY-xxx` |

---

## 7. Ecosystem & Telemetry Verification

- [x] **CHAD Agent Runtime:** Incident log & trace correlated in orchestration logs.
- [x] **LapisLLM Model Gateway:** Model provider inference tokens & reasoning breakdown verified.
- [x] **Governance Policy:** Self-improvement observation and proposal created without weakening governance boundaries.
