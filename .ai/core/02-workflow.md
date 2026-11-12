# Workflow

## REQUEST

Translate the request into an observable outcome, constraints, and completion criteria.

## UNDERSTAND

Separate facts, assumptions, unknowns, conflicts, and user decisions.

## INSPECT

Inspect status, applicable instructions, repository topology, manifests, target files, tests, tooling, and analogous implementations.

## CLARIFY / ASSUME

Clarify only decisions that materially change the result. Otherwise make the smallest safe assumption and state it.

## PLAN

For significant work, record objective, scope, non-goals, affected files, decisions, dependencies, risks, verification, rollback, and completion criteria. Trivial work may use a one-line plan.

For substantial visual work, the plan must state whether Creative Design Mode is active and, when active, identify the 5+ independent specialist roles that will participate.

## CONTEXT ECONOMY — ALWAYS ON

Apply this during every workflow stage, not only large tasks.

- Use the minimum sufficient context for the next decision.
- Prefer structure/search, targeted lines, filtering, pagination, and bounded results before full reads.
- Reuse unchanged evidence; combine compatible tool calls; never repeat a call without a new information need.
- Escalate context size, model effort, tool breadth, or delegation only when evidence shows the narrower path is insufficient.
- Retry only after a changed hypothesis, input, environment/provider, or diagnostic scope.
- Prune/compact stale history while preserving objective, facts, decisions, failures, verification, risks, and next actions.
- Keep plans, reports, and handoffs concise and non-redundant while still meeting the requested detail.

Token savings never weaken security, safety, authorization, scope, correctness, or required verification.

## PROVIDER / SESSION BOOTSTRAP — MANDATORY WHEN AVAILABLE

When the coding host is Claude Code and authentication is a direct Anthropic API key:

1. Start new projects on claude-sonnet-4-6 unless another model is explicitly justified.
2. Use medium effort for routine work; escalate only when the task warrants it.
3. Leave prompt caching enabled. Claude Code manages it automatically.
4. Prefer a 5m cache TTL by default. Use 1h only when large reusable context is likely to be reused after idle periods; 1h cache writes cost more.
5. Keep model, effort, core instructions and tool configuration stable during a task because cache invalidations can create an uncached rebuild.
6. Use Haiku for simple bounded subagent work when quality is sufficient; avoid agent teams unless the task genuinely benefits from parallel independent contexts.
7. Use /clear between unrelated tasks, /compact at natural boundaries, /usage to inspect spend/cache, and /context to identify context-heavy components.
8. Do not claim cache or cost savings without runtime evidence.

Load docs/claude-code-anthropic.md for the exact current Claude Code/API cost profile and project settings template.

## IMPLEMENT

For Creative Design Mode, implementation starts only after the design brief exists.

Use logical batches. Keep batches independently inspectable and verify after meaningful changes.

## TEST

Choose the smallest meaningful test set for the current batch, then expand coverage when risk warrants it.

## REVIEW

Inspect the diff for correctness, scope, regressions, security, maintainability, compatibility, tests, and documentation.

For Creative Design Mode, include:
- anti-vibe review;
- rendered browser inspection;
- confirmation that the selected design direction and differentiators survived implementation;
- responsive/accessibility/performance checks appropriate to the changed surface.

## VERIFY

Use concrete evidence and distinguish VERIFIED from UNVERIFIED. Never infer successful deployment or production health from a completed command alone.

## DOCUMENT

Update only documentation made stale or required by the change. Record decisions and non-obvious constraints.

For Creative Design Mode, preserve the design brief or equivalent decision record when the design direction is reusable or material.

## REPORT

Use an evidence-first summary: Status, Changed, Verified, Not Verified, Risks, Next.

## Stop conditions

Stop before editing when target location is unknown, a material instruction conflict exists, architecture is insufficiently understood, high-risk authorization is missing, or a required Creative Design Mode design brief has not been completed.
