---
name: browser-qa
description: This skill should be used when a web change needs runtime browser verification, interaction checks, console or network inspection, or visual evidence.
---

# Browser QA Skill

When browser tooling is available, verify the real route rather than relying only on source inspection.

Record route, environment, viewport, critical interaction, important states, console errors, failed requests and visible layout defects as relevant.

For visual work, include representative narrow and wide viewports plus intermediate widths when the layout can change there. For motion or 3D work, exercise scroll, pointer/keyboard alternatives, visibility changes, reduced-motion behavior and fallback paths when those paths exist.

For screenshot-based regression checks, control fonts, animations, dynamic data and other unstable inputs where practical. Record baseline identity and exact capture conditions.

Screenshots are supporting evidence, not proof of correctness. Repeat focused verification after material fixes.
