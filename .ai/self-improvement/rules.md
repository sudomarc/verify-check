# Self-Improvement Governance Rules

## Purpose

Self-improvement makes recurring lessons reusable without allowing an agent to rewrite its own authority.

## Classification

Every candidate signal must be treated as one of:

- `ONE_OFF_FAILURE` — no demonstrated recurrence;
- `RECURRING_FAILURE` — repeated evidence with a plausible common cause;
- `SYSTEMIC_FAILURE` — evidence indicates a framework-level weakness affecting multiple workflows or cycles.

Classification is evidence-based and may be revised when new evidence arrives.

## Change hierarchy

Prefer the smallest effective intervention:

`LOCAL FIX → SKILL / REFERENCE / TEMPLATE FIX → WORKFLOW FIX → CORE GOVERNANCE REVIEW`

A local failure is not evidence that global policy should change.

## Allowed Automatically

An agent may record observations and propose improvements. It may apply a non-governance change only when the current task or automation explicitly authorizes implementation and the change remains within the existing governance boundary.

## Approval Required

Explicit human approval is required before changing or materially weakening:

- `.ai/core/` governance rules;
- security or safety boundaries;
- verification requirements or verification authority;
- instruction precedence;
- provider trust boundaries;
- permissions or destructive-operation policy;
- privacy, confidentiality, or data-retention rules;
- limits on autonomous authority;
- controls intended to prevent silent or irreversible changes.

For unattended automation, these changes must remain proposals. They must not be applied to the default branch.

See `references/governance-approval-workflow.md` for complete human checkpoint triggers, permission matrices ($L0 - L4$), pull request review workflows, and anti-self-authorization invariants.
See `references/failure-clustering-and-skill-eval.md` for failure clustering requirements and skill effectiveness metrics.

## Evidence Requirement

Every proposal must identify:

- observation IDs and concrete evidence;
- recurrence/frequency;
- affected scope and files;
- root-cause hypothesis;
- alternative explanations when material;
- expected benefit;
- risks and regression risk;
- validation plan;
- confidence;
- approval requirement.

Confidence is evidence quality, not authorization. Confidence is evidence quality, never authorization to change governance.

## Anti-Drift Rule

If a proposal conflicts with a higher-priority instruction, broadens scope without evidence, weakens a safety or verification control, or cannot be meaningfully validated, reject it rather than adapting governance to fit the failure.

## Anti-Gaming Rule

Do not create observations, proposals, approvals, or confirmations solely to improve metrics. Metrics summarize evidence; they are not optimization targets.

## Rollback

If post-application checks expose a material regression, mark the proposal `REVERTED` or `REJECTED`, restore the previous behavior through the normal review process, and record the evidence. Never rationalize a regression as a successful learning outcome.