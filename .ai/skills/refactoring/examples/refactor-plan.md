# Example Refactor Plan

Move date-formatting helpers into the existing shared utility module without changing output.

Baseline: run the current tests and inspect usages.

Batches: move helper, update imports, remove duplicate implementation.

Verification: focused helper tests, full affected test suite, type check, final diff review.
