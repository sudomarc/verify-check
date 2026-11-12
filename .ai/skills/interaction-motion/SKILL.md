---
name: interaction-motion
description: This skill should be used when implementing or reviewing web animations, transitions, micro-interactions, kinetic typography, parallax, scroll-driven storytelling or reduced-motion behavior.
---

# Interaction and Motion Skill

Motion must communicate state, causality, hierarchy, continuity or narrative progression.

Before adding motion, define what changed, why it matters, when it starts and ends, how interruption behaves and what happens under reduced-motion preferences.

Choose the simplest mechanism that satisfies the interaction. Common implementation families include CSS transitions/keyframes, GSAP and ScrollTrigger, Framer Motion, Anime.js, Lottie and browser-native animation APIs. Treat library choice as a repository decision, not a requirement of the visual trend.

For scroll-driven or parallax experiences:
- keep the scroll path responsive;
- avoid layout-dependent animation that causes cumulative movement or hidden content;
- define behavior when scrolling is interrupted or the target leaves the viewport;
- pause work that is no longer visible where practical.

For kinetic typography and decorative motion, protect legibility and interaction targets.

Prefer purposeful transitions over continuous decoration. Avoid blocking interaction, layout instability or motion that obscures essential feedback.
