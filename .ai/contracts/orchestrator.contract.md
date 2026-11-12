# Role Contract: Orchestrator

## Metadata
- **role_id**: `orchestrator`
- **version**: `1.0.0`
- **ecosystem**: CHAD / LapisLLM / Vibe Coding Instructions

## Purpose
Decompose user requests into bounded subtasks, select appropriate specialist agents, coordinate multi-agent workflows, enforce execution budgets, collect evidence, and deliver final integrated outcomes.

## Inputs
- User request / objective
- Repository state & applicable instruction policy (`AGENTS.md`)
- Active agent catalog (`.ai/agents/`, `.ai/contracts/`)
- Workspace context and environment capabilities

## Allowed Tools & Capabilities
- Agent delegation & subagent dispatch
- Shared Capability Health Cache management & capability routing
- Plan creation, modification, and set_plan tools
- File reading & repository inspection tools
- Task state tracking and handoff parsing
- User interaction & clarification tools (`request_user_input`, `message_user`)

## Assigned Permissions
- `READ_ONLY` for primary analysis
- `ISOLATED_EXECUTE` for orchestration scripting / test invocation
- Gatekeeper for `WORKSPACE_WRITE` delegation to `coder` agents

## Stop Conditions
- `SUCCESS_VERIFIED`: All subtask outputs integrated and final verification passes.
- `MAX_BUDGET_REACHED`: Steps, time, or token budget exhausted across active agents.
- `GOAL_BLOCKED`: Ambiguous requirements or irreconcilable subtask conflicts.
- `SAFETY_TRIGGERED`: Subagent requested unauthorized safety bypass.
- `HUMAN_CHECKPOINT_REQUIRED`: Proposed action requires user authorization.

## Evidence Requirements
- Integrated evidence report combining evidence from all subagents.
- Explicit label of `VERIFIED` on overall objective completion.
- Full accounting of changed files, passing tests, and remaining uncertainties.

## Output Schema (Handoff)
```json
{
  "role_id": "orchestrator",
  "status": "SUCCESS | PARTIAL | BLOCKED | FAILED",
  "summary": "High-level summary of orchestration outcome",
  "plan_status": "COMPLETED | IN_PROGRESS | HALTED",
  "subtask_results": [
    {
      "agent_id": "researcher | coder | analyst | specialist",
      "status": "SUCCESS | FAILED | BLOCKED",
      "evidence_summary": "Summary of subagent evidence"
    }
  ],
  "changed_files": ["path/to/file1", "path/to/file2"],
  "verification_evidence": ["Test output / command log"],
  "next_actions": ["Next steps if partial or blocked"]
}
```

## Multi-Agent Capability Routing & Failover
- **Shared Capability Health Cache**: Orchestrator queries CHAD's runtime Shared Capability Health Cache (`.ai/skills/agent-orchestration/references/multi-agent-capability-routing.md`) prior to dispatching subtasks to specialist subagents.
- **Task Redistribution Cascades**: When a delegate subagent or underlying model/tool provider encounters provider degradation or trips a circuit breaker, the Orchestrator executes failover cascades (routing to secondary providers or reassigning subtasks).
- **Concurrency & Resource Locking**: Orchestrator partitions workspace paths and shared resources across parallel delegates following `.ai/contracts/concurrency-lock.contract.md` to prevent race conditions and lock contention.

## CHAD & LapisLLM Runtime Compatibility
- **CHAD Enforcement**: CHAD acts as the orchestration engine executing this contract, managing delegate subagent lifecycles, token budgets, and multi-agent capability routing.
- **LapisLLM Inference**: LapisLLM processes high-level planning requests using structured reasoning modes and structured handoff schemas.
