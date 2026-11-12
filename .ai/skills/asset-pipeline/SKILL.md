---
name: asset-pipeline
description: This skill should be used when adding or transforming images, illustrations, icons, fonts, 3D assets, generated visual assets or other media used by a web interface.
---

# Asset Pipeline Skill

Treat assets as production inputs with constraints on quality, licensing, size, rendering cost and provenance.

Before adding an asset, identify its source, license or usage permission, intended viewport, intrinsic dimensions and owning feature.

Prefer the smallest format that preserves required quality:
- AVIF or WebP for photographic or raster web imagery when supported by the project;
- optimized SVG for simple vector artwork and icons;
- responsive image variants instead of oversized originals;
- glTF or GLB for transferable web 3D assets when appropriate.

For every asset, consider byte size, decode cost, texture memory, responsive variants, caching, lazy loading and above-the-fold priority. Do not preload large media without evidence that early loading improves the critical path.

Sanitize or otherwise validate externally supplied SVG and media before embedding them into a trusted application surface.

For generated assets, preserve human review, provenance and usage constraints. Do not let generated images or textures become an excuse to bypass accessibility, performance or brand requirements.

Keep source files separate from runtime assets only when the repository already has an established source/build pipeline; do not create a new asset hierarchy without evidence.
