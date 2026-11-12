# OpenRouter — Claude Sonnet 4.x Token-Economy Profile

## Scope

Use this profile when an agent runs Claude Sonnet 4.x through OpenRouter. It supplements the provider-neutral token-economy rules and does not override correctness, security, scope, authorization, or required verification.

## Verified OpenRouter facts — 2026-09-22

- Claude Sonnet 4 is retired by Anthropic as of June 15, 2026. Do not build new Claude Code configurations around it.
- Claude Sonnet 4.6: `anthropic/claude-sonnet-4.6`, $3/M input and $15/M output.
- Sonnet 4.x has a 1M-token context window.
- Anthropic cache reads are $0.30/M; Sonnet 4.x cache writes are 1.25x input for the default 5-minute TTL or 2x for the 1-hour TTL.
- Claude Sonnet 4, 4.5 and 4.6 require at least 1,024 cacheable prompt tokens.
- OpenRouter supports `session_id` up to 256 characters. It is a sticky-routing key for the conversation or agent workflow and should remain stable across turns.
- Cache effectiveness can be checked through `usage.prompt_tokens_details.cached_tokens`, `cache_write_tokens`, and `cache_discount`.
- OpenRouter can route the same model across multiple provider endpoints; sticky routing exists to keep a session on the warm provider and can fall back when that provider is unavailable.

Verify these facts again before using them for a financial calculation because pricing, limits, and provider behavior can change.

## Claude Code + OpenRouter host boundary

When Claude Code is the host, do not assume repository instructions can inject OpenRouter top-level fields such as `session_id`, `cache_control`, or `usage.include` into every request. Use only controls the actual Claude Code/OpenRouter integration exposes and verify them at runtime. Prefer Claude Code's native session/context management and stable instruction prefixes. See `docs/claude-code-openrouter.md`.

## Mandatory project/session bootstrap

For every new project, and again for every new agent workflow inside that project:

1. Detect the active provider, model, and host capabilities.
2. If the runtime is OpenRouter + Claude Sonnet 4.x and request-level controls are exposed:
   - use an explicit `session_id` that identifies the project/workflow unit;
   - keep the same `session_id` for all turns in that workflow;
   - do not generate a new `session_id` on every turn;
   - enable prompt caching;
   - keep reusable content at the start of the request and volatile state after it;
   - enable usage telemetry when the host exposes `usage.include`.
3. If the host exposes Anthropic `cache_control`, prefer a single automatic breakpoint for normal multi-turn conversations:
   `{"type":"ephemeral"}`.
4. Use explicit per-block `cache_control` only when fine-grained caching is needed. Do not add filler text merely to reach the 1,024-token cache minimum.
5. Use the default 5-minute TTL for dense interactive work. Use `ttl: "1h"` only when the workflow regularly pauses long enough to justify the higher write cost.
6. Verify that caching is real. A non-zero `cached_tokens` indicates a cache read; do not claim caching is enabled merely because the request contains a cache setting.
7. If the host cannot expose `session_id` or `cache_control`, do not invent a workaround or claim the optimization is active. Mark it `UNVERIFIED` and still apply context/output/tool minimization.

## Cost control for OpenRouter plugins and tools

OpenRouter distinguishes plugins from model-callable server tools. Plugins run once when enabled; server tools can be called zero or more times.

- Do not enable paid or unnecessary capabilities globally at project start.
- The legacy Web Search plugin (`plugins: [{ "id": "web" }]`) and the `:online` model variant are deprecated. Prefer `openrouter:web_search` only when fresh web information is actually required.
- Bound web search results when the server tool is used. Search-result tokens are additional LLM input.
- Response Healing is documented as free; use it when structured-output repair is materially useful, not by default.
- Context Compression is a fallback for prompts that exceed context limits; it can remove/truncate middle content, so do not use it as a substitute for deliberate context management.
- PDF Inputs should be enabled only when a PDF actually needs to be parsed.
- Fusion / multi-model deliberation is an expensive escalation path. Reserve it for cases where additional independent model analysis has clear decision value.
- Avoid enabling multiple plugins merely because they are available.

## Output and reasoning discipline

When the host exposes output/effort controls:

- Set a bounded completion limit appropriate to the task.
- Prefer the lowest reasoning effort that still produces a verified result for routine bounded work.
- Increase effort only when the narrower attempt is insufficient or the task risk warrants it.
- Do not sacrifice required tests, security checks, or verification to save tokens.

## Cache-friendly prompt layout

Prefer:

1. Stable system/project policy.
2. Stable tool definitions and schemas.
3. Long-lived reference material.
4. Current task instructions.
5. Mutable logs, timestamps, tool results, and run-specific state.

Do not put timestamps, counters, or rapidly changing metadata in the stable prefix.

## Suggested request shape

For hosts using OpenRouter Chat Completions and exposing the relevant fields:

```json
{
  "model": "anthropic/claude-sonnet-4.6",
  "session_id": "project-slug:workflow-id",
  "cache_control": { "type": "ephemeral" },
  "usage": { "include": true },
  "messages": [
    {
      "role": "system",
      "content": "Stable project instructions and reusable context."
    },
    {
      "role": "user",
      "content": "Current task and changing state."
    }
  ]
}
```

This is a capability example, not a guarantee that every host or coding client exposes every field.

## Budget reality for a $5 credit balance

At the listed Sonnet 4.x rates, $5 is not a fixed number of sessions: output tokens, reasoning tokens, uncached context, tool calls, and provider/plugin charges dominate actual spend.

Illustrative arithmetic only:

- $5 / $15 per million output tokens ≈ 333,000 output tokens if output were the only cost.
- $5 / $3 per million fresh input tokens ≈ 1.67 million input tokens if input were the only cost.
- Cached reads are 10% of the base input price, but cache writes cost more than fresh input, so caching pays off through reuse.
- A useful budget must therefore be monitored from real OpenRouter usage rather than converted into a promised session count.

## Official references

- OpenRouter Sonnet 4.6: https://openrouter.ai/anthropic/claude-sonnet-4.6
- Prompt caching: https://openrouter.ai/docs/guides/best-practices/prompt-caching
- OpenRouter plugins: https://openrouter.ai/docs/guides/features/plugins/overview
- Web search server tool: https://openrouter.ai/docs/guides/features/server-tools/web-search
- Chat API reference: https://openrouter.ai/docs/client-sdks/python/api-reference/chat
