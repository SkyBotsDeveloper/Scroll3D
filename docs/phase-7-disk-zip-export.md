# Phase 7 Disk And ZIP Export

Phase 7 extends `@scroll3d/exporter` beyond the in-memory static bundle. The
package can now write bundles to disk, package bundles into ZIP archives, and
produce safe copy plans for assets and frame references.

## Export Targets

The exporter supports three internal targets:

- `bundle`: returns the in-memory `StaticExportBundle`.
- `directory`: writes bundle files into an output folder.
- `zip`: returns a ZIP buffer and can optionally write it to disk.

The `runStaticExport(project, options)` helper gives future CLI and web UI code a
single entry point for these targets.

## Writing Bundles To Disk

`writeStaticExportBundle(bundle, config)` writes all files from a static export
bundle to `config.outputDir`.

Safety rules:

- every relative file path is sanitized
- path traversal is blocked
- writes are resolved under the configured output directory
- `dryRun` reports planned files without writing
- `overwrite: false` skips existing files
- `preserveExisting: true` keeps existing files untouched
- dotfiles are skipped unless `includeDotfiles` is enabled
- output directory cleaning refuses unsafe root/current-directory targets

Disk export intentionally writes text bundle files only. It does not copy heavy
binary assets or frame folders yet.

## ZIP Export

`createZipFromBundle(bundle, config)` creates a ZIP archive buffer from the
bundle. `writeZipFromBundle(bundle, config)` writes that archive to
`config.outputPath`.

Default ZIP contents include:

- `index.html`
- `styles.css`
- `scroll-engine.js`
- `project.json`
- `frame-manifest.json`
- `assets/manifest.json`
- `README.md`

ZIP export can include an optional root directory. It does not include raw
provider secrets, local runtime data, large generated frames, or local absolute
asset paths.

## Copy Planning

Copy plans describe what should happen to bundle files, assets, and frames
without copying heavy files in this phase.

Rules:

- generated bundle files are planned as `copy`
- normal asset and frame paths are planned as `reference`
- remote URLs are referenced
- local absolute paths are skipped by default
- traversal paths are blocked
- missing paths produce warnings
- `copy-placeholder` records future copy intent without moving files

This keeps the exporter useful for self-hostable project structure generation
while avoiding accidental commits of large assets or local machine paths.

## Why Heavy Assets And Frames Are Not Stored

Scroll3D projects can eventually generate hundreds or thousands of frame images.
Those files should be produced by local/API providers and copied into an export
directory selected by the user. They should not live in the source repository.

The Phase 7 copy plan is the contract that future frame extraction and export UI
work can use to decide what should be copied, referenced, skipped, or warned.

## Future Integration

Later phases can add:

- real asset/frame binary copying
- ZIP download buttons in the web app
- project export history
- checksums for copied files
- a full CLI command built on `runStaticExport`
- progress reporting for large frame directories
