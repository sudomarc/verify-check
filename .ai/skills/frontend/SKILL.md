---
name: frontend
description: This skill should be used when implementing web UI, responsive layouts, components, client behavior, visual states, accessibility, frontend performance, motion, or browser 3D.
---

# Frontend Skill

Inspect the existing design system, component conventions, routing, state model, data-fetching patterns, and responsive behavior before adding UI. Preserve accessibility semantics, keyboard behavior, loading/error/empty states, and performance characteristics.

Route only the capabilities the change needs:

- substantial visual direction: `design-direction` + `design-system` + `anti-vibe-design`
- responsive changes: `responsive-design`
- motion or scroll-linked animation: `interaction-motion`
- browser 3D, WebGL or WebGPU: `web-3d`
- images, SVG, fonts or 3D media: `asset-pipeline`
- visual regression: `visual-regression`
- runtime validation: `browser-qa`
- public pages: `seo-web`
- browser-facing trust boundaries: `web-security`
- Next.js: `nextjs`

Do not invent a new component library when the repository already has one. Do not add a 3D or animation library solely because the visual target looks impressive.

For advanced visual surfaces, keep essential content and task completion independent of WebGL or continuous animation, and account for responsive behavior, reduced motion and performance budgets.

For substantial visual changes, perform an anti-vibe preflight: look for generic trend stacking, untouched default component styling, generic copy, inconsistent spacing and decorative motion or pointer effects. Review patterns in context rather than banning them outright.

References: `references/ui-checklist.md`, `references/browser-verification.md`, `examples/component-change.md`.
