---
name: context-management
description: This skill should be used when a task spans sessions, context is saturated, progress must be preserved, or another agent needs to continue the work.
---

# Context Management Skill

## Purpose

Preserve the smallest useful, verifiable state when work must cross a session boundary or the active context becomes unreliable.

A handoff is a state snapshot, not a conversation summary.

## Context states

- HEALTHY — the current context is sufficient; continue normally.
- PRESSURED — context is growing or contains stale trajectory; prune/compact locally when practical.
- DEGRADED — repeated failures, contradictory assumptions, looping, or context saturation materially threaten continuity; create a handoff and reset.
- HANDOFF READY — the current state has been recorded and reconciled against repository evidence; safe to start a fresh session.

## Trigger a handoff when

- the session is ending or work will resume later;
- another agent/session will take ownership;
- context is materially degraded;
- the agent is repeating failed approaches;
- debugging has entered a loop;
- a milestone creates a useful ownership boundary.

Do not rely on a magic token threshold. Trigger on loss of decision quality, not an arbitrary context percentage.

## Workflow

### 1. Freeze

Freeze the conceptual work state, not the repository history. Inspect status and identify the exact work surface.

### 2. Write

Populate .ai/templates/handoff.md with only information the next session needs.

Required information:

1. Objective
2. Current repository state
3. Applicable instructions
4. Decisions already made
5. Files changed
6. Verification performed
7. Known failures
8. Open questions
9. Risks
10. Exact next actions
11. Completion criteria

### 3. Reconcile

Before leaving the session, compare the handoff with repository evidence:

- git status
- relevant git diff
- changed files
- verification commands and observed results
- unresolved failures

Do not mark a verification item as completed unless its evidence was actually observed.

### 4. Reset

Use the host's supported session reset mechanism, such as /clear, or start a new session. Prefer a fresh session when context has materially degraded.

### 5. Resume

The new session reads the handoff, then re-inspects the repository. The handoff provides orientation; repository evidence provides technical truth.

## Compaction versus handoff

Compaction/pruning reduces active context while continuing the same trajectory.

Handoff intentionally terminates the current trajectory and transfers only durable state to a fresh context.

Do not use a compacted transcript as a substitute for a handoff at a session boundary. Remember that repository evidence outranks a stale or conflicting handoff, and a new session must re-inspect the repository before continuing.

## Failed attempts are durable state

For every material failed attempt, preserve:

- Attempt
- Reason it was tried
- Observed result
- Why it failed
- Condition, if any, under which it should be reconsidered

Never delete a material failed attempt merely to make the handoff shorter.

## Rules

Preserve facts, decisions, evidence, and uncertainty rather than narrative. Keep commands/results when they affect the next decision. State what remains unverified. Never allow a handoff to override repository evidence, higher-priority instructions, authorization, safety, or scope.

## References

- references/handoff-protocol.md
- references/handoff-triggers.md
- references/handoff-quality.md
- examples/handoff-example.md
