---
name: model-governance
description: >-
  Use when configuring model providers, establishing LLM routing policies, setting up health probes, managing fallback cascades, or auditing model backend contract compliance across CHAD and LapisLLM.
---

# Model & Provider Governance Skill

## When to Use

Use when:
- Integrating or updating model providers (LapisLLM local, Anthropic API, OpenRouter, etc.) in CHAD.
- Defining routing rules based on cost, latency, privacy, or required capabilities (tool calling, vision, streaming).
- Configuring fallback rules and circuit breakers for multi-provider resilience.
- Evaluating model execution quality, latency, or contract adherence.

## When Not to Use

Do not use to write model training scripts or implement low-level C++/CUDA kernels for LapisLLM, or to build custom frontend UIs.

## Workflow

1. **Capability Inspection**: Inspect model capability metadata against task requirements (`context_window_tokens`, `tool_calling`, `vision`, `privacy_tier`).
2. **Health Check Probe**: Verify provider health state (`PRESENT` → `CONFIGURED` → `HEALTHY`).
3. **Route Selection**: Apply the multi-provider routing hierarchy (Privacy Gate → Feature Gate → Health Gate → Cost/Latency Optimization).
4. **Budget Enforcement**: Attach explicit token output caps (`max_output_tokens`) and track cost budgets before dispatch.
5. **Fallback Cascade Handling**: Monitor response headers and status codes. On error or timeout, trigger circuit breaker and execute authorized fallback.
6. **Telemetry & Verification**: Log execution metrics (latency, token usage, provider ID, model ID, error state) into evaluation traces.

## Provider Health State Rules

- **PRESENT**: Endpoint configuration loaded; reachability unknown.
- **CONFIGURED**: API keys or socket endpoints validated.
- **HEALTHY**: Probe request succeeded; latency < target P95; error rate < 1%.
- **DEGRADED**: Transient errors (1-10%) or latency exceeding P95. Restrict load.
- **UNHEALTHY**: HTTP 5xx errors, auth failures, or timeout > threshold. Trip circuit breaker.

## Decision Matrix for Model Selection

| Task Type | Target Model Tier | Primary Provider | Privacy Constraint |
|---|---|---|---|
| Privacy-sensitive IP / Code Edits | Local / Private | LapisLLM Local (`LOCAL_ZERO_DATA_RETENTION`) | Strict Local Only |
| High-complexity Reasoning / Arch | Frontier Cloud | Claude Sonnet / Fable (`COMPLIANT_CLOUD`) | Compliant Cloud |
| Fast Routine Subtasks / Search | Small / Fast | Haiku / Lapis Small (`COMPLIANT_CLOUD` or `LOCAL`) | Standard |

## Safety & Security Boundaries

- **Zero Silent Data Retention Downgrade**: Never fallback from `LOCAL_ZERO_DATA_RETENTION` to a public cloud provider without user permission.
- **Credential Masking**: Keep provider API keys, tokens, and endpoints out of workspace files, git commits, and logs.
- **Token Output Caps**: Always pass explicit provider-native `max_tokens` / `max_output_tokens` controls to prevent unbounded generation costs.

## Reference Files

- Contract: `.ai/contracts/model-provider.contract.md`
- Contract Testing: `.ai/skills/model-governance/references/contract-testing.md`
- Report Template: `.ai/templates/model-evaluation-report.md`
