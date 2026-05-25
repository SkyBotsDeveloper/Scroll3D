# @scroll3d/exporter

Static website exporter foundation for Scroll3D projects.

This package validates a Scroll3D project and can return an in-memory static
export bundle, write that bundle to disk, create a ZIP archive, and produce a
safe copy plan for assets and frame references.

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
- `exportStaticProjectToBundle(project, config?)`
- `exportStaticProjectToDirectory(project, staticConfig, diskConfig)`
- `exportStaticProjectToZip(project, staticConfig, zipConfig)`
- `createZipFromBundle(bundle, config?)`
- `writeZipFromBundle(bundle, config)`
- `writeStaticExportBundle(bundle, config)`
- `createExportCopyPlan(project, bundle, options?)`
- `runStaticExport(project, options)`
- `StaticProjectExporter`
- HTML, CSS, JavaScript, project JSON, frame manifest, asset, and sanitization
  helpers

Browser apps should import from `@scroll3d/exporter/browser`. That entrypoint
exposes the in-memory exporter and browser ZIP Blob helper without importing the
Node disk writer.

## Disk Export

Disk export writes bundle files into a configured output directory. The writer:

- blocks path traversal
- resolves every output path under the output directory
- supports `dryRun`
- supports cleaning the output directory safely
- respects `overwrite` and `preserveExisting`
- skips dotfiles unless explicitly enabled

The writer does not copy real binary assets or frame directories yet.

## ZIP Export

ZIP export packages the static bundle into a `Buffer` and can optionally write
that archive to disk. ZIPs include the same default files as the in-memory
bundle and can place them under an optional root directory.

No CDN dependency, local absolute asset path, or raw secret is added to the ZIP
by the exporter.

## Copy Planning

Copy plans describe what a future file-copying layer should do with generated
bundle files, assets, and frame references.

- `reference` mode records existing paths without copying.
- `copy-placeholder` mode records warnings/placeholders for future binary copy
  work.
- Remote URLs are referenced.
- Local absolute paths and traversal paths are skipped with warnings.

## Safety Rules

- Validate projects through `@scroll3d/core`.
- Escape user content in HTML.
- Sanitize export file paths and CSS values.
- Redact secret-looking keys and values.
- Exclude provider configs from exported `project.json`.
- Avoid external CDN dependencies by default.
- Avoid `eval` and user-provided script injection.
- Keep raw provider secrets out of bundles, ZIPs, and copy plans.

## Intentional Phase Limits

- No real frame extraction yet.
- No real asset or frame binary copying yet.
- No full visual editor integration yet.
