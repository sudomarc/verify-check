# Self-Improvement Metrics

Metrics are descriptive signals, not success guarantees.

## Core counters

| Metric | Meaning |
|---|---|
| `observation_count` | Persisted learning observations recorded. |
| `recurrence_count` | Repeated instances linked to an observation or pattern. |
| `proposal_count` | Improvement proposals created. |
| `accepted_count` | Proposals explicitly approved/applied. |
| `rejected_count` | Proposals rejected with a recorded reason. |
| `reverted_count` | Applied changes later reverted. |
| `regression_count` | Post-change regressions detected. |
| `confirmed_improvements` | Changes whose target signal improved with supporting evidence. |

## Agent economics signals

| Metric | Meaning |
|---|---|
| `input_tokens_total` | Total model input tokens observed for a task/session. |
| `cached_input_tokens` | Input tokens reported as served from cache, when available. |
| `output_tokens` | Model output tokens, including reasoning where the provider bills/reports it as output. |
| `reasoning_tokens` | Provider-reported reasoning tokens, when exposed separately. |
| `tool_calls` | Number of tool invocations. |
| `tool_result_tokens` | Tokens entering model context from tool results, when measurable. |
| `retry_count` | Repeated attempts after failures. |
| `compaction_count` | Context compaction/pruning operations. |
| `subagent_count` | Delegated agents used. |
| `estimated_cost` | Provider-reported or calculated cost; label source and uncertainty. |
| `cost_per_verified_success` | Cost divided by tasks that reached the defined verified outcome. |

These metrics should be interpreted together. Lower token usage is not an improvement if retries, defects, or verification failures increase.

## Before / after

When a measurable signal exists, record:

```text
Metric: repeated verification failures
Window: 2026-09-01 → 2026-09-08
Before: 12
Change: verification reference corrected
After: 4
Status: CONFIRMED
Evidence: test/run records linked from the outcome
```

Do not claim improvement from anecdotal impressions alone.

## Outcome states

- `CONFIRMED` — post-change evidence supports the intended improvement and no material regression was found.
- `PARTIALLY_CONFIRMED` — some evidence improved, but the target is not fully established.
- `INEFFECTIVE` — the target signal did not improve enough to support the proposal.
- `REVERTED` — the change introduced unacceptable regression or otherwise failed its contract.
- `AWAITING_EVIDENCE` — the change has been applied but the measurement window is not yet sufficient.

## Anti-gaming rules

Never optimize these counters directly. Do not create observations, proposals, or confirmations solely to increase a metric. A metric is useful only when the underlying evidence and sampling window are explicit.

For low-volume repositories, prefer qualitative evidence with clear limitations rather than manufacturing a numerical trend from too little data.
