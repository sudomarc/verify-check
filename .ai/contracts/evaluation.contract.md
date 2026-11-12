# Evaluation & Observability Governance Contract

This contract establishes the formal ecosystem evaluation schema, trace correlation standards, benchmark protocols, and release gate criteria across Vibe Coding Instructions, CHAD agent runtime, and LapisLLM model runtime.

---

## 1. Core Evaluation Metrics Schema

All agent evaluation runs, benchmarks, and production telemetry across the ecosystem MUST measure and record five standardized core metrics:

### 1.1 Tool-Call Reliability (`tool_call_reliability`)
- **Formula:** `TCR = (Successful Tool Executions - Tool Syntax/Permission/Schema Errors) / Total Tool Invocations`
- **Target:** `>= 95%`.
- **Failure Threshold:** `< 85%` indicates tool-schema confusion, instruction drift, or environment mismatch.

### 1.2 Plan Quality Index (`plan_quality_index`)
- **Formula:** `PQI = (Executed Plan Steps - Unplanned Steps - Abandoned Steps) / Total Planned Steps`
- **Target:** `>= 0.90`.
- **Failure Threshold:** `< 0.70` indicates plan drift, insufficient pre-task exploration, or unmanaged scope expansion.

### 1.3 Completion & Recovery Ratio (`completion_recovery_ratio`)
- **Formula:** `CRR = (Verified Successful Tasks) / Total Tasks Attempted`
- **Target:** `>= 90%`.
- **First-Pass Success Rate (FPSR):** `FPSR = (Tasks Completed Without Retry Loops) / Total Tasks Attempted` (Target `>= 75%`).

### 1.4 Cost-Per-Verified-Success (`cost_per_verified_success`)
- **Formula:** `CPVS = Total Session Cost ($ USD) / Verified Successful Deliverables`
- **Invariant:** CPVS optimization MUST NEVER compromise safety, security, code quality, or mandatory verification discipline.

---

## 2. Trace Correlation Schema (`trace_correlation_schema`)

All observability payloads, telemetry events, subagent invocations, and tool execution logs MUST conform to the trace correlation schema:

```json
{
  "trace_id": "tr-uuidv4-string",
  "parent_span_id": "span-uuidv4-string-or-null",
  "span_id": "span-uuidv4-string",
  "session_id": "sess-uuidv4-string",
  "agent_role": "orchestrator|researcher|coder|analyst",
  "bounded_autonomy_level": "L0|L1|L2|L3|L4",
  "timestamp_utc": "ISO-8601-UTC-timestamp",
  "environment": {
    "repository": "org/repo",
    "commit_sha": "git-sha-hash",
    "sandbox_level": "Level-0|Level-1|Level-2|Level-3"
  }
}
```

### Trace Propagation Rules
1. **Root Span:** Entry session or Orchestrator generates the root `trace_id`.
2. **Subagent & Tool Invocation:** Every tool dispatch or subagent delegation inherits `trace_id` and sets `parent_span_id` to the caller's active `span_id`.
3. **Session Handoff:** Session compaction or handoffs retain the original `trace_id` and link snapshot state to previous spans.

---

## 3. Benchmark Task Schema (`benchmark_task_schema`)

Benchmark suites MUST structure test scenarios into standard benchmark task categories:

| Category | Goal | Success Criterion |
|---|---|---|
| `BUG_FIX` | Reproduce, isolate, and remediate code defect | Targeted unit/integration tests pass with minimal diff |
| `FEATURE_IMPL` | Implement specification within codebase | All feature verification criteria met without regressions |
| `REFACTOR` | Restructure code for quality/performance | Behavioral equality verified by zero test regressions |
| `AUDIT_GOVERNANCE` | Perform security, compliance, or quality audit | Structured audit report generated with verified evidence |

---

## 4. Release Gate Criteria (`release_gate_criteria`)

Prior to deploying new agent profiles, prompt modifications, or skill updates to production runtimes, candidate configurations MUST pass all release gates:

```text
CANDIDATE UPDATE
       │
       ├─► Safety & Security Gate: 0 unauthorized escapes or credential leaks
       ├─► Tool Reliability Gate: TCR >= 95%
       ├─► Task Success Gate: CRR >= 90%
       ├─► Plan Integrity Gate: PQI >= 0.85
       ├─► Regression Gate: 0 regressions on historical benchmark suite
       └─► Cost Boundary Gate: CPVS variance <= +10% vs baseline
       │
       ▼
APPROVED FOR PRODUCTION
```

---

## 5. Ecosystem Compatibility Boundary

### Vibe Coding Instructions (Policy Layer)
- Defines metrics formulas, trace schema specifications, benchmark task taxonomy, release gate thresholds, and postmortem schemas.

### CHAD (Agent Runtime Layer)
- Emits trace events adhering to `trace_correlation_schema`.
- Tracks tool invocation success/failure rates to compute `tool_call_reliability`.
- Enforces release gate evaluation before activating new agent skill configurations.

### LapisLLM (Model Runtime Layer)
- Emits exact token consumption breakdowns (prompt, cached, completion, reasoning) and inference latencies.
- Provides model-level timing and capability metrics enabling precise `cost_per_verified_success` calculation.
