# Standard Runtime Interface Governance Contract

## Metadata
- **contract_id**: `runtime_interface_governance`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions

## Purpose
Establish a provider-neutral governance contract standardizing the runtime integration interfaces, Model Inference API RPC/REST protocols, Tool Execution RPC boundary, Health & Capability Discovery, Version Compatibility, Change Propagation Workflow, and Integration Incident Runbooks between Vibe Coding Instructions (policy layer), CHAD (agent runtime), and LapisLLM (model server).

---

## 1. Governance Architecture & Interface Boundaries

```text
Vibe Coding Instructions (.ai/contracts/ & .ai/skills/)
  │  (Portable Policy & Contracts)
  ▼
CHAD Agent Runtime
  ├─ Orchestration Engine & State Machine
  ├─ Tool Execution RPC Dispatcher
  └─ Model Gateway Adapter
        │
        ├─ Model Inference Protocol (HTTP / REST)
        ▼
LapisLLM Model Runtime
  ├─ Model Discovery (/v1/models)
  ├─ Chat Inference Server (/v1/chat/completions)
  └─ Local Hardware Acceleration Boundary
```

---

## 2. Model Inference Protocol

All model server endpoints (such as LapisLLM) and provider gateways consumed by CHAD must implement a standard OpenAI/Anthropic-compatible HTTP REST protocol (`model_inference_protocol`):

### 2.1 Chat Completion Request (`POST /v1/chat/completions`)

```json
{
  "model": "lapis-7b-instruct",
  "messages": [
    { "role": "system", "content": "System prompt and contract instructions..." },
    { "role": "user", "content": "User request..." }
  ],
  "temperature": 0.2,
  "max_tokens": 4096,
  "top_p": 0.95,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "read_file",
        "description": "Reads file contents safely",
        "parameters": {
          "type": "object",
          "properties": {
            "filepath": { "type": "string" }
          },
          "required": ["filepath"]
        }
      }
    }
  ],
  "stream": false
}
```

### 2.2 Streaming Event Protocol

When `stream: true` is requested, the model server emits Server-Sent Events (SSE) with standard `data:` JSON payloads containing delta chunks and explicit completion markers:

```text
data: {"id":"chatcmpl-001","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-001","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### 2.3 Context & Token Budget Boundary Signals
- **Explicit Max Output Cap**: CHAD passes `max_tokens` (or `max_output_tokens`) on every completion request to avoid runaway token generation.
- **Context Limit Header**: LapisLLM / Model server returns `x-context-window-tokens` and `x-context-tokens-used` headers on response frames to allow CHAD to trigger compaction before context overflow.

---

## 3. Tool Execution RPC Boundary

Tools invoked by agents executing inside CHAD are executed through a sandboxed Tool Dispatcher (`tool_execution_rpc`) governed by permission controls in `.ai/contracts/tool.contract.md`.

### 3.1 Tool RPC Request Schema

```json
{
  "rpc_version": "1.0",
  "trace_id": "tr-20250330-001",
  "agent_id": "coder-01",
  "tool_name": "write_file",
  "permission_tier": "WORKSPACE_WRITE",
  "parameters": {
    "filepath": "src/utils.py",
    "content": "def add(a, b):\n    return a + b\n"
  }
}
```

### 3.2 Tool RPC Response Schema

```json
{
  "rpc_version": "1.0",
  "trace_id": "tr-20250330-001",
  "status": "SUCCESS",
  "side_effect_class": "REVERSIBLE_FILE_CHANGE",
  "trust_label": "VERIFIED_LOCAL",
  "result": {
    "bytes_written": 32,
    "filepath": "src/utils.py"
  },
  "verification_evidence_ref": "ev-src-utils-written",
  "error": null
}
```

### 3.3 Security & Parameter Redaction Rules
- **Zero Secrets in Parameters**: Tool dispatchers MUST apply redaction filters to sanitize raw credentials or token parameters before logging to audit stores (`.ai/contracts/tool-audit.contract.md`).
- **Permission Elevation Guard**: If `permission_tier` requested exceeds agent role bounds, dispatch MUST abort with `PERM_DENIED` stop condition.

---

## 4. Health & Capability Discovery Protocol

CHAD discovers available model backends and dynamically updates health states through the Capability Discovery protocol (`capability_discovery`).

### 4.1 Discovery Endpoint (`GET /v1/models`)

```json
{
  "object": "list",
  "data": [
    {
      "id": "lapis-7b-instruct",
      "object": "model",
      "created": 1740000000,
      "owned_by": "lapisllm",
      "capabilities": {
        "context_window_tokens": 128000,
        "max_output_tokens": 8192,
        "tool_calling": true,
        "structured_outputs": true,
        "privacy_tier": "LOCAL_ZERO_DATA_RETENTION"
      }
    }
  ]
}
```

### 4.2 Health State Transition Rules
- **PRESENT**: Endpoint discovered during configuration load.
- **CONFIGURED**: Credentials/routes validated via probe `GET /v1/models`.
- **HEALTHY**: Latency < target p95, HTTP 200 on health probe, error rate < 1%.
- **DEGRADED**: Transient 5xx errors (1-10%) or elevated latency.
- **UNHEALTHY**: 3 consecutive failed requests or endpoint timeout (>30s). Triggers fallback cascade.

---

## 5. Version Compatibility Rules

To guarantee stability across independently deployed repositories, Vibe, CHAD, and LapisLLM adhere to strict Semantic Versioning (`version_compatibility`):

| Component | Repository | Version Spec | Major breaking change rule |
|---|---|---|---|
| Policy & Contracts | `vibe-coding-instructions` | SemVer `MAJOR.MINOR.PATCH` | Schema breaking change increments MAJOR |
| Agent Runtime | `CHAD` | SemVer `MAJOR.MINOR.PATCH` | Contract adapter change increments MAJOR |
| Model Server | `LapisLLM` | SemVer `MAJOR.MINOR.PATCH` | REST API breaking change increments MAJOR |

### Compatibility Requirements
- CHAD MAJOR version `N` MUST support Vibe contract MAJOR version `N`.
- LapisLLM REST API version `/v1/` MUST maintain backward compatibility for all minor/patch releases.

---

## 6. Shared Change Propagation Workflow

When a capability, schema, or contract changes, updates propagate across the ecosystem following the 6-step change propagation workflow (`change_propagation`):

```text
Step 1: Contract Proposal
  -> Update Vibe Coding Instructions (.ai/contracts/ & docs/ecosystem-compatibility.md)
Step 2: Model Server Adapter
  -> Update LapisLLM serving capabilities or discovery endpoint metadata
Step 3: Agent Runtime Adapter
  -> Update CHAD Model Gateway adapter and tool dispatcher schemas
Step 4: Integration Verification
  -> Run cross-repository integration test suite and validate contract compliance
Step 5: Ecosystem Matrix Update
  -> Record public capability states in docs/ecosystem-compatibility.md
Step 6: Release Propagation
  -> Publish synchronized release tags across repositories
```

---

## 7. Integration Incident Runbook & Contract-Testing Guidelines

### 7.1 Contract-Testing Protocol
- **Discovery Sanity Check**: Send `GET /v1/models` and assert presence of `capabilities` object and `context_window_tokens`.
- **Inference Probe**: Send a minimal `POST /v1/chat/completions` payload with `max_tokens: 5` and verify response structure.
- **Tool Schema Probe**: Pass a dummy tool definition and assert `tool_calls` structure returned matches JSON Schema specification.

### 7.2 Incident Triage Protocol
1. **Model Timeout / Unhealthy**: Verify LapisLLM process status and GPU memory usage. CHAD Model Gateway automatically diverts traffic to secondary fallback route.
2. **Permission Violation Escalation**: Inspect CHAD tool audit log (`.ai/contracts/tool-audit.contract.md`) for unredacted parameter failures or privilege escalation attempts.
3. **Context Truncation / Overflow**: Check model discovery `context_window_tokens` vs active trajectory size. Force context compaction before resuming run.
