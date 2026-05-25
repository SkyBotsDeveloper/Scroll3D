# Phase 10 Settings, Runtime Planning, And Mock Prompt Workflow

Phase 10 adds the first settings and prompt workflow layer to the Scroll3D web
app. The goal is to make the developer preview feel like a local-first AI
website builder while staying fully offline and mock-only.

## Web App Settings

The web app now includes `Settings` and `Prompt` tabs alongside the Visual,
JSON, and Export tabs.

Settings cover:

- project execution mode: `local`, `api`, or `hybrid`
- provider preference per pipeline stage
- API provider configuration placeholders
- local runtime connection status placeholders
- model pack preference and mock fallback behavior
- browser-safe system scan and model recommendation display

Settings are stored in browser `localStorage` when available. They are kept
separate from the project JSON so generated websites do not receive provider
configuration or secret references.

## Provider Preferences

Pipeline stages are:

- prompt
- image
- video
- frame
- code

Each stage can use `auto`, `local`, `api`, or `mock`. In this phase the actual
pipeline uses deterministic mock providers only. The provider selection display
explains what would be selected and where missing configuration would block a
future local/API provider.

Mock fallback is enabled by default for the developer preview.

## API Provider Foundation

API provider settings support:

- provider name
- provider type
- base URL
- optional model name
- `secretRef`
- enabled/disabled state

Raw API keys are intentionally not accepted or stored. Future provider
implementations should resolve `secretRef` values from a user-controlled secret
store outside exported project files.

## Local Runtime Foundation

The Local Runtime panel shows:

- runtime status placeholder
- runtime URL placeholder
- config path placeholder
- model cache path placeholder
- installed model list placeholder
- the `pnpm setup:local` command hint

The runtime still does not start external model servers, download models, or run
inference. It documents the future one-heavy-model-at-a-time execution model.

## System Scan And Model Recommendations

Browser scans are intentionally conservative. They can read only limited
information such as browser-reported CPU concurrency and optional memory hints.

The root scripts provide a safer local setup planning foundation:

```bash
pnpm runtime:scan
pnpm runtime:doctor
pnpm runtime:models
pnpm setup:local
```

These scripts print OS, architecture, CPU count, RAM, Node version, optional
FFmpeg availability, and known model packs. They do not download models or run
models.

Model packs are planning targets:

- Lite: low-spec CPU-first planning
- Balanced: general local-first target
- Pro: higher-memory future local media target
- Custom: manual advanced setup path

## Mock Prompt Pipeline

The Prompt tab lets a user enter a website prompt and run a deterministic mock
pipeline:

1. Prompt Understanding
2. Image Generation
3. Video Generation
4. Frame Extraction
5. Website Compilation

The result includes step status, artifacts, warnings, and a validated project
update. Applying the generated project updates the visual editor, synchronized
JSON, preview bundle, generated file list, and ZIP download source.

## Current Limitations

- Real provider connections are not enabled.
- Real paid API calls are not made.
- Local models are not downloaded or executed.
- Runtime Connect is a placeholder.
- Hardware scans from the browser are low-confidence.
- The mock pipeline does not generate real images, videos, or frames.

## Future Flow

The intended local-first flow is:

1. Run `pnpm dev`.
2. Open Settings and choose API, Local, or Hybrid mode.
3. For local mode, stop the server and run `pnpm setup:local`.
4. Later phases will download selected model packs.
5. Restart the server and connect the local runtime in Settings.
6. Prompt execution loads and runs only the model needed for the current stage,
   with one heavy model job active at a time.

The next phase should connect real provider credentials and local runtime
process discovery without requiring model downloads by default.
