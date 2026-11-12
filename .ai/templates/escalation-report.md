# Agent Escalation & Human Checkpoint Report

**Trace ID:** `{trace_id}`
**Session ID:** `{session_id}`
**Timestamp:** `{timestamp_utc}`
**Orchestrator Agent ID:** `{orchestrator_agent_id}`
**Escalating Subagent ID:** `{subagent_id}` (`{subagent_role}`)

---

## 1. Escalation Metadata

- **Escalation Reason / Trigger:** `PRIVILEGED_MUTATION` | `BUDGET_THRESHOLD_BREACH` | `CIRCUIT_BREAKER_ACTIVATED` | `GOAL_BLOCKED` | `SAFETY_VIOLATION`
- **Autonomy Tier Required:** `L0` | `L1` | `L2` | `L3` | `L4`
- **Current Execution Status:** `PAUSED` | `BLOCKED` | `SAFETY_ABORTED`

---

## 2. Objective & Task State

- **Original Goal:** {Description of user request / delegated subtask}
- **Completed Steps:**
  - [x] Step 1: {Summary of completed step}
  - [x] Step 2: {Summary of completed step}
- **Blocked / Proposed Action:** {Exact command, code change, API mutation, or decision requiring authorization}

---

## 3. Risk Assessment & Side Effects

- **Risk Level:** `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`
- **Reversibility:** `REVERSIBLE` | `PARTIALLY_REVERSIBLE` | `IRREVERSIBLE`
- **Potential Side Effects:** {Detailed description of impacted files, systems, dependencies, or infrastructure}

---

## 4. Evidence & Diagnostics

```json
{
  "evidence": [
    {
      "label": "OBSERVED | VERIFIED | CONFLICT | UNKNOWN",
      "statement": "{Diagnostic log or evidence summary}",
      "source": "{Tool call, log file, or test result}"
    }
  ],
  "budget_utilization": {
    "steps_used": "{used} / {max}",
    "tokens_consumed": "{tokens} / {budget}",
    "retries_count": "{retries} / 3"
  }
}
```

---

## 5. Proposed Options for Human Reviewer

1. **Option A (Recommended):** {Description of recommended action and expected outcome}
2. **Option B (Alternative):** {Description of alternative safer approach}
3. **Option C (Abort):** Abort task and revert workspace state.

---

## 6. Human Decision Record (To be completed upon human intervention)

- **Decision:** `APPROVED` | `REJECTED` | `MODIFIED`
- **Authorized By:** `{user_identifier}`
- **Instructions / Modifications:** {Notes or instructions from human}
- **Resume Action:** {Next action to be executed by agent}
