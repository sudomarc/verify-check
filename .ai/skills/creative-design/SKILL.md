---
name: creative-design
description: This skill should be used when a web project needs a distinctive visual identity, creative UI exploration, cross-domain inspiration, anti-generic design or a multi-agent design phase before implementation.
---

# Creative Design Skill

Creative design is a constrained exploration problem, not a request to add decoration.

## Activation

Activate for:
- a new public web project's visual identity;
- a substantial visual redesign;
- a product/brand refresh;
- a user request for creative, distinctive or non-generic UI.

Do not use this workflow for trivial bug fixes or purely mechanical style corrections.

## Exploration protocol

Before implementation:

1. Inspect existing product requirements, visual system, content, routes and constraints.
2. Research references outside the product category when useful.
3. Produce at least 3 materially different visual directions.
4. Identify what makes each direction distinct and what risks it introduces.
5. Critique the directions against usability, accessibility, performance, brand fit and implementation cost.
6. Select one direction and record why alternatives were rejected.
7. Define at least 3 product-specific differentiators.
8. Produce a design brief before coding.

Never treat the first acceptable concept as automatically selected.

## Cross-domain reference method

Use external references to extract principles, not to copy layouts, branding, distinctive artwork or recognizable trade dress.

Useful domains include:
- editorial and newspaper design;
- sports broadcasting and scoreboard graphics;
- information visualization;
- gaming interfaces;
- fashion/editorial systems;
- architecture and signage;
- motion graphics;
- data-heavy professional software.

Capture source, principle extracted, intended adaptation and any copyright/trade-dress concern when a reference materially informs the design.

## Structural creativity

Prefer distinctive decisions in:
- information architecture;
- content hierarchy;
- typography;
- data representation;
- component composition;
- interaction model;
- motion semantics;
- product-specific visual motifs.

Do not compensate for generic structure with gradients, glow, grain, excessive animation or decorative 3D.

## Design-system contract

The design brief must state affected:
- color roles;
- typography roles;
- spacing/grid;
- radii/elevation;
- icon language;
- component variants;
- interaction states;
- responsive rules.

Extend existing tokens and primitives before inventing new ones.

## Browser loop

For substantial visual work:

DESIGN → IMPLEMENT → RENDER → CRITIQUE → PATCH → RENDER AGAIN

Inspect representative routes, viewport sizes and UI states. Record concrete observations. A screenshot is evidence for that captured state only.

## Anti-generic gate

Before shipping, ask:
- Could another product use this layout with only the text and colors changed?
- Does the identity depend mostly on fashionable styling rather than structure?
- Are repeated cards being used where editorial, tabular, timeline or data structures would communicate better?
- Are default components visibly dictating the visual language?
- Can the visual thesis be explained in one sentence?

Materially generic answers require another design pass.

## Required output

Use .ai/templates/design-brief.md.

The brief must contain:
- context and primary user tasks;
- 3+ design directions;
- cross-domain principles;
- selected direction;
- rejected alternatives and rationale;
- 3+ differentiators;
- design-system changes;
- interaction/motion decisions;
- responsive/accessibility/performance constraints;
- verification plan.
