---
name: verification
description: >-
  Use when deciding whether a change is actually verified, selecting evidence, validating completion, or reporting residual uncertainty.
---

# Verification Skill

## When to Use

Use before declaring meaningful work complete, after fixing failures, or whenever evidence must be mapped to a requirement.

## When Not to Use

Do not use as a substitute for the domain-specific testing, security, release, or database skill when those provide the required verification procedure.

## Workflow

1. Translate requirements into observable claims.
2. Select the smallest check that can falsify each important claim.
3. Execute the check and preserve concrete evidence.
4. Classify results as verified, failed, skipped, blocked, or inconclusive.
5. Inspect the final diff and repository state.
6. Report residual uncertainty.

## External capability verification

For integrations with multiple backends or external tools, distinguish:

`PRESENT → CONFIGURED → HEALTHY → ACTIVE`

Do not collapse these states.

Use a capability matrix when useful. A provider is active only when the evidence required by its capability contract is satisfied.

Prefer safe, read-only probes. Do not create posts, send messages, purchase anything, modify remote data, or consume scarce quotas merely to prove a provider is reachable.

Test at least one representative operation through the same public interface the application will use when that operation is safe and deterministic.

When a fallback exists, verify the fallback transition with a controlled failure or an isolated test rather than assuming the routing code works.

## Decision Rules

- Verification must match risk.
- A passing narrow test is evidence for that behavior, not universal proof.
- Never substitute model confidence for executed evidence.
- Production health requires production/runtime evidence when claimed.
- External-service health is time-dependent; record the exact provider, environment, date/time when materially relevant.
- Absence of an error from a metadata check is not proof of capability health.

## Checklists

- [ ] Requirements mapped to checks.
- [ ] Relevant commands actually executed.
- [ ] Results inspected.
- [ ] Failures and skipped checks disclosed.
- [ ] Final diff/status reviewed.
- [ ] External capability state distinguished from installation/configuration state when relevant.
- [ ] Fallback behavior verified when relevant.

## Verification

Use the evidence matrix and completion gates. Keep command output, test names, runtime observations, or other reproducible evidence where useful.

## Failure Modes

Test theater, overclaiming, checking the wrong environment, ignoring flaky results, treating absence of errors as proof of correctness, marking installed metadata as healthy capability, and failing to test fallback transitions.

## Reference Files

- `references/evidence-matrix.md`
- `references/completion-gates.md`
- `.ai/templates/capability-matrix.md`

## Examples

- `examples/verification-report.md`
