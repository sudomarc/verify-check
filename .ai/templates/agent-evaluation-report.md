# Agent Evaluation & Observability Report

> **Trace ID:** `tr-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
> **Session ID:** `sess-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
> **Target Repository:** `org/repo`
> **Evaluated Agent / Profile:** `coder` / `orchestrator`
> **Evaluation Date:** `YYYY-MM-DD`

---

## Executive Summary

| Metric | Target | Observed Value | Status |
|---|---|---|---|
| **Tool-Call Reliability (TCR)** | `>= 95%` | `0.0%` | PASS / FAIL |
| **Plan Quality Index (PQI)** | `>= 0.90` | `0.00` | PASS / FAIL |
| **Completion & Recovery Ratio (CRR)** | `>= 90%` | `0.0%` | PASS / FAIL |
| **First-Pass Success Rate (FPSR)** | `>= 75%` | `0.0%` | PASS / FAIL |
| **Cost-Per-Verified-Success (CPVS)** | Budgeted | `$0.00` | PASS / FAIL |

---

## Run Metadata & Context

- **Environment:** Sandbox Level (L0 - L3)
- **Commit SHA:** `git-sha`
- **Bounded Autonomy Tier:** `L0 | L1 | L2 | L3 | L4`
- **Total Duration:** `00:00:00`
- **Total Tokens Used:** `0` (Input: `0`, Cached: `0`, Output: `0`, Reasoning: `0`)
- **Total Cost:** `$0.00`

---

## Trace & Execution Breakdown

### Phase 1: Planning & Context Retrieval
- **Context Loaded:** HOT (`0` files), WARM (`0` files)
- **Plan Quality Score:** `0.00`
- **Scope Alignment:** Confirmed / Deviated

### Phase 2: Implementation & Tool Execution
- **Total Tool Calls:** `0`
- **Successful Tool Calls:** `0`
- **Failed / Errored Tool Calls:** `0`
- **Retries Attempted:** `0` (Justified: `0`, Unjustified: `0`)

### Phase 3: Verification & Evidence
- **Verification Method(s) Used:** Tests / Static Analysis / Build Check / Manual
- **Verification Result:** PASS / FAIL
- **Evidence Labels Asserted:** `FACT`, `OBSERVED`, `VERIFIED`

---

## Benchmark & Release Gate Decision

- [ ] **PASSES RELEASE GATES** - Suitable for deployment/merge.
- [ ] **REJECTED** - Fails minimum metric thresholds or safety boundaries.

### Deviations & Failure Analysis (if applicable)
- **Failure Category:** `None | Instruction Drift | Tool Confusion | Context Overflow | Loop Lock | Verification Failure`
- **Root Cause Summary:**
- **Actionable Remediation / Self-Improvement Proposal ID:** `prop-xxx`

---

## Ecosystem Telemetry Verification
- [x] CHAD Runtime Telemetry Captured
- [x] LapisLLM Inference Breakdown Logged
- [x] Trace Correlation Validated
