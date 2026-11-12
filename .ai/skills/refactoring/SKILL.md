---
name: refactoring
description: This skill should be used when restructuring existing code without intentionally changing external behavior.
---

# Refactoring Skill

Establish current behavior with tests or other evidence before structural edits. Make one structural change at a time. Keep public contracts stable unless the plan explicitly changes them. Prefer mechanical, reviewable transformations. Verify regression behavior after each meaningful batch.

References: `references/refactor-safety.md`, `references/behavior-preservation.md`, `examples/refactor-plan.md`.
