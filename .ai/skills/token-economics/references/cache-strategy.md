# Cache Strategy Reference

## Goal

Exploit repeated stable context without making correctness depend on a cache hit.

## Stable prefix candidates

- repository policy;
- tool definitions;
- stable project architecture;
- reusable task-independent reference material.

## Volatile suffix candidates

- current user request;
- live Git status;
- current test output;
- logs;
- transient tool results;
- timestamps;
- temporary hypotheses.

## Rules

1. Keep cacheable prefixes byte/token stable when the provider uses prefix-based caching.
2. Do not reorder stable material unnecessarily between requests.
3. Do not put volatile values into the stable prefix unless required.
4. Never assume a cache hit occurred without provider telemetry.
5. A cache hit reduces billing cost where supported; it does not remove the content from the model's context window.
6. Provider cache TTLs, breakpoints, minimums and billing multipliers are volatile. Consult current provider documentation.

## Current official references

- OpenAI prompt caching: https://developers.openai.com/api/docs/guides/prompt-caching
- Anthropic pricing and prompt caching: https://platform.claude.com/docs/en/about-claude/pricing
- Google Gemini pricing and context caching: https://ai.google.dev/gemini-api/docs/pricing
