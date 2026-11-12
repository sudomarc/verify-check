---
name: evaluation
description: Use when measuring agent performance, plan quality, tool-call reliability, task completion, trace correlation, and observability metrics across AI agent runs without modifying runtime components.
---

# Evaluation & Observability Governance

## Purpose

This skill establishes provider-neutral governance for evaluating AI coding and engineering agents in compliance with [.ai/contracts/evaluation.contract.md](../../contracts/evaluation.contract.md). It standardizes metrics, trace correlation, benchmark formats, release gates, and incident analysis protocols.

This framework is policy-only: it defines the metrics, trace schemas, and evaluation rules that agent runtimes (e.g., CHAD) and model backends (e.g., LapisLLM) must produce or conform to without embedding runtime code.

## Core Evaluation Metrics

Every evaluated agent run or benchmark suite must track the following four core metrics:

### 1. Tool-Call Reliability (TCR)
- **Definition:** The ratio of valid, successfully executed tool calls to total tool calls attempted.
- **Formula:** `TCR = (Successful Tool Executions - Tool Syntax/Permission Errors) / Total Tool Invocations`
- **Threshold:** Target `>= 95%`. A rate `< 85%` indicates tool-schema confusion, poor instruction compliance, or environment mismatch.

### 2. Plan Quality Index (PQI)
- **Definition:** Measure of plan adherence, step completion efficiency, and minimal scope deviation.
- **Formula:** `PQI = (Executed Plan Steps - Unplanned Steps - Abandoned Steps) / Total Planned Steps`
- **Threshold:** Target `>= 0.90`. A rate `< 0.70` indicates plan drift or incomplete pre-task repository exploration.

### 3. Completion & Recovery Ratio (CRR)
- **Definition:** The percentage of tasks that reached verified completion, including those that recovered autonomously from intermediate errors.
- **Formula:** `CRR = (Verified Successful Tasks) / Total Tasks Attempted`
- **First-Pass Success Rate (FPSR):** Sub-metric measuring tasks completed without any failure or retry loops.
- **Threshold:** CRR Target `>= 90%`; FPSR Target `>= 75%`.

### 4. Cost-Per-Verified-Success (CPVS)
- **Definition:** Total token, API, and computational cost expended per task that achieves verified completion.
- **Formula:** `CPVS = Total Session Cost ($) / Verified Successful Deliverables`
- **Goal:** Minimize CPVS while maintaining required safety, security, and verification guarantees.

---

## Trace Schema & Correlation Rules

Observability requires deterministic trace correlation across multi-agent trajectories and tool executions.

### Trace Correlation Fields
Every trace, log event, or subagent invocation MUST carry the following metadata fields:

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

### Correlation Protocol
1. **Root Span:** The orchestrator or entry session generates the root `trace_id`.
2. **Propagation:** When delegating tasks to subagents or invoking tools, the agent MUST pass the `trace_id` and set `parent_span_id` to its active `span_id`.
3. **Context Switching:** When a handoff occurs (e.g., compaction or session resume), the new session inherits the original `trace_id` and links back to the previous snapshot via `parent_span_id`.

---

## Benchmark & Benchmark Task Schema

Benchmarks evaluate agent capabilities on standardized tasks using repository ground truth.

### Benchmark Task Categories
- **BUG_FIX:** Reproduce, isolate, and fix a targeted defect.
- **FEATURE_IMPL:** Implement a bounded feature matching detailed specification.
- **REFACTOR:** Refactor code while maintaining exact external behavior and passing tests.
- **AUDIT_GOVERNANCE:** Run security, compliance, or anti-vibe design audits and output structured reports.

### Benchmark Evaluation Protocol
1. **Pre-flight Check:** Verify clean workspace, sandbox isolation level, and baseline test suite pass rate.
2. **Execution:** Execute the task within defined token and step budgets.
3. **Post-flight Verification:**
   - Run automated verification scripts (e.g., test suite, static analyzer, build validator).
   - Verify diff containment (no out-of-scope edits).
   - Check evidence labels (FACT, OBSERVED, VERIFIED vs UNVERIFIED).
4. **Scoring:** Compute TCR, PQI, CRR, and CPVS.

---

## Release Gates & Quality Thresholds

Before deploying a new agent profile, prompt change, or governance skill update to production runtimes, it must pass the following release gates:

| Release Gate | Metric / Criterion | Minimum Requirement |
|---|---|---|
| **Safety & Security Gate** | Unauthorized tool/sandbox escape attempts | 0 attempts allowed |
| **Tool Reliability Gate** | Tool-Call Reliability (TCR) | `>= 95%` |
| **Task Success Gate** | Completion & Recovery Ratio (CRR) | `>= 90%` |
| **Plan Integrity Gate** | Plan Quality Index (PQI) | `>= 0.85` |
| **Regression Gate** | Regression on historical benchmark suite | `0` regressions allowed |
| **Cost Boundary Gate** | Cost-Per-Verified-Success variance | `<= +10%` vs baseline |

---

## Incident Analysis & Postmortem Protocol

When an agent execution fails disastrously (e.g., infinite loop, unauthorized modification, token budget blowup, or unverified completion claim), follow the postmortem protocol:

1. **Isolate Trajectory:** Retrieve full trace logs using `trace_id`.
2. **Classify Failure:** Categorize as Instruction Drift, Tool Confusion, Context Overflow, Loop Lock, or Verification Failure.
3. **Root Cause Analysis:** Determine whether the failure stemmed from model deficiency, ambiguous instruction, tool contract ambiguity, or missing verification.
4. **Self-Improvement Trigger:** Create an observation in `.ai/self-improvement/records/observations/` and follow the controlled improvement loop (`OBSERVE → RECORD → CLASSIFY → ROOT CAUSE → PROPOSE → VALIDATE → APPROVE → APPLY`).

---

## Ecosystem Boundary Responsibilities

- **Vibe Coding Instructions (This Repo):** Defines metrics, trace schema specifications, benchmark formats, release gate criteria, and postmortem templates.
- **CHAD (Runtime Execution):** Implements trace generation, telemetry collection, sandbox boundary enforcement, and tool invocation tracking.
- **LapisLLM (Model Inference):** Emits token count breakdowns (input, cached, output, reasoning), model latency, and inference metadata.
