---
name: agent-orchestration
description: This skill should be used when a task benefits from multiple specialized agents, parallel analysis, delegated review, explicit agent handoffs, bounded autonomy gating, or multi-agent failure escalation.
---

# Agent Orchestration Skill

Use multiple agents when decomposition creates real independent value. Keep one orchestrator responsible for the overall plan and final integration. Give each delegate a narrow scope, required inputs, expected output format, permission tier and stop condition. Do not allow overlapping writes without coordination.

## Creative Design Mode

Activate Creative Design Mode for a new public visual identity, substantial visual redesign, or a user request for a distinctive/non-generic interface.

Creative Design Mode is deliberately multi-perspective. It requires **at least 5 distinct specialist roles** before implementation:

1. **Design Director / Art Director** — establishes the product visual thesis and selects a direction.
2. **Visual Reference Researcher** — studies cross-domain references and extracts principles without copying.
3. **Product UX Specialist** — maps domain content and user tasks to information architecture.
4. **Creative Interaction Designer** — proposes meaningful interactions, motion and state transitions.
5. **Anti-Vibe Critic** — attacks generic, templated, trend-stacked or AI-looking decisions.

After implementation, add **Visual QA** plus any risk-based reviewers such as responsive, accessibility, performance or security.

The five pre-implementation roles must produce independent evidence before synthesis. One agent may not impersonate all five roles.

### Required sequence

RESEARCH → 3+ DIRECTIONS → CRITIQUE → SYNTHESIZE → DESIGN BRIEF → IMPLEMENT → BROWSER VERIFY → VISUAL CRITIQUE → REVISE → FINAL REVIEW

Implementation is not allowed to start merely because one direction is acceptable. The orchestrator must record why one direction was selected and why the others were rejected.

### Minimum outputs

The design phase must produce:

- 3+ materially different directions;
- 3+ concrete differentiators for the selected direction;
- cross-domain reference principles;
- rejected-direction rationale;
- affected design-system contracts;
- interaction/motion decisions;
- responsive/accessibility/performance constraints.

Use .ai/templates/design-brief.md for the normalized handoff.

## Standard routing

- Visual redesign: ui-reviewer + anti-vibe-reviewer + visual-qa
- Responsive layout: responsive-reviewer + visual-qa
- Advanced motion or browser 3D: motion-3d-specialist + visual-qa + performance-auditor
- Asset-heavy visual change: asset-pipeline-specialist + performance-auditor
- Screenshot baselines or visual regression: visual-regression-reviewer + browser-tester
- Accessibility-sensitive UI: accessibility-reviewer
- Forms or auth: forms-ux-reviewer + accessibility-reviewer + browser-tester
- Shared components: component-reviewer + ui-reviewer
- Next.js rendering or cache behavior: nextjs-specialist + performance-auditor
- Public/indexable pages: seo-auditor + performance-auditor
- Browser-facing security: web-security-reviewer
- External CLIs, MCPs, SaaS providers or multi-backend integrations: integration-health-reviewer + security/provider specialist as relevant
- Multi-agent tool capability routing or provider failover: multi-agent capability fallback rules + Shared Capability Health Cache
- Multi-agent parallel execution & shared resource locking: concurrency-and-resource-locking reference + `.ai/contracts/concurrency-lock.contract.md`

## Delegation Economics

The five-agent minimum applies only when Creative Design Mode is active. It is not a mandate to use teams for trivial fixes. For all other tasks, delegation is justified only when independent analysis, context isolation or parallelism creates net value after accounting for prompt, context, tool and returned-output cost.

## Delegation Contract & Bounded Autonomy

Every delegate receives role, exact scope, relevant files/diff, required inputs, output format, permission tier (READ_ONLY, WORKSPACE_WRITE, ISOLATED_EXECUTE, NETWORK_ACCESS, PRIVILEGED_MUTATION) and stop condition.

- **Bounded Autonomy Tiers**: Operate strictly within granted autonomy tiers (L0 READ_ONLY to L4 RESTRICTED).
- **Human Checkpoints**: Pause and transition to HUMAN_CHECKPOINT_REQUIRED upon requesting PRIVILEGED_MUTATION, breaching >=80% budget, performing irreversible state changes, or encountering contradictory goal states (GOAL_BLOCKED).
- **Retry & Circuit Breaker**: Maximum 3 retries per failed step with required context changes. Activate circuit breaker on 3 consecutive identical tool/model errors.
- **Traceability**: Propagate trace_id and parent_agent_id across inter-agent communications and tool invocations.

## Failure Escalation Protocol

When a subagent reaches a stop condition other than SUCCESS_VERIFIED, escalate to the Orchestrator with structured diagnostic evidence. If the Orchestrator cannot safely resolve or replan the task, use .ai/templates/escalation-report.md and request a human checkpoint.

References:
- references/delegation.md
- references/parallel-review.md
- references/concurrency-and-resource-locking.md
- references/bounded-autonomy-escalation.md
- references/multi-agent-capability-routing.md
- .ai/templates/escalation-report.md
- .ai/templates/design-brief.md
- examples/delegated-review.md
