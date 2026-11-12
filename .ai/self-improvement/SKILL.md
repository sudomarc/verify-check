---
name: self-improvement
description: Controlled self-improvement for coding agents. Use when recurring failures, repeated friction, user corrections, verification gaps, process weaknesses, stale references, or provider/tooling issues suggest the repository guidance itself should improve. Never use it to silently rewrite governing rules or bypass human authorization.
---

# Self-Improvement

## Purpose

Use this skill to turn evidence from real repository work into bounded, reviewable improvements. The learning loop is a proposal and validation system, not unrestricted self-modification.

## When to Use

Use when there is evidence of:

- repeated task failures or user corrections;
- recurring verification mistakes or CI failures;
- contradictory, stale, or broken instructions/references;
- recurring scope or workflow friction;
- provider/tooling adaptation problems;
- successful patterns that are demonstrably reusable.

## When Not to Use

Do not use it for a one-off implementation bug that can be fixed locally. Do not treat a single failure as proof that global guidance is wrong.

## Operating Model

`OBSERVE → COLLECT → CLUSTER → ANALYZE → CLASSIFY → IDENTIFY ROOT CAUSE → PROPOSE → VALIDATE → APPROVE → APPLY → REGRESSION CHECK → MEASURE → RECORD OUTCOME → POSTMORTEM (IF CRITICAL)`

See `daily-cycle.md` for the periodic execution model.
See `references/failure-clustering-and-skill-eval.md` for repeated-failure clustering, skill effectiveness measurement, and regression-aware skill updates.
See `references/governance-approval-workflow.md` for human checkpoint triggers and governance approval workflows.

## Classification

Use:

- `ONE_OFF_FAILURE` — isolated event with no demonstrated recurrence;
- `RECURRING_FAILURE` — repeated event with a plausible common cause;
- `SYSTEMIC_FAILURE` — evidence indicates a framework-level weakness across multiple workflows or cycles.

Do not promote a one-off event to systemic guidance without evidence.

## Evidence Model

Record evidence separately from reasoning:

- `FACT` — directly established by repository/tool/source evidence;
- `HYPOTHESIS` — tentative root-cause explanation;
- `INTERPRETATION` — conclusion derived from evidence.

Consider alternative explanations when the evidence is incomplete.

## Change Hierarchy

Prefer:

`LOCAL FIX → SKILL / REFERENCE / TEMPLATE FIX → WORKFLOW FIX → CORE GOVERNANCE REVIEW`

A local failure is not a reason to change global policy.

## Governance

Explicit human approval is required before changing or materially weakening:

- `.ai/core/`;
- security or safety boundaries;
- verification requirements or verification authority;
- instruction precedence;
- provider trust boundaries;
- permissions/destructive-operation policy;
- privacy/confidentiality/data-retention rules;
- limits on autonomous authority.

For unattended automation, governed changes remain proposals. Confidence is evidence quality, not authorization.

See `rules.md` for the complete approval contract.

## Memory

Persist durable learning under `.ai/self-improvement/records/`:

- `observations/` — evidence and classification;
- `proposals/` — bounded proposed changes;
- `outcomes/` — post-change measurements and regressions.

The periodic collector's `cycle-report.json` is a transient evidence artifact. Do not treat it as durable memory without review.

## Token and context efficiency

When repeated work shows context bloat, redundant tool calls, unnecessary delegation, retry loops, or avoidable model cost, use `.ai/skills/token-economics/` to measure and propose a bounded improvement. Record observed usage when telemetry exists and distinguish provider-reported values from estimates.

Token optimization is subordinate to correctness, security, safety, verification, scope, and authorization. A cheaper workflow is not an improvement if the verified outcome regresses.

## Verification

Before applying a proposed improvement:

- identify exact affected files and rules;
- inspect applicable instructions and precedence;
- check references and examples;
- run `python3 scripts/validate_instructions.py` when structure/instructions change;
- run relevant tests or focused checks;
- inspect `git diff --check` and the final diff;
- verify the original signal is actually addressed;
- check for contradictions, drift, and weakened controls.

## Outcome

Measure before/after where meaningful. Allowed outcome states include `CONFIRMED`, `PARTIALLY_CONFIRMED`, `INEFFECTIVE`, `REVERTED`, and `AWAITING_EVIDENCE`. Never claim success without supporting evidence.

## Failure Modes

- **Overfitting:** turning one unusual incident into a global rule.
- **Reward hacking:** optimizing superficial success while weakening correctness or safety.
- **Rule drift:** accumulating contradictory guidance.
- **Self-authorization:** treating confidence as permission.
- **Memory pollution:** storing irrelevant or sensitive data.
- **Circular learning:** repeating rejected proposals without new evidence.
- **Regression:** improving one path while breaking another.

## Postmortem Analysis

For any `CRITICAL` severity incident, security boundary breach, severe token burn, or multi-agent cascade failure, execute an agentic postmortem using `.ai/templates/agentic-postmortem.md`. Record root cause decomposition, timeline cascade, token burn variance, and actionable remediation items.

## References

- `rules.md` — governance and approval boundaries.
- `feedback-loop.md` — evidence lifecycle.
- `references/failure-taxonomy.md` — agent failure taxonomy and severity classification.
- `references/failure-clustering-and-skill-eval.md` — repeated-failure clustering, skill effectiveness evaluation, and regression-aware updates.
- `references/governance-approval-workflow.md` — human approval workflows, permission matrices, and checkpoint triggers.
- `daily-cycle.md` — periodic execution and stop conditions.
- `metrics.md` — measurement and outcome semantics.
- `schemas/observation.md` — observation format.
- `schemas/learning-record.md` — learning record format.
- `schemas/improvement-proposal.md` — proposal format.
- `templates/learning-record.md` — reusable record template.
- `templates/improvement-proposal.md` — reusable proposal template.
- `templates/agentic-postmortem.md` — incident postmortem template for agentic system failures.
- `examples/example-cycle.md` — bounded example.
