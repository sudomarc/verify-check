# Standard Transactional Rollback & State Compensation Contract

## Metadata
- **contract_id**: `transactional_rollback_governance`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions

## Purpose
Define a provider-neutral, evidence-based governance contract for transactional rollback, side-effect compensation, state journaling, and unwinding recovery across single-agent and multi-agent execution workflows.

---

## 1. Transactional State Architecture

When an agent executes operations that modify persistent state (local workspace files, Git branches, build caches, databases, external cloud APIs, or sandboxed environments), failures midway through a task must not leave environments corrupted or inconsistent.

```text
Orchestrator / Agent Execution Loop
  │
  ├── [Dispatches Mutating Tool Call]
  │     │
  │     ▼
  │   Pre-Execution State Capture & Journaling
  │     ├─ Record Forward Action Intent
  │     ├─ Record Idempotent Compensating Action
  │     └─ Append Entry to journal.jsonl
  │
  ├── [Executes Forward Action]
  │     ├─ Status: SUCCESS ──> Mark Journal Step COMPLETED
  │     └─ Status: FAILURE / SAFETY_TRIGGERED / ABORT
  │           │
  │           ▼
  └── Saga Compensation Coordinator (CHAD Runtime)
        ├─ Inspect Side-Effect Journal (LIFO order)
        ├─ Execute Compensating Actions
        └─ Emit Telemetry & Post-Rollback Verification
```

---

## 2. Reversibility Tiers

Every mutating tool, API call, or shell command declared or executed by agents is categorized into one of four standard reversibility tiers:

| Reversibility Tier | Description | Strategy | Examples |
|---|---|---|---|
| `PURE_REVERSIBLE` | Direct, exact state restoration to prior state without loss or side-effects. | Automated inverse operation or snapshot restoration. | Overwriting a local workspace file with pre-execution content, restoring Git stash/branch. |
| `COMPENSABLE` | Original operation cannot be strictly undone, but a semantic inverse operation neutralizes effects. | Saga compensation action executed in reverse order. | Creating a resource then deleting it, allocating cloud VM then terminating it, issuing debit then refund. |
| `FORWARD_FIX_ONLY` | Mutation cannot be undone or compensated cleanly; recovery requires progressing forward with fix/remediation. | Abort forward chain, run targeted remediation task. | Partially applied non-reversible DB migration, published public package release, sent email notification. |
| `IRREVERSIBLE` | Permanent destructive change with no compensation or automated fix possible. | Strict Human Checkpoint required *before* execution; zero automated unwinding. | `rm -rf /` on production mount, dropping non-backed-up production table, force-pushing over main. |

---

## 3. Side-Effect Journaling Schema (`journal.jsonl`)

The CHAD runtime or executing agent maintains an append-only, durable side-effect journal file (`.ai/state/journal.jsonl` or session-scoped equivalent). Each entry follows this standard schema:

```json
{
  "entry_id": "se-20260330-001",
  "trace_id": "tr-20260330-saga-001",
  "step_index": 3,
  "agent_id": "coder-alpha",
  "tool_name": "write_file",
  "reversibility_tier": "PURE_REVERSIBLE",
  "forward_action": {
    "target": "src/services/billing.ts",
    "pre_state_hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "pre_state_ref": ".ai/state/snapshots/billing.ts.bak"
  },
  "compensating_action": {
    "tool_name": "restore_file",
    "parameters": {
      "filepath": "src/services/billing.ts",
      "source_snapshot": ".ai/state/snapshots/billing.ts.bak"
    },
    "idempotent": true,
    "timeout_seconds": 30
  },
  "execution_status": "COMPLETED",
  "compensation_status": "PENDING",
  "timestamp": "2026-03-30T14:32:00Z"
}
```

### Schema Invariants:
1. **Pre-Write Journaling**: The journal record MUST be written and flushed to durable storage *before* the forward action is initiated.
2. **Zero Sensitive Data in Journal**: Pre-state snapshots or compensation parameters containing secrets, passwords, or PII MUST be tokenized or redacted per `.ai/contracts/tool-audit.contract.md`.
3. **Idempotence Required**: Compensating actions MUST be idempotent. Executing the compensating action multiple times must yield the same clean outcome without secondary errors.

---

## 4. Saga Unwinding Execution Models

When a stop condition (`SAFETY_TRIGGERED`, `GOAL_BLOCKED`, `MAX_BUDGET_REACHED`, or unexpected crash) halts forward progress:

1. `AUTOMATED_SAGA_UNWIND`:
   - Applicable for journals consisting entirely of `PURE_REVERSIBLE` or verified `COMPENSABLE` steps.
   - The runtime unwinds actions in Last-In-First-Out (LIFO) order.
   - Each compensating step is executed, verified, and updated in the journal to `COMPENSATED`.

2. `SUPERVISED_ROLLBACK_CHECKPOINT`:
   - Triggered when at least one step in the journal is `FORWARD_FIX_ONLY` or when an automated compensating action fails.
   - Forward execution halts immediately.
   - The coordinator generates an escalation report presenting the exact partially unwound state to a human operator.

3. `QUARANTINE_MANUAL_HOLD`:
   - Triggered if an unexpected conflict occurs during unwinding (e.g., target file was modified out-of-band, or compensating tool returns non-zero error).
   - The runtime isolates the sandbox/worktree, preserves the journal and diffs, releases concurrency locks, and alerts the operator.

---

## 5. Post-Rollback Verification Gates

Rollback is not complete upon execution of compensating actions alone; empirical evidence of restored state is mandatory:

1. **Workspace Diff Verification**:
   - For `PURE_REVERSIBLE` file operations, `git status` and file hash comparisons MUST confirm clean return to baseline.
2. **Port / Process Cleanup Verification**:
   - Background servers, listening sockets, or spawned subprocesses must be verified terminated (`kill -0` or port check returns free).
3. **Evidence Emission**:
   - Rollback completion emits a verification record with label `VERIFIED` detailing baseline restoration.
   - If restoration cannot be verified, status is labeled `UNVERIFIED` and escalated.

---

## 6. Rollback Telemetry Schema

All compensation events emit structured audit telemetry:

```json
{
  "trace_id": "tr-20260330-saga-001",
  "orchestrator_id": "orchestrator-main",
  "agent_id": "coder-alpha",
  "event": "SAGA_UNWIND_STARTED | COMPENSATING_ACTION_EXECUTED | SAGA_UNWIND_COMPLETED | COMPENSATION_FAILED",
  "total_steps_journaled": 5,
  "steps_compensated": 5,
  "unwind_model": "AUTOMATED_SAGA_UNWIND",
  "duration_ms": 1420,
  "status": "RESTORED | PARTIALLY_COMPENSATED | QUARANTINED",
  "timestamp": "2026-03-30T14:35:00Z"
}
```

---

## 7. CHAD & LapisLLM Runtime Compatibility

### CHAD Runtime Layer
- CHAD serves as the Saga Compensation Coordinator.
- CHAD captures pre-state file hashes/snapshots before invoking mutating tools.
- CHAD intercepts execution interrupts, crashes, or safety tripwires and manages the LIFO execution of compensating tools.

### LapisLLM Model Layer
- When planning multi-step tasks, LapisLLM evaluates action reversibility and includes compensating specifications for each planned step.
- LapisLLM avoids interleaving irreversible operations before verifying preceding reversible steps.
