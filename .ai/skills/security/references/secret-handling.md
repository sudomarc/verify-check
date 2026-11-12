# Secret Handling Guidance for Agent Runtimes

## Metadata
- **reference_id**: `agent_secret_handling`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions
- **scope**: Secret classification, lifecycle management, redaction, and boundary isolation for AI agents

---

## 1. Executive Summary

AI agent runtimes execute with broad host access and process diverse data streams. If secrets (API keys, OAuth tokens, SSH credentials, database passwords, signing keys) leak into model prompts, trajectories, logs, or telemetry, the entire system is compromised.

This reference defines secret lifecycle states, zero-logging invariants, automated redaction standards, and explicit trust boundaries between the CHAD agent runtime and the LapisLLM model provider gateway.

---

## 2. Secret Classification Taxonomy

Secrets within the ecosystem are categorized into three risk tiers:

| Tier | Category | Examples | Handling Policy |
|---|---|---|---|
| **Tier 1: Infrastructure & Admin Credentials** | Root keys, AWS access keys, SSH host keys, DB admin passwords | `AWS_SECRET_ACCESS_KEY`, `id_rsa`, `DATABASE_URL` | **NEVER** expose to model prompt context or logs. Host environment injection only. |
| **Tier 2: Agent/Model API Tokens** | Model provider keys, VCS tokens, deployment API tokens | `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `OPENAI_API_KEY` | Managed exclusively by CHAD runtime adapter; strictly hidden from model reasoning space. |
| **Tier 3: Dynamic Runtime Secrets** | Short-lived OAuth tokens, ephemeral session cookies, auth headers | `Bearer eyJ...`, `X-Session-ID` | Masked in tool results; held only in ephemeral memory with bounded TTL. |

---

## 3. Secret Lifecycle States & Invariant Rules

```text
[Host Environment / Secrets Manager]
             │
             ▼
[CHAD Runtime Adapter] ──(Redaction / Masking Boundary)──► [LapisLLM Model Context] (NO RAW SECRETS)
             │
             ├──► [Tool Execution Boundary] (Filtered Parameters)
             │
             └──► [Telemetry / Trace / Audit Logs] (Zero Secrets Invariant)
```

### Invariants Across States
1. **Zero Raw Secrets in Model Context**: Raw Tier 1 and Tier 2 secrets MUST NEVER be injected into the LLM context window (prompt, system prompt, or tool output).
2. **Zero Secrets in Persistence**: Audit logs, execution traces, handoff documents, and agent trajectory files MUST NOT contain raw credentials.
3. **Redaction Prior to Dispatch**: Tool results, stdout/stderr streams, and external API responses MUST be scanned and redacted BEFORE being passed to the model or saved to disk.

---

## 4. Redaction & Masking Standards

All text passing across trust boundaries MUST undergo automated pattern-based secret redaction:

- **Redaction Format**: High-entropy strings matching secret signatures must be replaced with `[REDACTED:<SECRET_TYPE>]` (e.g. `[REDACTED:GITHUB_TOKEN]`, `[REDACTED:GENERIC_API_KEY]`).
- **Standard Signatures**:
  - `sk-[a-zA-Z0-9]{32,}` -> `[REDACTED:MODEL_KEY]`
  - `ghp_[a-zA-Z0-9]{36}` -> `[REDACTED:GITHUB_TOKEN]`
  - `AKIA[0-9A-Z]{16}` -> `[REDACTED:AWS_KEY_ID]`
  - `Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*` -> `[REDACTED:AUTH_BEARER_TOKEN]`

---

## 5. Ecosystem Responsibilities (CHAD & LapisLLM)

### CHAD Agent Runtime
- **Environment Isolation**: Injects secrets into subprocess tool calls (e.g. `git`, `npm`, `pytest`) via environment variables rather than command-line arguments.
- **Output Interception**: Applies regex sanitization to stdout/stderr before recording tool results or building model prompts.
- **Storage Protection**: Ensures `.ai/templates/handoff.md` and local trajectories never capture environment keys.

### LapisLLM Model Gateway
- **Header Masking**: Strips authorization headers from HTTP/gRPC inference logs and trace collectors.
- **Prompt Guard**: Rejects incoming prompt contexts containing unmasked high-entropy credentials.
