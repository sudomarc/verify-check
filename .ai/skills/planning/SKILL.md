---
name: planning
description: This skill should be used when the task is multi-file, architectural, ambiguous, risky, or requires a deliberate implementation plan before coding.
---

# Planning Skill

## When to Use

Use before implementation for feature work, architecture changes, multi-file refactors, migrations, integrations, security-sensitive changes, or requests with material ambiguity.

## Workflow

1. Read applicable core policy.
2. Inspect repository structure and local instructions.
3. Define the observable outcome.
4. Bound scope and non-goals.
5. Identify affected files and existing patterns.
6. Evaluate architecture and alternatives.
7. Record risks, dependencies, and rollback concerns.
8. Define verification before implementation.
9. Produce the plan.
10. Wait for approval when approval is required.

## Plan Contract

```text
Goal:
Scope:
Non-goals:
Repository evidence:
Files or modules:
Decisions:
Alternatives rejected:
Risks:
Dependencies:
Verification:
Rollback:
Approval:
```

## Rules

Prefer modification of existing architecture over parallel systems. Do not invent APIs, schemas, commands, or deployment assumptions. Search for analogous implementations.

## References

- `references/plan-template.md`
- `references/architecture-checklist.md`
- `references/living-plans.md`
- `examples/feature-plan.md`
