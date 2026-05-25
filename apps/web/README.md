# @scroll3d/web

Developer-preview web app for Scroll3D.

## Run

```bash
corepack pnpm --filter @scroll3d/web dev
```

## Current Workflow

- Loads the sample project from `@scroll3d/core`.
- Opens on a prompt-first Generate tab with example prompts and a mock pipeline.
- Edits project basics, theme values, sections, and scroll scene settings with
  structured visual controls.
- Edits project JSON locally in the browser.
- Keeps visual changes and JSON text synchronized.
- Validates JSON and the `Scroll3DProject` schema.
- Generates an in-memory static export through `@scroll3d/exporter/browser`.
- Shows a sandboxed static preview and generated file list.
- Downloads the current static export as a ZIP.
- Stores Settings for API/local/hybrid mode, provider preferences, and mock
  fallback locally in the browser.
- Runs a deterministic mock prompt pipeline and applies generated project
  updates back into the editor/export workflow.

The app intentionally avoids real AI generation, real frame extraction, paid API
calls, backend persistence, and heavy generated assets in this phase.

## Visual Editor Limits

- Section visibility is stored as `settings.visible === false` and filtered from
  preview/export output in the web helper.
- Section reordering uses simple up/down buttons.
- Nested section content is edited as JSON text.
- No drag/drop editor or no-code canvas exists yet.

## Dashboard Structure

The app is organized as a polished local dashboard:

- `Generate`: prompt input, example chips, mode summary, mock pipeline progress,
  and apply generated project action.
- `Visual Editor`: project basics, theme, sections, and scroll scene controls.
- `Preview & Export`: sandboxed static preview, export status, ZIP download, and
  generated file inspection.
- `JSON`: power-user project JSON editor with validation.
- `Settings`: API/local/hybrid mode, provider preferences, local runtime setup
  planning, and model recommendation foundation.

## Settings And Prompt Workflow

- `Settings` configures local/API/hybrid mode and provider preferences per
  prompt, image, video, frame, and code stage.
- API provider entries use `secretRef` values only. Raw API keys are not stored.
- API provider connection checks validate local config only; real network calls
  are disabled in developer preview.
- Local runtime controls are placeholders for future runtime connection and
  model manager work.
- Settings includes a Model Manager view that estimates required models,
  download size, disk needs, warning/risk badges, and command hints without
  downloading anything.
- The Local Runtime section shows an offline handshake summary, runtime URL,
  config path, and one-model-at-a-time execution guarantee.
- Local runtime status distinguishes missing config, missing runtime, model
  not-installed, configured, connected, unavailable, and mock fallback states.
- The system scan panel uses browser-safe information only; run
  `corepack pnpm runtime:scan` from the repo root for a fuller local setup
  planning scan.
- The `Prompt` tab runs mock providers only and does not make network calls.
- Prompt runs show provider decision summaries for each stage before applying
  deterministic mock project updates.

## Local Runtime Planning Commands

From the repository root:

```bash
corepack pnpm setup:local
corepack pnpm runtime:plan-downloads
corepack pnpm runtime:handshake
```

These commands create or inspect ignored `.scroll3d/` planning files. They do
not download models, run local inference, make paid API calls, or contact a
runtime server in this phase.
