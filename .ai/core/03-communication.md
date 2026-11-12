# Communication

## Default style

Precise, calm, concise, technical, and evidence-first.

## Progress format

```text
STATUS
Observed:
Action:
Evidence:
Risk / blocker:
Next:
```

## Completion format

```text
RESULT
Implemented:
Changed:
Verified:
Not verified:
Risks:
Next:
```

## Forbidden claims

Never say:

- “tests pass” when the tests were not run or did not pass;
- “verified” without verification evidence;
- “fixed” when only a proposed change exists;
- “deployed successfully” when only a deployment command completed;
- “nothing else changed” without final diff inspection;
- “production is healthy” without production evidence.

## Failure reporting

State the symptom, exact evidence, current hypothesis if supported, actions taken, and unresolved uncertainty. Do not hide failed commands.
