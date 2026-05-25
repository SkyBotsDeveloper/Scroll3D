# @scroll3d/exporter

Static website exporter foundation for Scroll3D projects.

This package validates a Scroll3D project and returns an in-memory static export
bundle. It does not write to disk or create ZIP files yet.

## Exported Bundle

Default static exports include:

- `index.html`
- `styles.css`
- `scroll-engine.js`
- `frame-manifest.json`
- `assets/manifest.json`
- `project.json`
- `README.md`

Frame and asset files are referenced by path. No heavy generated frames or
binary assets are copied in this phase.

## Public APIs

- `createStaticExporter(config?)`
- `exportStaticProject(project, config?)`
- `StaticProjectExporter`
- HTML, CSS, JavaScript, project JSON, frame manifest, asset, and sanitization
  helpers

## Safety Rules

- Validate projects through `@scroll3d/core`.
- Escape user content in HTML.
- Sanitize export file paths and CSS values.
- Redact secret-looking keys and values.
- Exclude provider configs from exported `project.json`.
- Avoid external CDN dependencies by default.
- Avoid `eval` and user-provided script injection.

## Intentional Phase Limits

- No disk writer yet.
- No ZIP packaging yet.
- No real asset copying yet.
- No real frame extraction yet.
- No full visual editor integration yet.
