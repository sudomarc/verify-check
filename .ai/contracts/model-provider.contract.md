# Standard Model & Provider Governance Contract

## Metadata
- **contract_id**: `model_provider_governance`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions

## Purpose
Define a provider-neutral governance contract for model capability metadata, provider health states, multi-provider routing policies, fallback cascades, cost/latency/privacy constraints, and backend interface boundaries across the CHAD + LapisLLM ecosystem.

---

## 1. Model Capability Schema

All model backends and provider gateways (e.g., LapisLLM local HTTP server, Anthropic API, OpenRouter) integrated into CHAD must declare their capabilities using this standardized schema:

```json
{
  "provider_id": "string (e.g. lapis_local, anthropic_direct, openrouter_gateway)",
  "model_id": "string (e.g. lapis-7b-instruct, claude-3-7-sonnet, gpt-4o)",
  "version": "string",
  "context_window_tokens": 128000,
  "max_output_tokens": 8192,
  "supported_features": {
    "tool_calling": true,
    "structured_outputs": true,
    "streaming": true,
    "vision_multimodal": false,
    "prompt_caching": true
  },
  "privacy_tier": "LOCAL_ZERO_DATA_RETENTION | COMPLIANT_CLOUD | PUBLIC_CLOUD",
  "cost_per_1m_input_tokens": 0.0,
  "cost_per_1m_output_tokens": 0.0,
  "p95_latency_ms": 450
}
```

### Privacy Tiers
- `LOCAL_ZERO_DATA_RETENTION`: Model running entirely on local host/on-prem hardware (e.g., LapisLLM local runtime). No data leaves the local execution boundary.
- `COMPLIANT_CLOUD`: Enterprise cloud provider with strict zero-data-retention (ZDR) and data residency guarantees.
- `PUBLIC_CLOUD`: Standard cloud API endpoints subject to vendor terms and potential data logging/retention policies.

---

## 2. Provider Health States

To prevent request failures and cascading timeouts, CHAD tracks model provider health using five canonical health states:

| Health State | Definition | Routing Behavior |
|---|---|---|
| `PRESENT` | Provider endpoint exists and configuration is loaded | Eligible for initial health check probe |
| `CONFIGURED` | Credentials, routes, and API keys are verified | Ready for traffic activation |
| `HEALTHY` | Probe checks pass, error rates < 1%, latency within target | Primary active routing destination |
| `DEGRADED` | Rate limits, elevated error rates (1-10%), or latency spikes | Restricted traffic; candidate for fallback |
| `UNHEALTHY` | Endpoint down, auth failed, high error rate (>10%), or timeout | Immediate circuit breaker trigger; divert traffic to fallback |
| `INACTIVE` | Explicitly disabled or offline | Excluded from routing engine |

---

## 3. Multi-Provider Routing Policy

Routing decisions must be governed by an explicit priority hierarchy that respects user constraints:

1. **Security & Privacy Boundary**: High-sensitivity tasks (e.g., handling secrets or proprietary IP) must route only to `LOCAL_ZERO_DATA_RETENTION` backends unless explicit authorization overrides it.
2. **Feature Prerequisite Gate**: The destination model MUST support all required execution features (e.g., `tool_calling` or `vision_multimodal`).
3. **Health Gate**: Traffic is routed only to `HEALTHY` or `DEGRADED` (with rate-limiting) providers.
4. **Cost & Latency Optimization**: For routine tasks, select the lowest-cost provider meeting latency requirements (e.g. LapisLLM or Sonnet vs Haiku).
5. **Token Budget Cap**: Explicit `max_output_tokens` must be set at the provider gateway boundary for bounded output tasks.

---

## 4. Fallback Cascade & Resiliency Rules

When a primary model endpoint fails or degrades, CHAD's Model Gateway must execute a controlled fallback cascade:

```text
Primary Route (e.g., LapisLLM Local)
       │
       ├─ [HEALTHY] ───────────────► Complete Inference
       │
       └─ [UNHEALTHY / TIMEOUT] ───► Fallback Route 1 (e.g., Compliant Cloud)
                                            │
                                            ├─ [HEALTHY] ───────────────► Complete Inference
                                            │
                                            └─ [UNHEALTHY] ─────────────► Fallback Route 2 (Graceful Degradation)
```

### Fallback Policy Rules
- **No Silent Fallback to Lower Privacy Tiers**: Automatically falling back from a `LOCAL_ZERO_DATA_RETENTION` provider to a `PUBLIC_CLOUD` provider is **prohibited** without prior explicit authorization.
- **Circuit Breakers**: After 3 consecutive failed requests within 60 seconds, mark provider `UNHEALTHY` for a 300-second cooling period.
- **State Preservation**: The prompt context and active step parameters must remain intact when switching to a fallback provider.

---

## 5. Ecosystem Compatibility (CHAD & LapisLLM)

### CHAD Runtime Layer
- CHAD implements the Model Gateway router maintaining provider health states and fallback state machines.
- CHAD enforces cost limits and token budgets (`max_output_tokens`) at the provider adapter layer.
- CHAD records provider metrics (latency, token consumption, cost) in evaluation traces.

### LapisLLM Model Runtime
- LapisLLM exposes standardized `/v1/models` discovery and `/v1/chat/completions` HTTP endpoints matching OpenAI/Anthropic API standards.
- LapisLLM provides model capability metadata (`context_window_tokens`, supported features) via standard HTTP headers or discovery payloads.
- LapisLLM acts as the primary `LOCAL_ZERO_DATA_RETENTION` provider for air-gapped or high-privacy agent workloads.
