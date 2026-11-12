---
name: design-direction
description: This skill should be used before substantial visual web work to establish deliberate visual direction, hierarchy, interaction language and design constraints.
---

# Design Direction Skill

Treat design as a system of decisions, not decoration.

## Direction before implementation

Do not jump directly from requirements to a conventional UI implementation for substantial visual work.

Before coding:

1. Define product purpose, audience, primary tasks, content hierarchy, density and responsive priorities.
2. Generate at least **3 materially different design directions**.
3. Reject the first obvious/conventional direction unless evidence shows it is the best fit.
4. For each direction document:
   - visual thesis
   - layout philosophy
   - typography roles
   - color roles
   - imagery/data treatment
   - interaction language
   - distinctive product-specific element
   - usability, accessibility and performance risks
5. Select one direction and record the decision in a compact design brief.

The goal is not "modern" or "premium". The goal is a recognizable, coherent and usable product-specific visual language.

## Cross-domain inspiration

For creative exploration, research beyond the product category. Useful reference domains include editorial design, newspapers, sports broadcasting, information visualization, gaming interfaces, fashion/editorial systems, architecture, signage, motion graphics and data-heavy applications.

Extract principles, not layouts, branding, distinctive artwork or other recognizable trade dress. Do not copy a reference.

## Distinctiveness budget

Before implementation, identify at least **3 deliberate differentiators** that make the product recognizable. Prefer structural differences over decorative effects:

- information architecture
- content hierarchy
- typography system
- data representation
- interaction model
- component composition
- motion semantics
- product-specific visual motifs

Use a small number of strong decisions rather than stacking fashionable effects.

## System consistency

Inspect existing tokens, primitives, components and page patterns. Extend them when appropriate.

Define the affected design-system contracts explicitly: colors, type scale, spacing rhythm, grid, radii, elevation, icon language, control sizes, states and responsive rules.

Do not introduce arbitrary raw values when an existing token can express the decision.

## Interaction and advanced effects

For expressive directions, document why a pattern exists before implementation. Kinetic typography, micro-interactions, scrollytelling, parallax, experimental navigation, lighting/glow, 2D/3D imagery and other advanced effects are optional design tools, not defaults.

Every advanced effect needs:

- a product, hierarchy or interaction rationale;
- a graceful exit/fallback;
- a performance consideration;
- an accessibility consideration;
- reduced-motion behavior when motion is involved.

Essential content and task completion must remain understandable without WebGL, continuous motion or pointer-only interaction.

## Anti-generic gate

Before completion, run anti-vibe-design on the changed surface.

Explicitly inspect for:

- template-like composition;
- repeated card grids;
- generic SaaS/dashboard structure;
- untouched component defaults;
- generic copy;
- fashionable trend stacking;
- unnecessary gradients, glass, glow or grain;
- decorative motion or pointer effects with no user value.

A listed pattern is not automatically wrong. Retain it only when its role is documented and the overall system remains coherent.

## Visual verification

Substantial visual work should use a real browser verification loop:

DESIGN DIRECTION → IMPLEMENT → SCREENSHOT/RENDER → VISUAL CRITIQUE → REVISE → VERIFY AGAIN

A screenshot proves the captured route/viewport/state only. It does not prove semantics, accessibility or all responsive states.

## Output

Return a compact design brief containing:

- selected direction and rejected alternatives;
- design thesis;
- 3+ differentiators;
- affected tokens/components;
- interaction and motion decisions;
- responsive rules;
- accessibility/performance constraints;
- verification plan.

Do not use arbitrary gradients, shadows, animations or decorative UI to hide weak hierarchy.
