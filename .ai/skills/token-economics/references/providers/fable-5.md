# Claude Fable 5 — Token-Economy Profile

## Scope

Use this profile when the runtime model is Claude Fable 5. It supplements the provider-neutral token-economy rules; it does not replace correctness, security, safety, scope, authorization, or verification requirements.

## Why Fable 5 needs explicit cost control

Claude Fable 5 is optimized for long-running agentic work and can spend substantial effort gathering context, calling tools, reasoning, and self-verifying. On routine work at high effort it can do more investigation or deliberation than the task needs.

For Fable 5, optimize the whole agent trajectory rather than visible answer length:
- context loaded;
- tool definitions and tool results;
- thinking/effort;
- retries;
- subagents;
- compaction;
- final output.

## Fable 5 operating rules

1. **Choose effort deliberately.**
   - Use `medium` or `low` for routine bounded work when quality holds.
   - Use `high` for normal complex work.
   - Use `xhigh` or `max` only when additional reasoning is likely to change the verified outcome.
   - Treat effort as a behavioral control, not a hard token budget.

2. **Keep the trajectory small.**
   Search first, then read targeted lines, then related tests/docs, then full files only when necessary. Do not preload the repository or repeat established context.

3. **Control tool-result volume.**
   Filter, aggregate, paginate, grep, or bound results before they enter model context. Return the smallest evidence set that supports the next decision.

4. **Prefer surgical edits.**
   For small or medium changes, modify the relevant region instead of rewriting whole files. After an edit, use the write result, diff, or focused verification rather than rereading unchanged source.

5. **Act once the evidence is sufficient.**
   Do not re-derive facts already established, reopen settled decisions, or survey alternatives that will not affect the next action.

6. **Keep user-facing output outcome-first.**
   Lead with what changed or what was found. Include supporting detail only when it changes a decision, explains a risk, or is explicitly requested.

7. **Constrain subagents.**
   Fable 5 can dispatch parallel subagents readily. Use them only when they provide independent information or isolate context. Give each a narrow read-only scope where possible and return conclusions, not duplicated repository dumps.

8. **Exploit caching without depending on it.**
   Keep reusable policy, stable project facts, and tool definitions stable at the front of context. Keep live status, logs, test output, timestamps, counters, and hypotheses late. Never assume a cache hit without telemetry.

9. **Do not churn cache-sensitive controls.**
   On Fable 5, changing top-level effort during a cached conversation can invalidate the prompt cache. Prefer choosing effort per workload/session rather than oscillating it between turns when cache reuse matters.
   
   When task-budget support is available, set the task budget once rather than repeatedly mutating a remaining-budget value, because changing cached-prefix content can reduce cache reuse.

10. **Use context controls when exposed by the host.**
    Prefer tool-result clearing/context editing, compaction, tool search, or programmatic tool calling when they materially reduce model-visible intermediate state. Treat compaction as lossy and preserve the decision-bearing state before pruning.

11. **Use memory as a delta log, not a transcript.**
    Store one durable lesson or decision per note, update an existing note when applicable, and do not duplicate information already present in the repository or current task state.

12. **Retry only with changed evidence.**
    Do not rerun an unchanged failing action merely because Fable 5 has more effort available. Change the hypothesis, input, environment/provider, or diagnostic scope first.

13. **Never save tokens by weakening verification.**
    Required tests, security checks, safety controls, evidence collection, and final diff review remain mandatory.

## Long-run control

For long-running Fable 5 sessions:
- prefer bounded implementation batches;
- verify after meaningful batches;
- compact or hand off before stale trajectory dominates;
- preserve objective, completion criteria, decisions, changed files, failures, verification, risks, and next actions;
- avoid exposing raw token-countdown mechanics to the model unless the host requires them for control.

## Provider-specific constraints

- Fable 5 uses adaptive thinking; thinking is not simply equivalent to visible response length.
- Effort affects reasoning and can also reduce the number and verbosity of tool calls at lower levels.
- The API supports task budgets as an advisory budget for the full agentic loop when the host exposes that beta feature. Do not treat a task budget as a substitute for `max_tokens` or verification.
- Fable 5 supports a 1M-token context window, but cached context still occupies context-window space.
- Prompt caching can reduce repeated-prefix billing. The current API documentation states a 512-token minimum cacheable prompt for Fable 5.
- Fable 5 does not support per-message effort changes in the same way as newer models; avoid assuming that a mid-conversation top-level effort change preserves cache reuse.

These implementation details are provider/API facts and may change. Re-check the official provider documentation before relying on them for billing, limits, or production configuration.

## Current API facts checked 2026-09-22

- Context window: 1M tokens.
- Maximum output: 128K tokens.
- Prompt-cache minimum: 512 tokens.
- Supported effort levels include `low`, `medium`, `high`, `xhigh`, and `max`.
- Task budgets: API beta feature when exposed by the host; not assumed available in Claude Code or Cowork.

Do not copy these values into permanent cost calculations without rechecking current provider documentation.

## Official references

- Prompting Claude Fable 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
- Effort: https://platform.claude.com/docs/en/build-with-claude/effort
- Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Task budgets: https://platform.claude.com/docs/en/build-with-claude/task-budgets
- Introducing Claude Fable 5 and Claude Mythos 5: https://platform.claude.com/docs/en/models/fable-5/introducing-claude-fable-5-and-claude-mythos-5
- Context management: https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context
