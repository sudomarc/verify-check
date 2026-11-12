# Reversibility & State Compensation Reference

## Metadata
- **reference_id**: `reversibility_and_compensation`
- **version**: `1.0.0`
- **contract**: `.ai/contracts/rollback.contract.md`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions

## Purpose
Provide operational guidance for engineering agents (`coder`, `orchestrator`, `analyst`) and the CHAD runtime supervisor on classifying operation reversibility, managing side-effect journals (`journal.jsonl`), executing compensating actions during failures, and handling non-reversible state transitions.

---

## 1. Reversibility Classification Heuristics

Before dispatching any tool or shell command that changes state, agents must classify the operation into one of four tiers:

### 1.1 `PURE_REVERSIBLE`
- **File System**: Creating, editing, or deleting project files where original content or absence was pre-recorded.
- **Git State**: Creating temporary local branches, staging changes, or creating unpushed commits.
- **Environment**: Creating temporary scratch directories or ephemeral build artifacts (e.g. `dist/`, `.cache/`).
- **Compensation Strategy**: Direct restoration from pre-state snapshot or Git working tree reset.

### 1.2 `COMPENSABLE`
- **Dependency Management**: Adding a package dependency (`npm install`, `poetry add`, `pip install`).
  - *Compensating Action*: Uninstall the package and restore original lockfile (`npm uninstall <pkg>`, restore `package-lock.json`).
- **External Resources**: Creating cloud sandbox instances, temporary database test fixtures, or preview servers.
  - *Compensating Action*: Explicit deletion/teardown API call with confirmed cleanup.
- **Background Processes**: Starting local dev servers or background workers.
  - *Compensating Action*: Explicit process termination via PID or port kill.

### 1.3 `FORWARD_FIX_ONLY`
- **Non-Reversible DB Schema Mutations**: Destructive schema alters (e.g. dropping columns, type migrations with data loss).
- **External Distributed Actions**: Publishing npm/PyPI packages, pushing tags/commits to shared remote repositories, sending webhooks or emails.
- **Compensation Strategy**: Do NOT attempt automated reversal. Immediately halt, notify human operator, and formulate a targeted forward remediation task.

### 1.4 `IRREVERSIBLE`
- **High-Risk Host Deletions**: Recursive deletes across unverified directory boundaries (`rm -rf /` or root paths).
- **Production State Mutations**: Directly dropping tables, truncating production stores, rotating shared credentials without backups.
- **Compensation Strategy**: STRICT STOP. Automated execution is strictly prohibited. Requires an explicit Human Checkpoint before any command is run.

---

## 2. Pre-Execution Journaling Workflow

When an agent prepares to mutate state:

```text
1. Identify target resource & operation
2. Snapshot current state:
   - For files: capture SHA-256 hash and snapshot backup file
   - For dependencies: verify lockfile SHA-256
   - For ports: check port status
3. Formulate idempotent compensating action:
   - Ensure compensating action requires no human interaction
   - Set bounded timeout (default 30s)
4. Append journal entry to journal.jsonl
5. Execute forward operation
6. Update journal entry status: COMPLETED or FAILED
```

---

## 3. Saga Unwinding Protocol

When an agent task is aborted due to test failure, runtime error, token budget exhaustion (`MAX_BUDGET_REACHED`), or safety halt (`SAFETY_TRIGGERED`):

1. **Lock Runtime Forward Dispatch**:
   - Prevent any further forward tool calls.
2. **Read Journal in LIFO Order**:
   - Traverse `journal.jsonl` in reverse order (most recent completed step first).
3. **Execute Compensating Steps**:
   - Invoke each step's `compensating_action`.
   - Record compensation outcome (`COMPENSATED` or `FAILED`).
4. **Gate Verification**:
   - Run verification checks (e.g., `git status --porcelain`, file hashes).
   - If clean: Emit status `RESTORED` with evidence label `VERIFIED`.
   - If any compensating step failed or could not be verified: Escalate to `SUPERVISED_ROLLBACK_CHECKPOINT` or `QUARANTINE_MANUAL_HOLD`.

---

## 4. Idempotency Guidelines for Compensating Actions

To avoid cascading failures during unwinding:
- Compensating actions must tolerate being called when the target was partially mutated or already restored.
- Examples:
  - File restoration: Overwrite target file directly from snapshot; do not fail if target was deleted.
  - Process cleanup: Use `kill <PID> 2>/dev/null || true` rather than a command that throws when PID is gone.
  - Package uninstall: Re-checkout `package.json` and lockfile directly from Git rather than relying solely on package manager state.

---

## 5. Escalation and Reporting

If an unwind sequence cannot achieve clean baseline restoration:
1. Generate the structured report conforming to `.ai/templates/rollback-journal.md`.
2. Document all residual diffs and lock states.
3. Label evidence clearly (`VERIFIED` vs `UNVERIFIED`).
4. Await human instruction before any further autonomous actions.
