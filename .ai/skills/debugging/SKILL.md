---
name: debugging
description: This skill should be used when a program fails, a test fails, an error is reported, behavior is inconsistent, or a regression must be isolated.
---

# Debugging Skill

## Workflow

1. Reproduce the failure.
2. Capture exact command, input, output, and environment relevant to the failure.
3. Localize the smallest failing surface.
4. Form a falsifiable hypothesis.
5. Run the cheapest test that distinguishes hypotheses.
6. Apply the minimal correct fix.
7. Re-run the original reproducer.
8. Run regression checks.
9. Inspect the diff.
10. Report the evidence.

## Rules

Do not patch by error-message pattern matching alone. Do not change multiple unrelated variables simultaneously when isolating a root cause. Distinguish application defects from environment failures.

## References

- `references/error-report-format.md`
- `references/root-cause-patterns.md`
- `examples/debug-session.md`
