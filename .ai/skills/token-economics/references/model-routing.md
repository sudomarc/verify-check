# Model and Effort Routing

## Principle

Model choice is an economic and quality decision.

Route by task characteristics:

| Task | Default routing intent |
|---|---|
| extraction / classification | low-cost capable model |
| bounded search / summarization | low-cost capable model |
| simple local fix | low-to-medium effort |
| ordinary feature | medium effort |
| ambiguous debugging | higher effort |
| architecture / migration | high effort |
| security-sensitive reasoning | high-quality model and explicit verification |

These are routing intentions, not universal model assignments.

## Adaptive escalation

Start with the least expensive configuration that can safely answer the task.

Escalate when evidence shows:

- insufficient reasoning;
- repeated failed attempts;
- unresolved ambiguity;
- high-risk consequences.

When escalating, pass a compact handoff rather than the entire discarded trajectory when possible.

## Cost correctness

Never compare providers using list price alone. Consider:

- cached-input pricing;
- output pricing;
- reasoning billing;
- context limits;
- tokenizer differences;
- tool-call charges;
- rate limits;
- batch/flex modes;
- actual success and retry rates.

Provider pricing and capabilities change; verify current official documentation before routing on price.

## Claude Fable 5

For Fable 5, treat effort as the primary cost/latency control: use `medium`/`low` for routine bounded work, `high` for normal complex work, and `xhigh`/`max` only when additional reasoning is likely to change the verified outcome. Fable 5 can over-invest in routine work at high effort, including extra context gathering and deliberation. Use the dedicated provider profile for cache-sensitive controls and long-run trajectory management.
