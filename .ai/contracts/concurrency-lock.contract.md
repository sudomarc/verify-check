# Standard Multi-Agent Concurrency & Shared Resource Locking Contract

## Metadata
- **contract_id**: `concurrency_lock_governance`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions

## Purpose
Define a provider-neutral, evidence-based governance contract for multi-agent concurrency control, distributed locking semantics, shared resource contention management, deadlock prevention, and conflict resolution across parallel AI agent executions.

---

## 1. Concurrency Control Architecture

When an Orchestrator dispatches multiple subagents (`coder`, `researcher`, `analyst`, or domain specialists) in parallel, agents must coordinate access to shared environment state (workspace source files, Git indices, package lockfiles, execution ports, databases, and temporary build caches).

```text
Orchestrator
  │
  ├── [Dispatches Parallel Tasks]
  │     ├── Subagent A (Coder) ────> Requests Exclusive Lock: src/auth/*
  │     ├── Subagent B (Coder) ────> Requests Exclusive Lock: src/api/*
  │     └── Subagent C (Analyst) ──> Requests Shared Read Lock: src/auth/*
  │
  ▼
CHAD Runtime Concurrency Lock Manager
  ├─ Lock Registry & Wait-for Dependency Graph
  ├─ Heartbeat Monitor & Lease Expiration (TTL)
  └─ Conflict Resolution & Merge Arbiter
```

---

## 2. Concurrency Control Modes

All resource locks declared or requested by agents adhere to three standard concurrency modes:

| Lock Mode | Description | Mutual Exclusivity | Allowed Agent Roles |
|---|---|---|---|
| `PESSIMISTIC_EXCLUSIVE` | Exclusive write lock on target resource. Prevents any other read or write operations until released. | Conflicts with `PESSIMISTIC_EXCLUSIVE` and `PESSIMISTIC_SHARED` | `coder`, `orchestrator` |
| `PESSIMISTIC_SHARED` | Shared read lock. Allows concurrent readers, but blocks exclusive write operations. | Conflicts with `PESSIMISTIC_EXCLUSIVE`. Compatible with concurrent `PESSIMISTIC_SHARED`. | `researcher`, `analyst`, `coder` (read phase) |
| `OPTIMISTIC_CONCURRENCY_CONTROL` | Non-blocking execution on isolated branches/worktrees using base version hash checks upon commit/merge. | No runtime lock held; conflict validated at merge boundary via content hash comparison. | `coder`, `researcher` |

---

## 3. Resource Scope Taxonomy

Resources subject to multi-agent locking are classified by granularity:

1. `FILE_LOCK`
   - **Scope**: Single discrete file path (e.g. `src/services/auth.ts`, `pyproject.toml`).
   - **Default Mode**: `PESSIMISTIC_EXCLUSIVE` for mutating tools (`write_file`, `replace_with_git_merge_diff`).
2. `DIRECTORY_LOCK`
   - **Scope**: Entire filesystem directory subtree (e.g. `src/frontend/components/`).
   - **Policy**: Locks all child paths; rejects acquisition if any child path has an active conflicting lock.
3. `SHARED_RESOURCE_LOCK`
   - **Scope**: Singleton repository/host environment primitives:
     - `GIT_INDEX_LOCK`: Prevents concurrent git staging, committing, or branch checkouts.
     - `PACKAGE_LOCKFILE_LOCK`: Restricts simultaneous modifications to `package-lock.json`, `Cargo.lock`, `poetry.lock`, or `pnpm-lock.yaml`.
     - `PORT_BINDING_LOCK`: Prevents port collisions for sandboxed preview servers or test runners (e.g. `:3000`, `:8080`).
     - `DATABASE_SCHEMA_LOCK`: Guards migration runs and temporary database states.

---

## 4. Lease Duration, Heartbeats & Orphaned Lock Reclamation

To prevent deadlocks from crashed, disconnected, or timed-out subagents:

1. **Default Lease TTL**:
   - Standard file/directory lock: `60 seconds`.
   - Shared resource lock (e.g. git commit/package install): `120 seconds`.
2. **Heartbeat Renewal**:
   - Subagents actively executing a long-running batch must emit heartbeat renewals every `20 seconds`.
   - If no heartbeat is received within 2x interval, the lock state transitions to `EXPIRED`.
3. **Automated Reclamation**:
   - The CHAD runtime lock manager automatically reclaims expired locks.
   - When a subagent encounters `MAX_BUDGET_REACHED` or `SAFETY_TRIGGERED`, all held locks are immediately released by the runtime supervisor.

---

## 5. Deadlock Prevention & Hierarchical Lock Ordering

To guarantee deadlock-free multi-agent execution:

1. **Hierarchical Lock Ordering**:
   - Subagents requiring multiple locks must acquire them in strict lexicographical order by normalized canonical URI:
     `SHARED_RESOURCE_LOCK` -> `DIRECTORY_LOCK` -> `FILE_LOCK` (ordered by path string).
2. **Atomic Multi-Acquisition**:
   - Multi-resource requests are evaluated atomically; if any resource cannot be locked, all partially acquired locks in the request batch are released immediately.
3. **Wait-For Dependency Graph & Timeout**:
   - The lock manager maintains a directed acyclic graph (DAG) of active lock holders and waiters.
   - Acquisition timeout is capped at `15 seconds`. If acquisition fails after 3 exponential backoff attempts, the subagent yields with `CONCURRENCY_CONTENTION_BLOCKED`.

---

## 6. Conflict Resolution & Merge Arbiter

When two subagents operate under `OPTIMISTIC_CONCURRENCY_CONTROL` or when concurrent edits produce conflicting changes:

1. **Clean Rebase Rule**:
   - The second-finishing agent must rebase against the verified output of the first-finishing agent.
2. **Disjoint AST Merge**:
   - If modifications affect non-overlapping Abstract Syntax Tree (AST) nodes or lines without syntactic overlap, automated structural merge is permitted.
3. **Overlapping Diff Escalation**:
   - If diffs overlap or semantic conflicts arise, automated merging is prohibited.
   - The subagent must abort its batch, label the collision `CONFLICT`, and escalate to the Orchestrator.
   - The Orchestrator re-serializes the subtasks or requests a human checkpoint if intent is ambiguous.

---

## 7. Concurrency Telemetry Schema

All lock acquisitions, renewals, releases, and contention events emit structured audit telemetry:

```json
{
  "trace_id": "tr-20250330-conc-001",
  "orchestrator_id": "orchestrator-main",
  "agent_id": "coder-alpha",
  "resource_id": "src/core/auth.ts",
  "resource_scope": "FILE_LOCK",
  "lock_mode": "PESSIMISTIC_EXCLUSIVE",
  "event": "ACQUIRED | RENEWED | RELEASED | CONTENTION_REJECTED | EXPIRED_RECLAIMED",
  "lease_duration_sec": 60,
  "contention_details": null,
  "timestamp": "2025-03-30T12:00:00Z"
}
```

---

## 8. CHAD & LapisLLM Runtime Compatibility

### CHAD Runtime Layer
- CHAD implements the runtime lock manager, intercepting file system mutation tools (`write_file`, `replace_with_git_merge_diff`) and shell execution tools to ensure lock acquisition.
- CHAD enforces lease timeouts and automatically reclaims locks when a subagent terminates or transitions stop conditions.

### LapisLLM Model Layer
- LapisLLM respects concurrency scopes in orchestration planning, generating parallel subtask assignments that partition files into disjoint sets.
- When generating parallel batch plans, LapisLLM includes resource ownership declarations in the subtask prompt.
