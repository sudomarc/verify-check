---
name: security
description: This skill should be used when handling authentication, authorization, secrets, untrusted input, cryptography, sandboxing, dependency risk, security findings, or security-sensitive code review.
---

# Security Skill

Threat-model the changed surface. Identify trust boundaries, attacker-controlled input, privilege transitions, secret handling, sensitive data, logging exposure, injection vectors, and failure modes. Prefer established platform security mechanisms over custom cryptography or ad hoc authorization.

Do not claim a system is secure from a narrow test. Report the tested threat surface and residual risk.

References: `references/threat-model.md`, `references/secure-coding.md`, `references/prompt-injection-threat-model.md`, `references/sandbox-requirements.md`, `references/sandbox-escape-testing.md`, `references/secret-handling.md`, `references/permission-escalation-controls.md`, `references/security-review-playbook.md`, `examples/security-review.md`.
