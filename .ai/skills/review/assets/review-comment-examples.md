# Review Comment Examples

These examples demonstrate precise review language.

## Blocking correctness

```text
Severity: high
Location: src/auth/session.ts:84
Finding: The new refresh path accepts a token after its recorded expiry.
Evidence: The comparison only checks the issued-at timestamp.
Action: block until expiry validation is restored.
```

## Blocking security

```text
Severity: critical
Location: scripts/deploy.sh:22
Finding: User-controlled input is interpolated into a shell command.
Evidence: The command is constructed without escaping or an argument array.
Action: block and replace with a safe invocation.
```

## Medium maintainability

```text
Severity: medium
Location: src/config.ts:31
Finding: The new environment variable is read in three locations with different defaults.
Evidence: The diff introduces divergent fallback values.
Action: centralize configuration before declaring complete.
```

## Low scope concern

```text
Severity: low
Location: src/format.ts:4
Finding: This formatting cleanup is unrelated to the requested feature.
Action: remove from the focused diff unless project policy requires it.
```

## Positive verification note

```text
Severity: low
Location: test/api/health.test.ts
Finding: The new test covers the public status contract and failure-free response shape.
Evidence: Focused integration test passes.
Action: none.
```

Review comments should be specific enough that another engineer can reproduce the reasoning from the file and evidence.
