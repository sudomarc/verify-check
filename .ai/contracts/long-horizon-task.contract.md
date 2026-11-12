# Long-Horizon Engineering Task Governance Contract

This contract establishes the provider-neutral, portable governance standards for managing long-horizon, multi-session, multi-agent engineering tasks within the CHAD + LapisLLM ecosystem.

## Governance Architecture

```text
Vibe Coding Instructions (.ai/contracts/long-horizon-task.contract.md)
  ├─ Multi-Session Task State Schema
  ├─ Research-to-Code Handoff Artifact Protocol
  ├─ Cross-Agent Artifact Exchange Schema
  ├─ Failure-Resume & Recovery Semantics
  ├─ Context Compaction & Checkpoint Conventions
  └─ Long-Running Cost & Budget Controls
        │
        ▼ (Enforced at Runtime)
  CHAD Orchestration Runtime (Task State Machine & Checkpoint Manager)
        │
        ▼ (Inference Gateway)
  LapisLLM Model Runtime (Bounded In-Context Memory & Compaction)
```

---

## 1. Multi-Session Task State Schema

For engineering tasks spanning multiple execution sessions, agent instances, or context windows, runtime state must be persisted as a structured `LongHorizonTaskState` artifact.

### JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "LongHorizonTaskState",
  "type": "object",
  "required": [
    "task_id",
    "objective",
    "status",
    "current_session_index",
    "created_at",
    "updated_at",
    "budget",
    "milestones",
    "active_checkpoint"
  ],
  "properties": {
    "task_id": { "type": "string", "pattern": "^task-[a-f0-9]{8,16}$" },
    "parent_task_id": { "type": ["string", "null"] },
    "objective": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["NOT_STARTED", "IN_PROGRESS", "CHECKPOINTED", "PAUSED", "COMPLETED", "FAILED"]
    },
    "current_session_index": { "type": "integer", "minimum": 1 },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "budget": {
      "type": "object",
      "required": ["allocated_tokens", "consumed_tokens", "max_sessions", "cost_limit_usd"],
      "properties": {
        "allocated_tokens": { "type": "integer" },
        "consumed_tokens": { "type": "integer" },
        "max_sessions": { "type": "integer" },
        "cost_limit_usd": { "type": "number" }
      }
    },
    "milestones": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["milestone_id", "title", "status"],
        "properties": {
          "milestone_id": { "type": "string" },
          "title": { "type": "string" },
          "status": { "type": "string", "enum": ["PENDING", "IN_PROGRESS", "VERIFIED", "SKIPPED", "FAILED"] },
          "evidence_ref": { "type": "string" }
        }
      }
    },
    "active_checkpoint": {
      "type": "object",
      "required": ["checkpoint_id", "session_id", "timestamp", "summary"],
      "properties": {
        "checkpoint_id": { "type": "string" },
        "session_id": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" },
        "summary": { "type": "string" },
        "artifacts": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

---

## 2. Research-to-Code Handoff Artifact Protocol

When an analysis or research agent (e.g. `researcher` or `analyst`) transitions work to a implementation agent (`coder`), the transfer must occur via a formal `ResearchHandoff` artifact.

### Schema Requirements
- `research_summary`: High-level summary of findings and technical feasibility.
- `architectural_decisions`: Recorded choices with rationale and rejected alternatives.
- `target_files`: Explicit list of files to be created or modified.
- `test_plan`: Proposed verification checks and test cases.
- `risk_matrix`: Identified technical risks, security constraints, and mitigation steps.

---

## 3. Cross-Agent Artifact Exchange Rules

To maintain context hygiene and prevent hallucinated inputs during multi-agent collaboration:

1. **Immutable Artifact Store**: Intermediate artifacts (specifications, diffs, analysis logs) are stored in dedicated runtime artifact storage (`.ai/artifacts/` or CHAD runtime storage) and referenced by content hash or path.
2. **Read-Only Inspection**: Subagents must read referenced artifacts rather than expecting whole files to be pasted into prompt context.
3. **Traceability**: All exchanged artifacts must specify `producer_agent_id`, `trace_id`, and `created_at`.

---

## 4. Failure-Resume & Recovery Semantics

When a session terminates abruptly (e.g. rate limit, tool failure, or context exhaustion):

1. **Checkpoint Recovery**: The CHAD runtime restores the latest verified `LongHorizonTaskState` checkpoint.
2. **Re-inspection Mandate**: On resume, the new agent session MUST re-inspect repository state (using `git status`, `read_file`, etc.) to reconcile persisted state against actual filesystem state.
3. **Failure Log Preservation**: Never overwrite prior error traces or failed attempts. Retain failed attempts in the state history to avoid repeating invalid strategies.

---

## 5. Context Compaction & Checkpoint Conventions

1. **Trigger Boundaries**: Context compaction MUST occur before starting a new major milestone, when context utilization exceeds 80% of window limit, or prior to handoff across agent boundaries.
2. **Compaction Strategy**:
   - Preserve: Goal, confirmed facts, decisions made, verified outcomes, remaining risks, and next steps.
   - Evict: Raw file dumps, redundant tool invocation logs, and intermediate stream noise.
3. **Checkpoint Verification**: A checkpoint is valid ONLY if accompanied by a verified repository state snapshot or passing diagnostic check.

---

## 6. Long-Running Cost & Budget Controls

1. **Hard Limits**: Each long-horizon task must define `max_sessions`, `allocated_tokens`, and `cost_limit_usd`.
2. **Exhaustion Behavior**: When budget limits are reached, execution MUST halt under `MAX_BUDGET_REACHED` stop condition and await human or orchestrator approval.
3. **Efficiency Invariant**: Token economy rules (`minimum sufficient context`, prompt caching, bounded reads) remain mandatory across all sessions.
