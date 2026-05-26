# @scroll3d/web

Developer-preview web app for Scroll3D.

## Run

```bash
corepack pnpm --filter @scroll3d/web dev
```

## Current Workflow

- Loads the sample project from `@scroll3d/core`.
- Opens in a three-panel AI builder workspace: prompt controls, live preview,
  and edit/export inspector.
- Guides users through Prompt, Generate, Edit, Preview, and Export while keeping
  Advanced tools hidden by default.
- Keeps the first screen focused on the prompt, examples, Generate website
  action, large preview, and compact inspector.
- Edits common project basics, theme values, sections, and scroll feel without
  showing raw provider/model/runtime details.
- Validates JSON and the `Scroll3DProject` schema.
- Generates an in-memory static export through `@scroll3d/exporter/browser`.
- Shows a large sandboxed static preview.
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
- Section reordering uses simple up/down buttons. Scene sequencing also supports
  browser-native drag-and-drop plus move-button fallbacks.
- Nested section content is edited as JSON text.
- No full drag/drop page canvas or no-code layout editor exists yet.

## Dashboard Structure

The app is organized into a prompt-first landing and a generated workspace.

Before generation:

- The first screen focuses on Scroll3D, a large prompt box, example prompt cards,
  quick website type chips, and the Generate website CTA.
- JSON, provider tables, model catalogs, generated files, runtime diagnostics,
  and setup commands are hidden.

After generation:

- Left: collapsible workspace sidebar with the current prompt, generation
  progress, section navigation, asset placeholders, history placeholders, and
  regenerate/new project actions.
- Center: top-center Preview/Code switcher. Preview shows the browser-style
  website preview. Code shows a generated-file explorer and read-only code panel.
- Right: simple inspector for edit/export controls.
- Settings: one global settings center for providers, models, runtime,
  self-hosting, appearance, JSON, generated files, and diagnostics.

Global Settings includes:

- `Providers`: API/local/hybrid mode and provider preferences.
- `Local Models`: local model planning and download-plan summaries.
- `Runtime`: local runtime setup and one-model-at-a-time execution guidance.
- `Self-hosting`: static export portability and manual deployment guidance.
- `Appearance`: full structured project editor.
- `JSON`: power-user project JSON editor with validation.
- `Generated Files`: generated file list and text preview.
- `Diagnostics`: mock pipeline details, sync/export status, recent downloads,
  commands, and phase notes.

The Phase 15 layout was inspired only by broad open-source AI builder UX
patterns: prompt-first generation, preview-dominant workspaces, concise status
chips, and advanced tools hidden from the default path. No third-party code,
assets, branding, templates, colors, or copy were reused.

The Phase 16 quality pass kept that approach and further reduced clutter. The
open-source references were reviewed again for licensing and broad UX patterns,
but no third-party frontend code or assets were copied.

Phase 17 keeps Normal Mode simple and improves Advanced tools with a
plugin-ready provider setup surface, SecretRef help, runtime visibility cards,
and self-hosting guidance for Vercel, Netlify, Cloudflare Pages, GitHub Pages,
and self-hosted nginx. These screens are guidance and metadata only; no real API
calls, model execution, downloads, or deployment automation are enabled.

Phase 18 rebuilds the app into a cinematic AI workspace. The app starts with a
minimal prompt landing and transitions into an immersive workspace only after a
mock website draft is generated. The new Code view is a read-only foundation for
future Monaco/live editing.

Phase 19 makes generation feel more cinematic and alive. Mock generation now
paces through AI-director stages, the preview shows progressive skeleton states
before the final iframe appears, the sidebar includes a scene timeline with
motion hints, and the preview surface adds desktop/tablet/mobile controls plus a
focus-preview foundation.

Phase 20 turns the workspace into a scene-directed editor. The right inspector
adds a Scene Director panel for scene metadata, motion presets, transitions,
narrative roles, pacing, intensity, director notes, and drag-and-drop scene
sequencing. The sidebar timeline now reflects real project sections, and the
preview shows the focused scene so users can direct the story before future
scene-specific regeneration exists.

Phase 21 is a premium workspace correction pass. The shell now gives the preview
more visual dominance, reduces nested dashboard cards, softens the sidebar and
inspector, moves complex systems into a calmer Control Center overlay, and uses
quieter status language. Open-source AI builder references were license-reviewed
for broad workspace inspiration only; no third-party code, assets, branding, or
copy were reused.

Phase 22 makes the preview the primary product surface. Entering focus preview
now affects the full app shell: the sidebar compresses into a compact rail, the
inspector becomes lightweight contextual tabs, device/scene/export controls
float over the preview stage, and the status chrome recedes. The change is
visual and interaction-focused only; generation, providers, runtime, exports,
and model systems remain mocked/offline as before.

## Settings And Prompt Workflow

- `Settings` configures local/API/hybrid mode and provider preferences per
  prompt, image, video, frame, and code stage.
- API provider entries use `secretRef` values only. Raw API keys are not stored.
- API provider connection checks validate local config only; real network calls
  are disabled in developer preview.
- Provider setup is shaped around custom endpoint URLs, model names, SecretRefs,
  and per-stage capabilities for future OpenAI-compatible APIs, OpenRouter,
  Ollama, LM Studio, and custom local inference.
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

Normal Mode intentionally hides provider tables, model catalogs, runtime
handshake details, JSON, and generated file internals until the user opens
Advanced tools.

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
