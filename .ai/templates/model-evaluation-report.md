# Model Provider Evaluation & Benchmark Report

## Metadata
- **date**: `YYYY-MM-DD`
- **evaluator**: `CHAD Model Gateway / Benchmark Auditor`
- **environment**: `CI / Local / Production Probe`

---

## 1. Provider & Model Under Test

| Parameter | Value |
|---|---|
| Provider ID | `lapis_local | anthropic_direct | openrouter_gateway` |
| Model ID | `lapis-7b-instruct | claude-3-7-sonnet | gpt-4o` |
| Endpoint / Region | `http://localhost:8080 / us-east-1` |
| Privacy Tier | `LOCAL_ZERO_DATA_RETENTION | COMPLIANT_CLOUD | PUBLIC_CLOUD` |
| Context Window | `128,000 tokens` |

---

## 2. Health & Performance Metrics

| Metric | Measured Value | Target SLA | Status |
|---|---|---|---|
| Health State | `HEALTHY | DEGRADED | UNHEALTHY` | `HEALTHY` | PASS / FAIL |
| TTFT (Time to First Token) | `180 ms` | `< 300 ms` | PASS / FAIL |
| Total Latency (P95) | `650 ms` | `< 1500 ms` | PASS / FAIL |
| Output Tokens / Sec | `42.5 tok/s` | `> 20 tok/s` | PASS / FAIL |
| Tool Call Schema Accuracy | `99.2%` | `> 98.0%` | PASS / FAIL |
| Error / Timeout Rate | `0.1%` | `< 1.0%` | PASS / FAIL |

---

## 3. Capability Compliance Matrix

- [ ] **Tool Calling**: Correctly formats function arguments according to JSON Schema.
- [ ] **Structured Outputs**: Adheres strictly to JSON output constraints.
- [ ] **Token Output Cap**: Respects `max_tokens` / `max_output_tokens` limits without truncation errors.
- [ ] **Streaming Support**: Emits valid Server-Sent Events (SSE) data chunks.
- [ ] **Context Window Retention**: Correctly handles long-horizon prompts up to context limit.

---

## 4. Cost & Token Efficiency Summary

- Total Prompt Tokens: `000,000`
- Total Completion Tokens: `000,000`
- Total Estimated Cost: `$0.00`
- Cost Efficiency Score: `PASS / NEEDS_OPTIMIZATION`

---

## 5. Decision & Routing Recommendation

- **Status**: `APPROVED_FOR_PRIMARY` | `APPROVED_FOR_FALLBACK` | `DEPRECATED`
- **Recommended Use Cases**: `Routine Coding / High-Privacy Tasks / Complex Architecture`
- **Next Review Date**: `YYYY-MM-DD`
