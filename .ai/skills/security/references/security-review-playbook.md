# Agent & Code Security Review Playbook

## Metadata
- **playbook_id**: `agent_security_review_playbook`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions
- **scope**: Step-by-step security review procedures and verification checklists for agent tasks, contracts, and code changes

---

## 1. Executive Summary

This playbook provides a systematic methodology for agents, reviewers, and auditors to conduct security evaluations of agent configurations, tool contracts, skill definitions, and code changes across the CHAD + LapisLLM ecosystem.

Security reviews must be evidence-based: every check must be backed by concrete file inspections, static analysis, or dynamic runtime observations.

---

## 2. Security Review Workflow

When performing a security review or audit, follow this five-step workflow:

```text
1. SCOPE & SURFACE  ──► 2. THREAT MODELING  ──► 3. CHECKLIST AUDIT  ──► 4. EVIDENCE VERIFICATION  ──► 5. REPORT & REMEDIATE
(Identify files & tools) (Identify boundaries)   (Run verification checks) (Validate actual output)    (Document residual risk)
```

### Step 1: Surface Identification
- List all changed files, new dependencies, external endpoint connections, and tool definitions.
- Determine the permission level (`READ_ONLY`, `WORKSPACE_WRITE`, `ISOLATED_EXECUTE`, `NETWORK_ACCESS`, `PRIVILEGED_MUTATION`) of any touched tools.

### Step 2: Trust Boundary & Threat Modeling
- Trace data flow from inputs (user prompt, external web content, repository files) to outputs (file edits, network requests, model context).
- Identify untrusted inputs (`UNTRUSTED_REMOTE`) and evaluate indirect prompt injection risks.

### Step 3: Checklist Audit
Execute the structured checklists in Section 3.

### Step 4: Evidence Verification
- Run automated security scripts and structural validators.
- Confirm that no unmasked secrets or raw credentials appear in diffs, logs, or handoffs.

### Step 5: Reporting & Remediation
- Classify findings by severity (CRITICAL, HIGH, MEDIUM, LOW) and confidence (CONFIRMED, HIGH, MEDIUM).
- Require explicit human approval (`HUMAN_CHECKPOINT_REQUIRED`) for any unmitigated HIGH or CRITICAL risk.

---

## 3. Verification Checklists

### Checklist A: Trust Boundaries & Prompt Injection
- [ ] All untrusted inputs (web pages, issue text, third-party code comments) are tagged as `UNTRUSTED_REMOTE` or `UNVERIFIED`.
- [ ] Tool output wrappers use explicit XML/JSON boundary delimiters.
- [ ] System prompts explicitly instruct the model to ignore instruction-override commands embedded inside data context.
- [ ] No untrusted input can trigger tool execution without passing model instruction constraints.

### Checklist B: Tool Permissions & Side-Effects
- [ ] Tools strictly adhere to least privilege (`READ_ONLY` preferred; `PRIVILEGED_MUTATION` minimized).
- [ ] Any `PRIVILEGED_MUTATION` or `IRREVERSIBLE_HOST_MUTATION` tool call triggers `HUMAN_CHECKPOINT_REQUIRED`.
- [ ] Subprocess executions (`ISOLATED_EXECUTE`) are restricted to the active workspace.
- [ ] Network egress is restricted to declared endpoints with filtered payloads.

### Checklist C: Secret Handling & Data Protection
- [ ] Zero raw secrets (API keys, SSH keys, passwords) present in code diffs, logs, traces, or handoff files.
- [ ] High-entropy strings are automatically masked with `[REDACTED:<TYPE>]`.
- [ ] Secrets injected into subprocesses use environment variables, never CLI parameters.
- [ ] Model prompt context is scanned and verified clean of Tier 1 and Tier 2 credentials.

### Checklist D: Sandbox Isolation & Environment Security
- [ ] Code execution occurs within designated sandbox bounds (Level 1+ isolation).
- [ ] Filesystem modifications cannot escape the repository root (`../` traversal blocked).
- [ ] Host system packages or global environment states are not mutated without explicit authorization.

---

## 4. CHAD Runtime & LapisLLM Integration

### CHAD Runtime Integration
- Agents running inside CHAD use this playbook during self-review passes before task completion.
- Automated PR and code review agents use Checklist A-D to flag security regressions in pull requests.

### LapisLLM Model Integration
- LapisLLM model routing checks ensure code-review agents use high-reasoning capability tiers for security-critical tasks.
