# Anthropic Provider Notes

Verify current details before using them for billing decisions.

Relevant official documentation:

- Context management: https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context
- Pricing: https://platform.claude.com/docs/en/about-claude/pricing
- Tool search: https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool
- Programmatic tool calling: https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling
- Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching/overview

Fable 5 profile: see `fable-5.md` for model-specific token-economy guidance around effort, long-running trajectories, caching, context editing, and tool-result control.

Implementation implications:

- large toolsets can create substantial tool-definition context overhead;
- tool search can reduce upfront tool definitions;
- programmatic calls can keep intermediate results out of model context;
- prompt caching can lower the price of repeated context;
- context editing/compaction should be treated as a controlled information-loss operation.
