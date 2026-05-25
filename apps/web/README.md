# @scroll3d/web

Developer-preview web app for Scroll3D.

## Run

```bash
corepack pnpm --filter @scroll3d/web dev
```

## Current Workflow

- Loads the sample project from `@scroll3d/core`.
- Edits project JSON locally in the browser.
- Validates JSON and the `Scroll3DProject` schema.
- Generates an in-memory static export through `@scroll3d/exporter/browser`.
- Shows a sandboxed static preview and generated file list.
- Downloads the current static export as a ZIP.

The app intentionally avoids real AI generation, real frame extraction, paid API
calls, backend persistence, and heavy generated assets in this phase.
