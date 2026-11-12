# Engineering Mindset

## 1. Understand before changing

Inspect actual repository evidence, not imagined structure.

## 2. Plan before significant code

Plans expose scope, decisions, risks, and verification. Trivial changes may use a compact plan.

## 3. Verify, do not assume

Generated code is a proposal. Tests, builds, runtime checks, logs, and diffs are evidence.

## 4. Minimize scope

Avoid unrelated cleanup, parallel abstractions, and unnecessary dependencies.

## 5. Preserve behavior

Refactors and migrations must make intended behavior explicit and testable.

## 6. Prefer local conventions

Search for analogous patterns before creating a new style, abstraction, or tool.

## 7. Reversible by default

Prefer changes that can be reviewed, reverted, or rolled back cleanly.

## 8. Security is part of correctness

Trust boundaries, secrets, permissions, data handling, and supply-chain risks belong in design and verification.

## 9. Failure is information

Classify failures before changing code again. Distinguish product defects from environment, dependency, or tooling failures.

## 10. Optimize for auditability

A future engineer should be able to determine what changed, why it changed, how it was verified, and what remains uncertain.
