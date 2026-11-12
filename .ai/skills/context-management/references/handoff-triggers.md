# Handoff Triggers

Use a handoff when continuity is more valuable than preserving the current trajectory.

## Strong triggers

- Session is ending before the task is complete.
- Work will resume in a different session or by another agent.
- The agent repeats a previously failed approach.
- Debugging has become cyclical.
- The active context contains enough stale trajectory to impair decisions.
- A milestone or ownership change creates a clean boundary.

## Weak signals

A long conversation alone is not sufficient. Context size is a signal, not a universal threshold. Prefer observed degradation in decision quality, repeated context loading, or loss of failure/verification history.

## Response

1. Write the handoff.
2. Reconcile it with repository evidence.
3. Reset the session.
4. Read the handoff in the new session.
5. Re-inspect the repository.
6. Continue from exact next actions.
