---
name: review
description: This skill should be used before declaring implementation complete, before committing, before opening a pull request, or when performing a focused code review.
---

# Review Skill

## When to Use

Review the final diff after implementation and after material fixes. Use focused review dimensions when risk justifies them.

## Workflow

1. Inspect repository status.
2. Inspect the full diff.
3. Check scope against the plan.
4. Check correctness and edge cases.
5. Check tests and error handling.
6. Check security and compatibility.
7. Check maintainability and simplicity.
8. Run targeted verification for findings.
9. Report only actionable findings with evidence.

## Finding Format

`Severity | Confidence | File:Line | Problem | Evidence | Suggested action`

Severity describes impact. Confidence describes evidentiary strength. Do not use confidence as a substitute for severity.

## References

- `references/self-audit-checklist.md`
- `references/diff-review-guide.md`
- `examples/review-report.md`
