---
name: capability-routing
description: This skill should be used when integrating external CLIs, MCP servers, SaaS providers, browser automation, data sources, or multiple interchangeable backends into an agent-driven project.
---

# Capability Routing Skill

Treat external tools as interchangeable implementation providers behind a stable capability contract (`.ai/contracts/capability-fallback.contract.md`).

A capability layer may discover, provision, configure, health-check and route providers. It should not reimplement or wrap an upstream tool unless translation is required by the application's contract.

References: `.ai/contracts/capability-fallback.contract.md`, `.ai/templates/capability-matrix.md`.

## 1. Model the capability, not the brand

Define the stable user-facing capability first:

- what the agent needs to do;
- required operations and output shape;
- authentication requirements;
- environment requirements;
- acceptable failure behavior;
- security and cost constraints.

Keep provider choice behind the capability boundary.

## 2. Use ordered backends

For capabilities with more than one provider, maintain an explicit ordered list:

`primary → fallback → fallback`

Selection must be based on observed compatibility and health, not merely on package, binary, or configuration existence.

A provider is **active** only after the strongest safe check available for that provider succeeds. Configuration metadata alone is not proof of runtime availability.

When a provider fails, report the failed capability, evidence, current provider, next viable fallback, and remediation path.

## 3. Build a real doctor

For externally backed capabilities, provide a read-only diagnostic path when practical.

The diagnostic should distinguish states such as:

- **ok** — capability is sufficiently verified;
- **warn** — installed/configured but a meaningful prerequisite or authentication state is uncertain;
- **off** — intentionally unavailable or not configured;
- **error** — expected provider exists but is broken or unusable.

Do not execute expensive, state-changing, publishing, posting, purchasing or destructive operations merely to prove a provider works.

Avoid false positives. Do not mark a provider active because a command exists, a config name matches, an SDK imports, or a metadata file mentions the provider.

## 4. Provision safely

Use this sequence:

`INSPECT → DRY RUN → EXPLICIT AUTHORIZATION → PROVISION → VERIFY`

Safe defaults should be read-only where possible. System-wide installs, elevated permissions, firewall changes, credential writes, browser-profile changes and other host mutations require explicit authorization.

Keep tool repositories, caches and configuration in dedicated locations. Do not pollute the application's working directory with downloaded provider repositories, generated configuration, credentials or temporary files.

Prefer user-owned directories and least privilege. Never require `sudo` merely for convenience.

## 5. Respect authentication boundaries

Credentials and browser sessions are security-sensitive capabilities.

- Collect only the minimum credential material required.
- Do not print tokens, cookies, authorization headers or secrets.
- Do not silently read browser profiles or authenticated sessions.
- Do not automate a user's login unless the provider explicitly supports it and the user has authorized that flow.
- Prefer explicit user-provided credentials or an established, user-controlled browser session.
- Verify only the credential state required for the target capability.

Document what data crosses the provider boundary.

## 6. Keep the upstream boundary clean

Prefer calling an upstream CLI, API or MCP server through its public contract.

Do not modify upstream source code just to make an integration easier.

Record provider/version/commit information when reproducibility or incident diagnosis depends on it. Pin moving references when the integration is sensitive to upstream changes; use version constraints when the provider publishes stable releases.

Provider updates should be able to change routing without requiring an architectural rewrite.

## 7. Error taxonomy and recovery

Classify failures instead of returning a generic "failed":

`NOT_INSTALLED | MISCONFIGURED | BROKEN | AUTH_REQUIRED | ENVIRONMENT_RISK | RATE_LIMITED | UPSTREAM_UNAVAILABLE | UNSUPPORTED`

For each failure, provide the smallest safe remediation. Never escalate a provider failure into a destructive recovery step without authorization.

A fallback should be explicit about capability differences. Never silently substitute a weaker or semantically different provider when the difference affects the user's requested outcome.

## 8. Capability verification matrix

For multi-provider integrations, record:

| Capability | Provider | Prerequisite | Health evidence | State | Fallback | Known limitation |
|---|---|---|---|---|---|---|

This matrix should answer "what can work here right now?" rather than "what appears installed?"

## 9. Drift and maintenance

External providers change independently of the repository.

For integrations that depend on volatile upstream behavior:

- track upstream release/changelog signals;
- keep troubleshooting/runbook guidance near the integration;
- add regression tests for known failure modes;
- verify fallback ordering after provider changes;
- distinguish an upstream incident from a local configuration problem;
- prefer one small routing change over rewriting the capability layer.

A scheduled or manually triggered health check can be useful, but it must remain read-only and must not silently mutate user environments.

## Completion gate

Before declaring an external integration complete:

1. The stable capability contract is clear.
2. Provider selection is evidence-based.
3. Health status is distinguishable from mere installation/configuration.
4. Credentials and host mutations respect authorization boundaries.
5. Workspace pollution is avoided.
6. Failure modes have actionable classifications.
7. Fallback behavior is tested when multiple providers exist.
8. Reproducibility/version strategy is documented where upstream churn matters.
9. The final diff and verification evidence are inspected.
