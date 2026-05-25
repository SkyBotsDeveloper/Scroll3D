# Phase 5 Scroll Engine

Phase 5 implements `@scroll3d/scroll-engine`, the visual playback core for
Scroll3D.

## How It Works

The engine uses a frame-sequence approach:

1. Read scroll progress from a window or scroll container.
2. Clamp progress between `0` and `1`.
3. Convert progress to a deterministic frame index.
4. Load the frame image through the preloader.
5. Render the image into a 2D canvas using cover, contain, or fill sizing.

This creates a cinematic 3D-like website feel from rendered frames without
requiring WebGL, Three.js, shaders, or runtime 3D assets in exported websites.

## Why Canvas Frames Instead Of WebGL

Frame playback is predictable for static exports. It can run on ordinary static
hosting, works with prerendered image sequences, and keeps exported websites
simple: HTML, CSS, JavaScript, images, and manifests.

WebGL can still be useful later for editor previews or optional plugins, but the
core exported experience should not depend on it.

## Frame Manifest Format

`FrameManifest` describes:

- manifest ID, name, and version
- responsive frame sets
- default target
- optional poster frame
- optional reduced-motion fallback
- metadata

Each `FrameSet` includes target, frame count, format, dimensions, base path, and
filename pattern. Filename patterns support `{index}`, `{index:0000}`, and
`{index:0001}`.

## Preload Strategies

`FramePreloader` supports:

- `none`: no proactive loading
- `first`: preload the first N frames
- `nearby`: preload frames around the current frame
- `all`: preload every frame in the active frame set

The preloader limits concurrent image loads, retries failed images, caches
loaded images, and exposes basic cache/load stats.

## Reduced Motion

Reduced motion support can respect `prefers-reduced-motion`. When active, the
engine can render a poster frame, render the first frame, or disable animation.

This is part of the core engine because exported sites must remain usable for
visitors who prefer less motion.

## Responsive Frame Sets

Responsive helpers infer frame targets from viewport width:

- mobile: `<= 767`
- tablet: `<= 1023`
- desktop: `>= 1024`

The engine supports explicit target overrides and target changes on resize
without reloading when the target does not change.

## Timeline Segments

Timeline segments map scroll progress ranges to semantic IDs and labels. The
engine tracks the active segment and includes it in progress callbacks so future
packages can sync text sections, editor overlays, and exported content.

## Future Exporter Integration

The static exporter should emit:

- canvas markup
- frame manifest JSON
- generated frame assets
- reduced-motion fallback assets
- minimal engine runtime code

The exporter should not include provider secrets, project-only credentials, or
heavy local runtime files.
