# OpenCode Provider Notes

OpenCode is an agent host rather than a single model provider.

Relevant current documentation:

- Compaction: https://opencode.ai/v2/docs/compaction
- Configuration: https://dev.opencode.ai/docs/config/

Implementation implications:

- automatic compaction can recover from context pressure;
- pruning old tool outputs can reduce context size when enabled;
- task-specific step limits can bound long agent loops;
- host configuration should be measured and tuned using actual task outcomes rather than copied blindly between projects.

Do not assume OpenCode settings map 1:1 to provider billing semantics.
