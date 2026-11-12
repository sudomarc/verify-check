---
name: web-3d
description: This skill should be used for WebGL, WebGPU, Three.js, Babylon.js, React Three Fiber, browser-based 3D scenes or GPU-heavy immersive interfaces.
---

# Web 3D Skill

Treat 3D as an optional rendering layer, not a prerequisite for good web design.

Before implementing a 3D surface, define the user value, interaction model, fallback experience, target devices and performance budget. Prefer ordinary HTML/CSS when it communicates the same intent with lower cost.

Inspect the installed 3D stack and version-matched documentation before introducing APIs. Reuse existing scene, camera, renderer, asset-loading and disposal patterns.

For production scenes, account for:
- GPU and memory cost from geometry, textures, materials, lights and post-processing;
- device pixel ratio and viewport size;
- lazy loading and route-level code splitting;
- asset formats and compression, with glTF commonly preferred for transferable 3D assets;
- animation loops, frame pacing and visibility-based pausing;
- WebGL context loss and recoverable failure;
- keyboard and pointer alternatives for important interactions;
- reduced-motion behavior and non-3D fallbacks.

Dispose GPU resources that are no longer needed. Do not keep large scenes, textures or animation loops alive after their owning surface is gone.

Do not make a page depend on WebGL for essential information, navigation or task completion unless an equivalent accessible path exists.
