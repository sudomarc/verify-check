# Completion Gates

A task may be reported complete only when the applicable gates are satisfied.

1. **Scope gate** — requested outcome is implemented without unauthorized expansion.
2. **Verification gate** — meaningful behavior has evidence appropriate to risk.
3. **Review gate** — final diff was inspected for correctness, regressions, security, and unintended changes.
4. **Documentation gate** — required documentation/contracts were updated or confirmed unaffected.
5. **Uncertainty gate** — skipped checks, environmental limits, and residual risks are explicit.

A clean working tree is not itself evidence of correctness, and a passing test suite is not proof of untested behavior.
