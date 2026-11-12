# Flaky Test Handling

First establish whether the failure is deterministic, environment-specific, timing-sensitive, or data-dependent.

Record repeated runs, timing, isolation behavior, and relevant logs. Identify the source of nondeterminism before weakening assertions. A retry loop is not a root-cause fix.

Once fixed, preserve the regression and explain why the test now has deterministic evidence.
