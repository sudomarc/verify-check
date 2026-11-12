---
name: testing
description: This skill should be used when writing, modifying, evaluating, or troubleshooting tests, test coverage, fixtures, mocks, or verification strategy.
---

# Testing Skill

Choose the narrowest test that proves the behavior, then add broader tests when integration risk requires them. Test behavior and invariants rather than implementation details. Keep fixtures deterministic and easy to understand. Avoid tests that pass while important behavior is unexercised.

For failures, preserve the exact reproducer. For flaky tests, characterize the flake before weakening the assertion.

References: `references/test-strategy.md`, `references/flaky-tests.md`, `examples/test-plan.md`.
