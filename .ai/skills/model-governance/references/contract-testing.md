# Contract Testing for Model Backends

## Overview

Contract testing verifies that model providers (such as LapisLLM local HTTP server, OpenAI-compatible gateways, or Anthropic API endpoints) adhere to expected API contracts, capability schemas, streaming behaviors, and error codes without running expensive full-scale benchmark suites on every change.

---

## 1. Scope of Contract Tests

Model backend contract tests must validate:

1. **Discovery Endpoint (`GET /v1/models`)**:
   - Returns valid HTTP 200 OK.
   - List of available model IDs matches expected capability registry.
   - Includes required context window metadata where supported.

2. **Non-Streaming Inference (`POST /v1/chat/completions`)**:
   - Accepts standardized payload (`model`, `messages`, `temperature`, `max_tokens`).
   - Returns standardized response schema with `choices[0].message.content`, `usage.prompt_tokens`, and `usage.completion_tokens`.
   - Honors explicit `max_tokens` / `max_output_tokens` bounds.

3. **Tool Calling & Function Schema**:
   - Accurately parses tool definitions in request.
   - Returns valid structured JSON tool call parameters in `message.tool_calls` when function calling is triggered.

4. **Error Handling & Status Codes**:
   - HTTP 401/403 for authentication/permission failure.
   - HTTP 429 for rate-limit / quota exhaustion.
   - HTTP 400 for context window overflow or invalid JSON.
   - HTTP 500/503 for model engine crashes or hardware OOM.

---

## 2. Mock Provider & Zero-Quota Verification

To avoid consuming live model quotas or requiring local GPU availability during CI/CD checks:

- Use lightweight mock providers or replay fixtures to verify CHAD Model Gateway adapter logic.
- Validate request serializations and response parsers deterministically.
- Reserve live API checks for periodic health probes or scheduled integration smoke tests.

---

## 3. LapisLLM Integration Smoke Test Pattern

```python
import json
import urllib.request

def test_lapis_health_and_contract(base_url="http://localhost:8080"):
    # 1. Discover models
    req = urllib.request.Request(f"{base_url}/v1/models")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode('utf-8'))
        assert "data" in data
        print("LapisLLM Discovery OK:", data)

    # 2. Bounded chat completion
    payload = {
        "model": data["data"][0]["id"],
        "messages": [{"role": "user", "content": "Ping"}],
        "max_tokens": 10
    }
    req = urllib.request.Request(
        f"{base_url}/v1/chat/completions",
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        result = json.loads(resp.read().decode('utf-8'))
        assert "choices" in result
        assert len(result["choices"]) > 0
        print("LapisLLM Inference OK:", result["choices"][0]["message"])
```
