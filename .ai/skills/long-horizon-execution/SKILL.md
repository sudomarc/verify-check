# Long-Horizon Execution Skill

This skill defines operational procedures for executing long-horizon, multi-session engineering tasks in the CHAD + LapisLLM ecosystem.

## Core Directives

1. **Multi-Session Continuity**: Maintain persistent task state using `.ai/contracts/long-horizon-task.contract.md` and `.ai/templates/long-horizon-task.md`.
2. **Context Compaction**: Perform state compaction before crossing milestone boundaries or exceeding context budgets.
3. **Failure Recovery**: Resume safely from recorded checkpoints by reconciling stored task state against real repository evidence.
4. **Token & Budget Guard**: Track token burn and cost metrics across session iterations.

---

## Operating Procedure

### Phase 1: Task Initiation & Breakdown
1. Initialize task state record (`.ai/templates/long-horizon-task.md`).
2. Decompose objective into discrete, verifiable milestones.
3. Assign initial budget caps (allocated tokens, maximum sessions, cost caps).

### Phase 2: Milestone Execution & Artifact Logging
1. Execute current milestone using the standard operating loop (INSPECT → PLAN → IMPLEMENT → VERIFY).
2. Write intermediate research or code handoff artifacts to designated artifact paths (`.ai/artifacts/` or task workspace).
3. Record verified results and evidence in the task state file.

### Phase 3: Compaction & Checkpoint Persistence
1. Trigger context compaction when:
   - Milestone completed;
   - Active session tokens reach 80% capacity;
   - Cross-agent handoff is required.
2. Compact trajectory into state snapshot:
   - Retain: Goal, verified facts, decisions, remaining milestones, open risks.
   - Evict: Raw file dumps, full tool outputs, obsolete trajectory history.
3. Save active checkpoint.

### Phase 4: Resume & Reconciliation
When resuming an existing long-horizon task:
1. Load active checkpoint state.
2. Inspect current filesystem and Git state (`git status`, file checks).
3. Reconcile differences between checkpoint state and live repository evidence.
4. Resume execution from the first incomplete milestone.

---

## Escalation & Stop Conditions

- `MAX_BUDGET_REACHED`: Halt execution if session or token budget is exhausted.
- `GOAL_BLOCKED`: Pause if unresolvable architectural ambiguity occurs across sessions.
- `SAFETY_TRIGGERED`: Abort immediately if privilege escalation or secret leakage is detected during execution.
