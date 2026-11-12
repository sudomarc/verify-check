---
name: web-performance
description: This skill should be used for client-side performance, rendering cost, network behavior, bundles, images, fonts, caching, animation and GPU-heavy web experiences.
---

# Web Performance Skill

Measure the affected path before optimizing it.

Inspect server or client boundaries, JavaScript transfer and execution, route bundles, image and font cost, request waterfalls, cache behavior, rendering and hydration work, long tasks, expensive event handlers and third-party scripts.

For animation and 3D, also inspect frame pacing, render-loop lifetime, device pixel ratio, texture memory, scene complexity, post-processing, asset decode cost and whether hidden routes or unmounted components continue doing work.

Use route-level code splitting and lazy loading for heavy 3D or animation capabilities when appropriate. Pause or dispose work that is no longer needed.

Use representative before and after measurements. Treat Core Web Vitals as measurements of user experience, not as a reason for blind optimization.

Do not optimize by deleting necessary behavior without evidence. Separate measured regressions from hypotheses.
