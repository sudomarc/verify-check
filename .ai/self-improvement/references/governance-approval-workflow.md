# Human Approval Workflow for Governance Changes

## Purpose

This document defines the governance approval framework, human checkpoint triggers, permission matrices, pull-request review workflows, and anti-self-authorization rules governing modifications to the Vibe Coding Instructions framework.

---

## 1. Governance Autonomy Tiers & Permission Matrix

Modifications to repository assets are governed by five Autonomy Tiers ($L0 - L4$):

| Tier | Autonomy Level | Target Surfaces | Allowed Agent Authority | Required Approval |
|---|---|---|---|---|
| **L0** | Fully Manual | `.ai/core/`, `MASTER-PROMPT.md`, `AGENTS.md`, Security policies | Proposal creation & evidence recording only. | Explicit Human Approval & PR Review |
| **L1** | Human-in-the-Loop | `.ai/contracts/`, Permission boundaries, Verification rules | Proposal drafting & local branch staging. | Explicit Human Approval |
| **L2** | Supervised | `.ai/skills/` domain procedures, References, Schemas | Automated implementation on topic branch. | Automated Validator Pass + Human PR Merge |
| **L3** | Bounded Autonomous | `.ai/templates/`, Non-governance documentation, Typos | Automated commit & verification. | Automated Validator Pass (`validate_instructions.py`) |
| **L4** | Full Autonomous | Transient observation records (`.ai/self-improvement/records/`) | Direct creation & maintenance. | None (Automated audit logging) |

---

## 2. Human Checkpoint Triggers for Governance Changes

An agent MUST pause execution and request explicit human intervention (`request_user_input` or human checkpoint escalation) whenever a proposed or active change triggers any of the following conditions:

1. **Core Governance Modification:** Any edit to `.ai/core/`, `AGENTS.md`, `MASTER-PROMPT.md`, or instruction precedence rules.
2. **Security Boundary Weakening:** Any modification to sandbox boundaries, permission escalation controls, secret-handling rules, or prompt-injection defense policies.
3. **Verification Authority Reduction:** Any removal or softening of mandatory verification gates, completion criteria, or testing requirements.
4. **Authority Expansion:** Any change that expands agent autonomous decision-making authority or increases token/financial budget limits beyond defined caps.
5. **Instruction Precedence Alteration:** Any rule change that reorders authority between user intent, repository policy, or core framework rules.
6. **Destructive Operation Policy Change:** Any modification to safety rules governing Git force-pushes, database drops, or external API execution.

---

## 3. Pull Request & Review Workflow for Governance Modifications

When a governance-impacting change is proposed or approved for implementation:

```text
PROPOSAL (IMP-xxx) → VALIDATION PASS → TOPIC BRANCH → PR CREATION → HUMAN REVIEW & SIGN-OFF → MERGE
```

### 3.1 PR Requirements
Every governance pull request created by an agent MUST include:
1. **Linked Proposal & Observations:** Reference to valid `.ai/self-improvement/records/proposals/IMP-YYYY-xxx.md` and supporting observation IDs.
2. **Governance Impact Assessment:** Explicit identification of affected files, impacted autonomy tiers, and potential side effects.
3. **Validator Check Output:** Execution logs demonstrating `python3 scripts/validate_instructions.py` PASSED with 0 errors.
4. **Regression & Skill Evaluation Delta:** Recorded TCR/FPSR delta or evidence demonstrating no degradation in adjacent workflows.
5. **Explicit Risk & Rollback Plan:** Instructions for reverting the PR if post-merge regressions occur.

### 3.2 Human Review Criteria
A human reviewer MUST verify:
- The change addresses a verified pattern (`RECURRING_FAILURE` or `SYSTEMIC_FAILURE`), not an isolated incident.
- The change does not introduce instruction drift or contradict higher-priority instructions.
- The validator script passes without warnings or missing marker errors.

---

## 4. Anti-Self-Authorization & Confidence Invariants

### 4.1 Confidence vs. Authorization Boundary
- **Confidence is Evidence Quality:** An agent's self-assessed confidence score ($0.0 - 1.0$) measures the quality and consistency of supporting evidence.
- **Confidence is NEVER Authorization:** High confidence (e.g., $0.99$) NEVER grants an agent permission to bypass a human checkpoint or apply an L0/L1 governance change autonomously.

### 4.2 Non-Self-Authorization Rule
No agent may approve its own governance proposals, generate fake human sign-offs, or modify validator scripts to suppress governance failure checks. Any attempt to bypass human authorization constitutes a critical security violation.

---

## 5. Rollback & Emergency Pause Protocol

1. **Immediate Pause:** If a newly merged governance rule causes unexpected failure cascades or instruction confusion, activate the emergency pause.
2. **Reversion:** Execute `git revert` on the offending PR/commit.
3. **Record Reversion Outcome:** Update proposal status to `REVERTED` in `.ai/self-improvement/records/proposals/` with full failure evidence.
4. **Postmortem:** Conduct an agentic postmortem using `.ai/templates/agentic-postmortem.md`.
