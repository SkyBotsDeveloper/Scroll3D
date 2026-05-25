# Phase 6 Static Exporter

Phase 6 implements `@scroll3d/exporter`, the package that turns validated
Scroll3D projects into clean self-hostable static website bundles.

## Architecture

The exporter works in memory:

1. Validate the input with `@scroll3d/core`.
2. Convert the project scroll scene into a scroll-engine frame manifest.
3. Generate semantic static HTML.
4. Generate CSS from the project theme and section layout.
5. Generate standalone JavaScript runtime glue.
6. Generate redacted `project.json`.
7. Generate asset and frame manifest files.
8. Return a `StaticExportBundle`.

Disk writing and ZIP packaging are intentionally deferred.

## Bundle Files

Default exports include:

- `index.html`
- `styles.css`
- `scroll-engine.js`
- `frame-manifest.json`
- `assets/manifest.json`
- `project.json`
- `README.md`

The bundle is suitable for a future disk writer or ZIP exporter.

## HTML, CSS, And JavaScript

HTML generation includes metadata, a canvas scene, overlay sections, reduced
motion fallback markup, noscript fallback, stylesheet links, and runtime script
references.

CSS generation includes theme variables, canvas scene layout, overlay layout,
responsive rules, and reduced-motion rules. It does not import external fonts or
network resources by default.

JavaScript generation emits lightweight static runtime glue. It loads
`frame-manifest.json`, maps scroll progress to frames, renders images to canvas,
handles resize, supports reduced motion, and cleans up listeners on page unload.
Future phases can replace this glue with a bundled `@scroll3d/scroll-engine`
runtime.

## Frame Manifest Export

The exporter converts `ScrollScene.frameSets` into a scroll-engine-compatible
manifest. Frame paths remain references; generated frame assets are not stored
in this repository.

Timeline segments are derived from section order or section scene ranges so
future overlays and editor tools can sync with scroll progress.

## Asset Handling

Asset handling supports:

- reference mode
- copy-placeholder mode
- asset manifest generation
- warnings for unsafe or missing paths

Local absolute paths and traversal paths are not exported by default.

## Security And Sanitization

The exporter escapes HTML, escapes attributes, sanitizes output paths, sanitizes
CSS identifiers and values, redacts secret-looking values, and avoids
user-provided script injection.

Provider configs and raw API keys are not included in exported websites.

## Not Included Yet

- Real frame extraction
- Asset copying
- ZIP export
- Writing files to disk
- Full editor integration
- Paid API calls or model downloads
