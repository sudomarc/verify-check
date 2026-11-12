# Provider Matrix

| Host | Durable entry point | Key caveat |
|---|---|---|
| OpenAI Codex | `AGENTS.md` | Verify current discovery and precedence for the exact Codex surface. |
| Claude Code | `CLAUDE.md` plus provider-native skills where supported | Feature/discovery semantics can change; consult current Anthropic docs. |
| ChatGPT coding workflows | Project/repository context plus explicit prompt | Do not assume automatic file discovery identical to Codex or Claude Code. |
| GitHub Copilot | `.github/copilot-instructions.md`, path-specific instructions, prompt files where supported | Support varies by Copilot product/surface; verify current documentation. |
| Generic agent | `MASTER-PROMPT.md` | Portable fallback; task-specific files must be supplied explicitly. |

This matrix describes this repository's adaptation strategy, not vendor endorsement or a guarantee of identical runtime behavior.
