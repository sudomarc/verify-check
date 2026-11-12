---
name: anti-vibe-design
description: This skill should be used when reviewing or refining web UI for generic AI-generated visual patterns, trend stacking, template-like styling or insufficient product-specific design rationale.
---

# Anti-Vibe Design Skill

Use this as a heuristic against interfaces that look assembled from familiar AI/web-design defaults rather than designed for the product.

The patterns below are not forbidden. The rule is context, restraint, consistency and a product-specific reason instead of default trend selection.

## Patterns to inspect

### Visual styling
1. Purple-to-blue gradients used as a default visual identity.
2. Gradient-filled hero headlines used without a content or brand reason.
3. Emojis used as heading decoration instead of meaningful product language.
4. Inter used everywhere without checking whether it is the right typographic voice.
5. Cards distinguished mainly by arbitrary colored borders.

### Component and composition patterns
6. Glassmorphism cards used as the default surface treatment.
7. Dark mode with weak contrast, muddy hierarchy or insufficient state separation.
8. Repeated three-icon-card rows used as generic feature filler.
9. A small badge placed above nearly every headline without semantic value.
10. Lucide or another icon library used for nearly every visual element instead of a deliberate icon language.
11. Default shadcn/ui components shipped with minimal customization when the product has a distinct visual identity.
12. Repeated card grids used for unrelated content types when editorial, tabular, timeline or other structures would communicate better.

### Motion and interaction
13. Generic fade-in-on-scroll applied to most sections without hierarchy or narrative value.
14. Cursor-following beams, spotlights or glows added as decorative pointer effects.
15. Buttons that only fade or dim on hover instead of communicating a meaningful interactive state.
16. Animation used to make a static UI look "alive" without explaining state, causality or continuity.

### Consistency and content
17. Inconsistent spacing, alignment, radii, control heights or component density.
18. Em dashes or other stylized punctuation repeated as a recognizable AI-copy habit rather than a deliberate editorial choice.
19. Generic buzzword copy that could describe almost any SaaS, startup or agency.
20. Serif italic accents inserted as a fashionable contrast without a clear typographic role.

### Typography and texture
21. Space Grotesk + Instrument Serif (or a similar trendy display/body pairing) used by default rather than from product requirements.
22. Grain/noise texture layered over gradients mainly to create a fashionable "premium" surface.

The catalog is intentionally heuristic. The important signal is unexplained stacking, not any single pattern.

## Review method

1. **Understand context** — identify product, audience, brand constraints, content goals and existing visual language.
2. **Inspect the changed surface** — compare with existing tokens, components, typography, spacing and content patterns.
3. **Detect stacking** — several trendy defaults together are stronger evidence of generic styling than one isolated choice.
4. **Ask for rationale** — for each non-trivial visual choice, identify the user value, brand reason or information-hierarchy function.
5. **Check alternatives** — prefer simpler or more product-specific treatments when an effect does not improve comprehension, identity or interaction.
6. **Check distinctiveness** — identify the feature that should make the surface recognizable as this product rather than a generic category site.
7. **Verify states and viewports** — inspect responsive behavior, hover/focus/disabled/error states, contrast, text wrapping and reduced-motion behavior where applicable.
8. **Report evidence** — cite the exact surface and concrete visual/UX consequence. Do not reject a pattern solely because it appears on this list.

## Anti-AI-Slop Gate

Before shipping a substantial visual change, explicitly answer:

- Does this look like a generic SaaS dashboard?
- Does it look like a template assembled from familiar UI primitives?
- Could the same layout be used for a different product with minimal changes?
- Is the visual identity carried mostly by color, gradient, glow or typography rather than structure?
- Are repeated cards doing work that a more appropriate editorial, data, timeline or content structure could do better?
- Did the agent reuse defaults without a documented product reason?

If the answer to any of these is materially yes, redesign the affected surface before polishing micro-details.

## Screenshot critique loop

When browser tooling is available:

IMPLEMENT → CAPTURE REAL ROUTE/STATE → CRITIQUE → PATCH → CAPTURE AGAIN

The critique should focus on actual rendered output, not just source code.

Record route, viewport, state and concrete observations. A screenshot is evidence for that captured state only.

## Positive heuristics

- Establish one clear visual thesis before adding effects.
- Prefer a small set of distinctive decisions over many fashionable effects.
- Use typography because of hierarchy, character and readability.
- Customize reusable primitives enough that component language matches the product.
- Use motion to explain state, causality, continuity or narrative progression.
- Prefer structural differentiation over decorative novelty.
- Make copy specific to the product, user and task.
- Preserve a usable interface when animation, pointer effects or decorative layers are removed.

## Completion gate

Before completing a substantial visual change, identify retained or introduced generic patterns. For each one, either document a concrete product/brand rationale or simplify it. When several patterns appear together without a coherent system, revisit the visual direction before polishing details.

Anti-vibe review is a quality heuristic, not a prohibition on contemporary web design.
