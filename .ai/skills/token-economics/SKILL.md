---
name: token-economics
description: Use when an agent task can create significant context, tool, model, retry, delegation, or long-horizon token cost. Controls context loading, tool-result size, retries, compaction, model/effort routing, delegation, and cost measurement without weakening verification or safety.
---

# Token Economics

## Purpose

This skill operationalizes the repository's always-on token-economy invariant.

Optimize for the lowest reasonable token and monetary cost that still achieves a verified outcome. The target is not minimum tokens at any cost; it is maximum useful information and verified progress per unit of budget.

## Core Rules — ALWAYS ON

These rules apply whenever this skill is loaded; the compact invariant in core policy applies even when this skill is not loaded.

1. Load the minimum sufficient context for the current decision.
2. Discover before retrieving; search before reading large files.
3. Prefer bounded reads, targeted excerpts, filtering and pagination over full outputs.
4. Keep stable instructions and reusable context stable when the host/provider supports prompt caching.
5. Keep volatile state and task-specific material after stable context.
6. Compact or prune stale, redundant or superseded trajectory state when it no longer adds decision value.
7. A tool result should be small enough to support the next decision; retrieve details on demand.
8. Do not retry an unchanged failure. A retry requires new evidence, a new hypothesis, or a changed condition.
9. Delegate only when the subtask has independent value or materially reduces context complexity.
10. Route low-risk bounded work to an appropriately capable lower-cost model/effort when the host supports routing.
11. Never weaken tests, security, safety, or required verification merely to save tokens.
12. Measure token/cost efficiency from provider telemetry when available; otherwise label estimates as estimates.
13. For bounded-output model calls, prefer an explicit provider-side output-token cap. Choose the cap from the task's expected output plus safety margin; do not use an artificially small global cap that causes truncation or retries.

## Output Budgeting

Use an explicit output budget when the provider/API exposes one and the expected completion is bounded.

- OpenAI-style APIs: use the provider's output-token field such as max_output_tokens when supported.
- Anthropic-style Messages API: use max_tokens as the maximum output budget; it is an API request parameter and should be sized to the task.
- Other providers: use the documented equivalent rather than inventing a generic parameter.

The purpose is to bound worst-case generated output and control cost variance. Do not claim that omitting the field causes a hidden limiter or that the API throws away tokens. Usage accounting, reasoning-token behavior, tool-use consumption, and billing semantics remain provider-specific.

Do not set a low blanket cap across all tasks. Increase the cap for code generation, migrations, long-form analysis, or other tasks where truncation would create retries or incorrect output. Prefer an appropriate cap over no cap when a reasonable upper bound is known.

## Claude Fable 5 adaptation

When the runtime model is Claude Fable 5, use `references/providers/fable-5.md` for the model-specific policy. In particular: start routine bounded work at `medium` or `low` effort; keep tool results and trajectory state bounded; preserve cacheable prefixes; avoid unnecessary subagents and rereads; and use context editing/compaction/tool search/programmatic tool calling when the host exposes them. Do not trade verification for token savings.

## Context Budget
### Context-sprawl guardrails

Input/context consumption is a budget, not free background.

1. Use HOT/WARM/COLD context classification and retrieve only HOT context first.
2. Prefer search, metadata, exact matches, line ranges, pagination and bounded summaries over broad reads.
3. Do not repeat unchanged reads or pass unchanged large results through multiple steps.
4. Set practical tool-result bounds whenever the tool exposes them; otherwise narrow the query before execution.
5. After any unusually large result, retain only the facts needed for the next decision and compact/prune stale raw context.
6. For substantial implementation, prefer one inspection batch, one implementation batch and one verification batch unless evidence requires another.
7. Avoid delegating duplicate rereads. A delegate must contribute independent information, execution, or isolated expertise.
8. Treat prompts, handoffs and reports as data transfer: use references/pathnames and concise state summaries instead of embedding source text already available to the agent.
9. When context growth is driven by repeated tool output, fix the retrieval pattern before adding model effort, retries or extra agents.
10. An output-token cap cannot compensate for excessive input context. Optimize input, tool results, reasoning effort, caching and retries independently.


Classify the task as MICRO, STANDARD, DEEP, or LONG_HORIZON.

Use the smallest context class that can safely support the task's risk and ambiguity. Increase it only when evidence requires broader reasoning.

Preferred retrieval order:

structure → search → targeted excerpt → full file → broader repository

Do not read the whole repository merely to establish a fact available from a smaller query.

## Tool Budget

Before calling a tool, ask:

- What exact information is needed next?
- Can the tool return a bounded result?
- Can repeated calls be combined safely?
- Can filtering happen before results enter model context?

Prefer tool interfaces that support:

- path/file filters;
- symbol or text search;
- line ranges;
- pagination;
- concise/summary modes;
- server-side filtering;
- aggregation before return.

## Trajectory Control

Treat old tool results, repeated file reads, stale hypotheses, and completed investigation branches as candidates for pruning or compaction.

Preserve:

- task objective;
- confirmed facts;
- decisions;
- current repository state;
- unresolved failures;
- verification evidence;
- exact next actions.

Do not preserve historical chatter merely because it was previously in context.

## Delegation Economics

A subagent is justified when its independent context or specialty creates net value.

A useful mental model is:

delegation value = independent information gain + context isolation - orchestration cost

Do not launch reviewers that will simply reread the same files and repeat the same analysis.

Give delegates exact scope, inputs, permissions, expected output and stop conditions.

## Model / Effort Routing

Use the smallest model and reasoning effort that is suitable for the task's risk and ambiguity.

Typical low-cost candidates:

- classification;
- extraction;
- bounded search;
- formatting;
- simple test interpretation;
- concise documentation changes.

Reserve stronger models/effort for:

- ambiguous debugging;
- architecture;
- difficult migrations;
- security-sensitive decisions;
- high-impact integration failures;
- tasks where lower-cost attempts demonstrably fail.

Never equate cheaper with better. Optimize verified outcome per cost.

## Retry Budget

Track retries separately from ordinary steps.

When the same command/result repeats without a changed hypothesis, stop and diagnose.

A retry is justified only when at least one of these changes:

- hypothesis;
- input;
- code/environment;
- tool/provider;
- diagnostic scope.

## Compaction

Compact before the context becomes unreliable, not only after an overflow.

When compacting, preserve decision-bearing state and discard low-value history. Record a handoff for long-horizon work.

Compaction is lossy; re-read source files when exact syntax or evidence is required.

## Verification

Cost optimization is subordinate to verification.

Do not skip regression tests, remove a safety check, lower evidence requirements, suppress an important error, or claim completion without verification solely to reduce token consumption.

## Measurement

When usage telemetry exists, capture:

- input tokens;
- cached input tokens;
- output tokens;
- reasoning tokens, when exposed;
- tool calls;
- tool-result tokens, when exposed;
- retries;
- compactions;
- subagents;
- estimated or provider-reported cost;
- verified outcome.

Useful derived signals include:

- cache_hit_ratio;
- avoidable_context_tokens;
- redundant_tool_calls;
- retry_ratio;
- delegation_overhead;
- cost_per_verified_success.

These are diagnostic signals, not quality guarantees.

## Provider Neutrality

Do not hard-code a current price into core governance. Provider pricing, model aliases, caching semantics, context limits and billing fields change.

Keep provider-specific facts in references/providers/ and verify them against current official documentation before making financial claims.

## Output Discipline

Agent reports should prefer compact evidence:

Status / Changed / Verified / Not Verified / Cost Signals / Next

Do not repeat repository context, tool output, or prior reasoning. Use the smallest output that completely satisfies the requested deliverable. Expand only when the task explicitly requires depth, explanation, or a full artifact.
