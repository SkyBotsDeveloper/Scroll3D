# Phase 8 Web Preview And Export

Phase 8 turns the web app into an early developer preview for Scroll3D. It runs
fully in the browser and uses the existing core schema and static exporter
packages.

## Running The Web App

Install dependencies and start the app:

```bash
corepack pnpm install
corepack pnpm dev
```

The app loads the sample Scroll3D project, validates edits locally, generates a
static export bundle, previews the generated HTML, lists output files, and
downloads the export as a ZIP.

## Developer Preview Workflow

The first screen is the usable workflow:

1. Load the sample project from `@scroll3d/core`.
2. Edit the project JSON in a browser textarea.
3. Validate JSON syntax and the `Scroll3DProject` schema.
4. Apply valid JSON to regenerate the static export bundle.
5. Preview generated `index.html` in a sandboxed iframe.
6. Inspect generated files.
7. Download a ZIP without a backend.

The browser stores the current project JSON, selected file, and lightweight
export history metadata in `localStorage` when available.

## Static Export Preview

The preview uses the in-memory bundle from `@scroll3d/exporter/browser`.
Generated CSS is inlined into the iframe document for preview only. Generated
scripts are removed from the preview document and the iframe is sandboxed, so
the preview stays constrained while still showing the exported structure.

## Browser ZIP Download

`@scroll3d/exporter/browser` exposes a browser-safe ZIP helper that uses JSZip to
create a `Blob`. The web app turns that Blob into a local download named
`scroll3d-export.zip`.

No backend, paid API call, model download, heavy generated frame asset, or raw
provider secret is required.

## Current Limitations

- No visual drag/drop editor yet.
- No AI generation UI yet.
- No real frame extraction yet.
- No real binary asset/frame copying yet.
- Preview frame references point at sample paths without bundled frame assets.
- Export history is local browser metadata only.

## Next Integration Points

Future phases can connect the queued agent pipeline, provider registry, visual
section editing, scroll-engine runtime preview, real frame extraction, and
download/export actions into this developer preview shell.
