# @scroll3d/scroll-engine

Canvas frame-sequence scroll playback engine for Scroll3D.

This package turns scroll progress into deterministic frame indices and renders
loaded frames into a 2D canvas. It is designed for exported static websites that
need a cinematic 3D-like feel without requiring WebGL or Three.js.

## Exports

- `Scroll3DEngine`
- `createScroll3DEngine`
- `FramePreloader`
- `CanvasFrameRenderer`
- frame math helpers
- frame manifest validators
- reduced motion helpers
- responsive target helpers
- timeline segment helpers
- `sampleFrameManifest`

## Frame Manifest

A `FrameManifest` describes responsive frame sets:

- desktop, tablet, and mobile targets
- frame count and dimensions
- base path and filename pattern
- optional poster and reduced-motion fallback frames
- optional metadata

Filename patterns support:

- `{index}` for zero-based unpadded frame numbers
- `{index:0000}` for zero-based padded numbers
- `{index:0001}` for one-based padded numbers

## Playback

`Scroll3DEngine` maps scroll progress to a frame index, preloads frames based on
strategy, and renders the current frame to canvas. The engine supports seeking,
pause/resume, resize, target switching, destruction, callbacks, and non-window
scroll containers.

Preload strategies:

- `none`
- `first`
- `nearby`
- `all`

## Reduced Motion

The engine can respect `prefers-reduced-motion` and switch to poster, first
frame, or disabled motion behavior. Reduced-motion assets are referenced by URL
only; no generated frames are stored in this package.

## Responsive Targets

Responsive helpers infer targets by viewport width:

- mobile: `<= 767`
- tablet: `<= 1023`
- desktop: `>= 1024`

Explicit target overrides are supported for editor previews and exports.

## Timeline Segments

Timeline segments map progress ranges to IDs and labels so future UI and export
packages can sync text sections with cinematic frame playback.
