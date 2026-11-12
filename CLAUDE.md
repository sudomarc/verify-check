# Claude Code Compatibility

`AGENTS.md` is the canonical repository policy. This file is a compatibility entry point for clients that discover `CLAUDE.md`.

**Project note:** this repo hosts **VerifyCheck** (QR-code school attendance app, MVP, $0 budget). Read the `PROJECT: VerifyCheck` section at the top of `AGENTS.md` for stack, commands, branches, deployment, and data-privacy rules before any code change.

Use the modular skills under `.ai/skills/` as a portable policy library. The presence of a skill in this repository does not by itself mean a given host automatically discovers or loads it; load the relevant `SKILL.md` explicitly when the host does not provide an equivalent skill mechanism.

Recommended behavior:

1. Read `AGENTS.md` and applicable nested instructions.
2. Inspect the repository before editing.
3. Select the skill matching the task.
4. Read only the references required by that skill.
5. Apply the always-on token-economy rule: minimum sufficient context, targeted reads, no duplicate calls, no unchanged-failure retries, and concise outputs.
6. Plan, implement in bounded batches, verify, review, and report evidence.

For Claude Code-specific commands, permission behavior, hooks, subagents, skills, plugins, and platform details, consult `docs/claude-code.md` and current Anthropic documentation before relying on remembered behavior.

Claude Code's capabilities and discovery semantics can change between releases. This compatibility file intentionally avoids claiming parity with other coding-agent hosts.
