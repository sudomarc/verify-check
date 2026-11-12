---
name: visual-regression
description: This skill should be used when screenshot baselines, pixel or perceptual diffs, or repeatable visual regression checks are needed for web interfaces.
---

# Visual Regression Skill

Visual comparison is evidence for a defined state, not proof that the interface is correct.

Choose a small set of critical routes, states and viewports that represent the changed surface. Make captures deterministic by controlling fonts, animations, data, time-sensitive content and network dependencies where practical.

Before comparing images, define:
- baseline source and ownership;
- viewport and device-pixel conditions;
- required route state;
- acceptable dynamic regions or masks;
- comparison method and threshold;
- review rule for intentional visual changes.

Prefer Playwright or an equivalent browser runner for repeatable capture. Percy, Applitools and similar services are optional implementations rather than repository requirements.

Investigate diffs at the smallest changed surface. Separate intentional visual changes, rendering noise and real regressions. Never accept a diff only because it looks small; explain why it is expected.

Repeat the focused capture after a material fix. Keep visual baselines close to the code or workflow that owns them and avoid baselines for unstable third-party content.
