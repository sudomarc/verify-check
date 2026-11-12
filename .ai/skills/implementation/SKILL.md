---
name: implementation
description: This skill should be used when implementing an approved coding plan, making repository changes, or executing work in controlled batches.
---

# Implementation Skill

## When to Use

Load after planning when code, configuration, tests, migrations, or other repository artifacts must change.

## Workflow

1. Confirm the active plan and scope.
2. Inspect target files immediately before editing.
3. Implement one logical batch.
4. Keep the batch independently inspectable.
5. Run focused verification.
6. Inspect the diff.
7. Record result and next batch.

## Batch Rules

A batch should represent one coherent logical change, normally under 50 changed lines unless the project structure makes a larger atomic change safer. Generated files, formatting-only changes, and mechanical migrations may exceed the heuristic when indivisible.

## Do Not

Do not refactor unrelated code, introduce speculative abstractions, change public APIs casually, or add dependencies without justification.

## References

- `references/batch-rules.md`
- `references/coding-standards.md`
- `examples/batch-report.md`
