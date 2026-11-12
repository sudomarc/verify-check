# Safe Shell Patterns

Prefer read-only inspection first.

Safer sequence:

```bash
pwd
printf '%s\n' "$PWD"
git status --short
git diff --check
```

Before deletion, list the target and verify path boundaries. Before bulk mutation, use a dry-run or bounded selection. Quote variables that may contain spaces or shell metacharacters. Avoid executing unreviewed downloaded content.

A safe shell action is not defined by the command alone; it depends on target, context, privileges, and reversibility.
