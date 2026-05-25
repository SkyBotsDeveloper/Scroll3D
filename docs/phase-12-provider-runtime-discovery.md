# Phase 12 Provider Connection And Local Runtime Discovery Foundation

Phase 12 adds safe provider connection plumbing and local runtime/model manager
discovery foundations. Everything remains disabled-by-default: no paid API calls,
no local model downloads, no local model execution, and no real media generation.

## Provider Connection Plumbing

`@scroll3d/providers` now includes provider connection contracts:

- `ProviderConnectionStatus`
- `ProviderConnectionCheck`
- `ProviderConnectionContext`
- `ProviderConnectionChecker`
- `createProviderConnectionChecker`

Connection statuses distinguish:

- `configured`
- `connected`
- `unavailable`
- `missing-secret`
- `missing-config`
- `unsupported`
- `mock`

Default checks are safe and fast. External network checks are disabled by
default. Mock providers report mock availability. API providers can validate base
URL, model, and `secretRef` presence without making a network call.

## API Provider Scaffolds

API adapter scaffolds can now build request shapes for future activation:

- LLM text/structured output paths
- image generation paths
- generic video generation paths
- code generation paths
- safe authorization header placeholders
- redacted debug output

The request builders do not execute network calls. Raw secret values are not
stored, logged, or serialized.

## Local Provider Discovery

Local provider scaffolds now expose expected endpoint/path and hints:

- Ollama: `http://127.0.0.1:11434`
- ComfyUI: `http://127.0.0.1:8188`
- Scroll3D local runtime: `http://127.0.0.1:4317`
- FFmpeg command: `ffmpeg`

Discovery output is informational. It does not start services, execute models,
download models, or require local tools to be installed.

## Local Runtime Config

`@scroll3d/local-runtime` adds a safe local runtime config plan:

- runtime URL
- model cache directory
- selected model pack
- installed model registry
- provider bindings by stage
- `maxConcurrentHeavyJobs: 1`
- mock fallback setting
- timestamps

The config contains no secrets. Machine-local generated config is written under
`.scroll3d/`, which is ignored by git.

## Model Catalog

The local runtime package now includes a model catalog and pack definitions:

- Lite
- Balanced
- Pro
- Custom

Each model entry tracks stage, provider type, runtime, estimated size, memory
requirements, placeholder install command, notes, and status. All models start as
`not-installed`.

Recommendations consider RAM, VRAM when available, and free disk when available.
If VRAM is unknown, the recommendation includes hybrid/mock fallback warnings.

## Setup Commands

Current commands:

```bash
pnpm dev
pnpm runtime:scan
pnpm runtime:doctor
pnpm runtime:models
pnpm setup:local
```

`pnpm setup:local` now writes `.scroll3d/local-runtime.config.json` as a local
machine plan. It does not download models or run models.

Expected future flow:

1. Run `pnpm dev`.
2. Open Settings.
3. Choose API, Local, or Hybrid mode.
4. For local mode, stop the server and run `pnpm setup:local`.
5. Restart the server.
6. Connect the local runtime from Settings.
7. A future explicit download command installs selected models.
8. Prompt execution loads only the required model for the active stage, one heavy
   model at a time.

## Web Settings

Settings now distinguish:

- configured providers
- connected local runtime placeholder
- unavailable providers
- mock fallback
- missing secret
- missing config
- missing local runtime
- model not installed

Prompt pipeline output also shows provider decision summaries per stage while
continuing to run deterministic mock output.

## Current Limitations

- No real paid API calls.
- No external network connection tests.
- No local model downloads.
- No local model execution.
- No local runtime server implementation.
- No real image/video generation.
- No real frame extraction.
