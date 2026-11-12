# Multi-Agent Concurrency & Shared Resource Locking Reference

## Metadata
- **reference_id**: `concurrency_and_resource_locking`
- **version**: `1.0.0`
- **contract**: `.ai/contracts/concurrency-lock.contract.md`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions

## Purpose
Provide operational guidelines for agent orchestrators, delegates, and subagents when executing parallel workflows, preventing race conditions on shared workspace files, managing Git indices and package lockfiles, handling deadlocks, and resolving merge conflicts.

---

## 1. Multi-Agent Partitioning Principles

Before delegating parallel tasks, the Orchestrator MUST partition work into disjoint ownership boundaries:

1. **Disjoint Path Partitioning**:
   - Subagent A owns `src/backend/**`
   - Subagent B owns `src/frontend/**`
   - Subagent C owns `docs/**`
2. **Strict Read vs. Write Separation**:
   - If an agent only needs to analyze files, assign `READ_ONLY` permission with a `PESSIMISTIC_SHARED` lock.
   - If an agent must edit files, assign `WORKSPACE_WRITE` with a `PESSIMISTIC_EXCLUSIVE` lock on specific target paths.
3. **Never Parallelize Monolithic State Modifications**:
   - Actions touching global project roots (e.g., `git merge`, package dependency installations modifying lockfiles, root configuration changes) MUST be executed serially by a single agent.

---

## 2. Lock Acquisition Protocol

When a subagent needs to modify workspace files or access shared runtime resources:

```text
Subagent Operation: write_file("src/api/auth.ts")
  │
  ├── 1. Query CHAD Concurrency Lock Manager for "src/api/auth.ts"
  │
  ├── 2. If Resource Free:
  │       ├── Acquire PESSIMISTIC_EXCLUSIVE lock with 60s lease TTL
  │       └── Proceed with write operation
  │
  └── 3. If Resource Locked by Another Agent:
          ├── Check if requester can wait (backoff up to 15s)
          ├── If held by PESSIMISTIC_SHARED and write requested: Wait or fail
          └── If acquisition timeout exceeded:
                └── Emit CONCURRENCY_CONTENTION_BLOCKED to Orchestrator
```

---

## 3. Worktree Isolation & Optimistic Concurrency Control (OCC)

For high-throughput coding tasks where pessimistic locking introduces excessive serialization, use git worktrees:

1. **Dedicated Agent Worktrees**:
   - CHAD creates isolated ephemeral worktrees for subagents:
     - `worktree-coder-alpha` on branch `agent/feature-backend`
     - `worktree-coder-beta` on branch `agent/feature-frontend`
2. **Base Revision Hashing**:
   - Each agent records the base commit hash (`base_commit_sha`).
3. **Merge Gate Validation**:
   - Upon task completion, the Orchestrator inspects the diff.
   - If `base_commit_sha` matches current HEAD, perform fast-forward merge.
   - If HEAD advanced, execute clean rebase:
     - Non-overlapping paths: Auto-rebase and verify tests.
     - Conflicting files: Escalate to Orchestrator with `CONFLICT` label.

---

## 4. Singleton Resource Protections

Certain resources can never be accessed in parallel without risking corruption:

| Singleton Resource | Risk | Mandatory Protection Policy |
|---|---|---|
| Git Working Index (`.git/index`) | Lock conflict / corrupt index | Wrap git commands in `GIT_INDEX_LOCK`. Never run concurrent `git commit` or `git checkout`. |
| Package Lockfiles (`package-lock.json`, `Cargo.lock`) | Lockfile drift / broken checksums | Acquire `PACKAGE_LOCKFILE_LOCK`. Run package installations serially. |
| Test / Dev Server Ports (e.g. `:3000`) | `EADDRINUSE` port collision | Allocate dynamic ephemeral ports or acquire `PORT_BINDING_LOCK`. |
| SQLite / Local DB Instances | Database locked / transaction timeouts | Acquire exclusive database lock or use per-agent isolated database files. |

---

## 5. Deadlock Detection & Recovery Playbook

1. **Deadlock Symptom**:
   - Two or more subagents have been waiting for > 15 seconds on reciprocal locks.
2. **Detection**:
   - CHAD's lock manager detects a cycle in the wait-for graph:
     `Subagent A (holds File 1, waits File 2) <---> Subagent B (holds File 2, waits File 1)`
3. **Automated Recovery**:
   - The lock manager terminates the lock request of the younger subagent (Subagent B).
   - Subagent B receives `CONCURRENCY_DEADLOCK_PREVENTED` stop condition.
   - Subagent B releases any partially held locks, pauses for a randomized backoff (1-3s), and retries or escalates to Orchestrator.
   - Subagent A completes unobstructed.

---

## 6. Audit & Observability Integration

Every lock event must be logged in the execution trace:
- Include `resource_id`, `lock_mode`, `agent_id`, and `trace_id`.
- Surface lock wait latency (`wait_ms`) and lease expiration warnings in the final Orchestration handoff report.
