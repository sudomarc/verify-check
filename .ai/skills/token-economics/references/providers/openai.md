# OpenAI Provider Notes

Verify current details before using them for billing decisions.

Relevant official documentation:

- Prompt caching: https://developers.openai.com/api/docs/guides/prompt-caching
- Models and pricing: https://developers.openai.com/api/docs/pricing
- Agents observability: https://developers.openai.com/api/docs/guides/agents-api/observability
- Compaction: https://developers.openai.com/api/docs/guides/compaction

Implementation implications:

- cached input can materially reduce input cost;
- prompt caching depends on reusable prefixes and provider cache behavior;
- agent and subagent usage should be measured rather than inferred from visible final output;
- compaction is useful for long-running sessions;
- current model pricing and context limits must be treated as volatile data.
