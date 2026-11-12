# Repeated-Failure Clustering & Skill Effectiveness Evaluation

## Purpose

This document specifies standard procedures for:
1. Clustering agent failure signals across execution trajectories to distinguish systemic defects from isolated noise.
2. Quantifying skill effectiveness before and after proposed governance or skill modifications.
3. Executing regression-aware skill updates that prevent instruction drift, rule conflicts, or performance degradation in adjacent workflows.

---

## 1. Repeated-Failure Clustering Protocol

### 1.1 Cluster Dimensionality
Failure observations MUST be clustered along five canonical dimensions:

1. **Failure Taxonomy Category:** (`PERM_DENIED`, `TOOL_EXEC_ERR`, `PLAN_DEFECT`, `VERIF_FALSE_POS`, `CONTEXT_EXCEEDED`, `MODEL_HALLUC`, `SAFETY_BLOCKED`, `INFRA_FAIL`)
2. **Target Skill / Domain Surface:** The specific `.ai/skills/<domain>/` or contract touched during the failure.
3. **Tool & Exception Signature:** The normalized tool name and error code or regex pattern (e.g., `execute_bash:EXIT_127`, `read_file:ENOENT`).
4. **Context / Trajectory Depth:** Token count or step count range when the error occurred (e.g., `<10k tokens`, `10k-50k tokens`, `>50k tokens`).
5. **Root-Cause Hypothesis Vector:** Shared technical mechanism causing the failure (e.g., missing parameter validation, stale context pollution, unhandled async timeout).

### 1.2 Clustering Thresholds
- **Isolated Noise (`ONE_OFF_FAILURE`):** $< 3$ instances across distinct sessions/traces within a 14-day window.
- **Pattern Candidate (`RECURRING_FAILURE`):** $\ge 3$ instances with matching Failure Taxonomy + Tool Signature within 14 days, or $\ge 2$ instances across different repositories/agents.
- **Systemic Defect (`SYSTEMIC_FAILURE`):** $\ge 5$ instances across multiple sessions, or any failure that causes a security breach, unauthorized data mutation, or severe context corruption.

### 1.3 Cluster Record Structure
When a cluster reaches `RECURRING_FAILURE` or `SYSTEMIC_FAILURE`, record a cluster synthesis:

```markdown
### Cluster ID: CLUS-2026-001
- **Taxonomy Class:** `PLAN_DEFECT`
- **Target Surface:** `.ai/skills/verification/`
- **Tool Signature:** `pytest:FAIL_NO_ASSERT`
- **Occurrence Count:** 4 instances across 3 traces (`tr-001`, `tr-004`, `tr-009`)
- **Shared Root Cause:** Agent assumes tests passed when `pytest` returns exit code 0 despite 0 tests selected.
- **Classification:** `RECURRING_FAILURE`
```

---

## 2. Skill Effectiveness Measurement Protocol

### 2.1 Core Effectiveness Metrics
Skill modifications must be evaluated using delta metrics ($\Delta$) comparing pre-change baseline ($B$) against post-change evaluation ($E$):

| Metric | Code / Formula | Target Delta | Description |
|---|---|---|---|
| **Task Completion Rate Delta** | $\Delta\text{TCR} = \text{TCR}_E - \text{TCR}_B$ | $\ge +0.05$ | Increase in overall task success rate. |
| **First-Pass Success Rate Delta** | $\Delta\text{FPSR} = \text{FPSR}_E - \text{FPSR}_B$ | $\ge +0.05$ | Increase in tasks passing verification without retry iterations. |
| **False Positive Verification Delta** | $\Delta\text{FPVR} = \text{FPVR}_E - \text{FPVR}_B$ | $\le -0.05$ | Decrease in false positive verification reports. |
| **Cost-Per-Verified-Success Delta** | $\Delta\text{CPVS} = \text{CPVS}_E - \text{CPVS}_B$ | $\le \$0.00$ | Reduction or neutrality in total token/API cost per verified task completion. |
| **Instruction Drift Index** | $\text{IDI}$ | $= 0$ | Number of rule conflicts or precedence violations introduced by the skill update. |

### 2.2 Sampling Window & Evaluation Criteria
1. **Minimum Sample Size:** At least 10 evaluation runs or 3 distinct benchmark tasks before confirming a skill modification.
2. **Control Context:** Evaluation runs MUST use identical model targets, host platforms, and benchmark repositories as the baseline.
3. **Outcome States:**
   - `CONFIRMED`: $\Delta\text{TCR} \ge +0.05$ or target cluster error reduced to $0$, with $\Delta\text{FPVR} \le 0$ and $\text{IDI} = 0$.
   - `PARTIALLY_CONFIRMED`: Cluster error frequency reduced by $\ge 50\%$, but residual errors remain.
   - `INEFFECTIVE`: No statistically significant reduction in cluster error frequency.
   - `REVERTED`: $\text{IDI} > 0$ or any regression detected in adjacent workflows.

---

## 3. Regression-Aware Skill Update Protocol

### 3.1 Pre-Update Safety Checks
Before applying any update to a skill (`.ai/skills/<domain>/SKILL.md` or reference):

1. **Precedence Hierarchy Audit:** Ensure the proposed rule does not contradict `.ai/core/`, `AGENTS.md`, or higher-priority governance rules.
2. **Context Budget Impact Analysis:** Verify that added instructions do not increase HOT context size by $> 500$ tokens unless explicitly justified.
3. **Cross-Agent Scope Check:** Confirm that changes to domain skills do not restrict or corrupt subagent responsibilities defined in `.ai/contracts/`.

### 3.2 Incremental Staging Workflow
```text
CLUSTERING → PROPOSAL → VALIDATOR TEST → STAGED BRANCH → BENCHMARK EVAL → REGRESSION AUDIT → APPROVAL → MERGE
```

1. **Stage 1: Proposal Draft:** Create proposal in `.ai/self-improvement/records/proposals/IMP-YYYY-xxx.md`.
2. **Stage 2: Validation Gate:** Execute `python3 scripts/validate_instructions.py`. All structural and marker assertions MUST pass.
3. **Stage 3: Controlled Benchmark Evaluation:** Run benchmark suite against affected agent profiles.
4. **Stage 4: Regression Audit:** Compare $\Delta\text{TCR}$, $\Delta\text{FPSR}$, and $\Delta\text{CPVS}$ against baseline runs. Check adjacent non-targeted skills for performance regressions.
5. **Stage 5: Approval & Merge:** Apply governance approval rules (see `governance-approval-workflow.md`).
