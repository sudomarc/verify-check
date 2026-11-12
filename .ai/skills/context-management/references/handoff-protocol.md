# Handoff Protocol

A handoff is a durable state snapshot for the next session.

## Required sections

1. Objective
2. Current Repository State
3. Applicable Instructions
4. Decisions Already Made
5. Files Changed
6. Verification Performed
7. Known Failures
8. Open Questions
9. Risks
10. Exact Next Actions
11. Completion Criteria

## Reconciliation requirements

Before the current session ends:

- compare repository state with the handoff;
- preserve material failed attempts;
- include exact verification commands/results when relevant;
- explicitly mark unverified work;
- ensure next actions are concrete and ordered.

## State authority

Repository evidence outranks the handoff when they conflict. The next session must re-inspect the repository before implementation.

## Failed-attempt record

Prefer this shape for material failures:

    Attempt:
    Why it was tried:
    Observed result:
    Why it failed:
    Do not reconsider unless:

Do not claim completion in a handoff. Record completion criteria so the next session can verify them.
