# Prompt Engineering for Coding Agents

## Principle

A good coding-agent prompt specifies the desired observable outcome, the constraints, the evidence available, and the required stopping behavior. It should not attempt to replace repository discovery with a giant pile of guesses.

## Prompt Anatomy

1. Role: identify the agent's engineering responsibility.
2. Objective: define the observable result.
3. Context: provide facts that are genuinely known.
4. Constraints: define hard boundaries and non-goals.
5. Workflow: require inspect, plan, implement, verify, review.
6. Tools: specify available tools without pretending absent tools exist.
7. Output: define a compact evidence-oriented report.
8. Stop conditions: identify when the agent must pause.

## Layering

Layer durable policy, task procedures, references, examples, and project facts separately. This progressive-disclosure structure reduces context pressure and avoids paying repeatedly for irrelevant detail.


Put durable behavior into repository instructions. Put task-specific procedures into skills. Put detailed reference material into references. Put reusable output shapes into templates. Put concrete patterns into examples.

This reduces context pressure and avoids duplicating rules across every prompt.

## Few-Shot Use

Examples are valuable when a format or decision pattern is hard to infer. Keep examples representative and label them as examples rather than universal truth.

## Chain-of-Thought Boundary

Do not require disclosure of private chain-of-thought. Request concise decision summaries, assumptions, evidence, and verification results instead. The objective is auditability, not exposure of hidden reasoning.

## Instruction Quality Tests

A useful instruction is:

- specific enough to trigger consistently;
- scoped to the correct files or tasks;
- measurable through an observable outcome;
- compatible with existing project rules;
- paired with a stopping rule;
- paired with a verification method.

## Avoid

Avoid contradictory priorities, vague commands such as "make it perfect", giant unscoped checklists, fake certainty, and instructions that depend on tools the host does not expose.
