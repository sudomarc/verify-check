# Transactional Rollback Journal Template

## Metadata
- **template_id**: `rollback_journal_template`
- **version**: `1.0.0`
- **contract**: `.ai/contracts/rollback.contract.md`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions

---

## 1. Machine-Readable Journal Record Schema (`journal.jsonl`)

Each line in the transaction log records an individual operation, its reversibility classification, forward intent, pre-state verification snapshot, and exact idempotent compensating action:

```json
{
  "entry_id": "se-{{TIMESTAMP}}-{{INDEX}}",
  "trace_id": "{{TRACE_ID}}",
  "step_index": 1,
  "agent_id": "{{AGENT_ID}}",
  "tool_name": "{{TOOL_NAME}}",
  "reversibility_tier": "PURE_REVERSIBLE | COMPENSABLE | FORWARD_FIX_ONLY | IRREVERSIBLE",
  "forward_action": {
    "target": "{{TARGET_RESOURCE}}",
    "pre_state_hash": "sha256:{{HASH}}",
    "pre_state_ref": "{{SNAPSHOT_PATH_OR_NULL}}"
  },
  "compensating_action": {
    "tool_name": "{{COMPENSATING_TOOL_NAME}}",
    "parameters": {
      "target": "{{TARGET_RESOURCE}}",
      "action": "{{COMPENSATING_OPERATION}}"
    },
    "idempotent": true,
    "timeout_seconds": 30
  },
  "execution_status": "PENDING | COMPLETED | FAILED",
  "compensation_status": "NONE | PENDING | COMPENSATED | FAILED | MANUAL_INTERVENTION_REQUIRED",
  "timestamp": "{{ISO8601_UTC}}"
}
```

---

## 2. Human-Readable Rollback & Compensation Report

When an execution halts and triggers unwinding (or escalates to `SUPERVISED_ROLLBACK_CHECKPOINT` / `QUARANTINE_MANUAL_HOLD`), the agent or runtime coordinator outputs this structured markdown summary:

```markdown
# Transactional Rollback & Compensation Report

## Summary
- **Session / Trace ID**: `tr-20260330-saga-001`
- **Initiating Agent**: `coder-alpha`
- **Orchestrator**: `orchestrator-main`
- **Unwinding Trigger**: `SAFETY_TRIGGERED | GOAL_BLOCKED | MAX_BUDGET_REACHED | EXECUTION_FAILURE`
- **Unwind Model Selected**: `AUTOMATED_SAGA_UNWIND | SUPERVISED_ROLLBACK_CHECKPOINT | QUARANTINE_MANUAL_HOLD`
- **Overall Status**: `RESTORED | PARTIALLY_COMPENSATED | QUARANTINED`

---

## Journaled Steps & Compensation Status (LIFO Order)

| Step # | Forward Tool & Target | Reversibility Tier | Compensating Action | Result |
|---|---|---|---|---|
| 3 | `write_file` (`src/services/billing.ts`) | `PURE_REVERSIBLE` | `restore_file` from snapshot | `COMPENSATED` |
| 2 | `run_in_bash` (`npm run build`) | `PURE_REVERSIBLE` | `rm -rf dist/` | `COMPENSATED` |
| 1 | `run_in_bash` (`npm install stripe`) | `COMPENSABLE` | `npm uninstall stripe && git checkout package*.json` | `COMPENSATED` |

---

## Post-Rollback Verification Evidence

| Surface | Check Performed | Expected Baseline | Observed Evidence | Label |
|---|---|---|---|---|
| Working Directory | `git status --porcelain` | Clean / No modified files | Clean working tree | `VERIFIED` |
| Lockfiles | SHA-256 hash check | Matches baseline `package-lock.json` | Hash verified identical | `VERIFIED` |
| Port Bindings | `lsof -i :3000` | No listening socket | No active PID found | `VERIFIED` |

---

## Escalations & Residual Risks
- **Irreversible / Forward-Fix Steps**: None.
- **Unresolved Inconsistencies**: None.
- **Recommended Next Action**: Re-assess initial hypothesis and verify prerequisites before re-attempting task.
```
