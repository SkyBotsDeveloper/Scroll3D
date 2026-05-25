# Phase 4 Provider Selection

Phase 4 adds the provider selection layer that sits between project mode,
provider config, secrets, and the queued agent pipeline.

## Selection Inputs

`ProviderSelectionPolicy` evaluates:

- project mode: `local`, `api`, or `hybrid`
- required provider type: `llm`, `image`, `video`, `frame`, or `code`
- optional preferred provider ID
- enabled/disabled provider state
- provider mode and mock fallback policy
- provider availability
- required capabilities
- secret availability for API providers
- configured fallback rules

The result records the selected provider, rejected providers, health reasons,
and a secret-safe explanation. Raw secrets are never included in selection
metadata.

## Mode Strategy

- Local mode prefers local providers. Mock fallback is used only when explicitly
  allowed.
- API mode prefers API providers. Mock fallback is used only when explicitly
  allowed.
- Hybrid mode can mix local and API providers per provider type through
  preferences and fallback rules.

Disabled providers are skipped unless a future diagnostics flow explicitly asks
to inspect them.

## Adapter Scaffolds

The real provider adapter classes are safe scaffolds. They export stable
interfaces and capability metadata, but do not make external calls yet.

Current scaffolds:

- `OpenAICompatibleLLMProvider`
- `OllamaLLMProvider`
- `OpenAICompatibleImageProvider`
- `ComfyUIImageProvider`
- `GenericAPIVideoProvider`
- `ComfyUIVideoProvider`
- `FFmpegFrameProvider`
- `OpenAICompatibleCodeProvider`
- `LocalCodeLLMProvider`

API scaffolds require config plus a `secretRef` before they can report
available. Local scaffolds require a local endpoint, model, or path. FFmpeg is
represented as a frame-provider scaffold without requiring FFmpeg to be
installed in this phase.

## Config Without Secrets

`scroll3d.config.example.json` shows the safe local config shape:

- project default mode
- provider definitions
- provider preferences per type
- fallback rules
- local runtime paths
- mock fallback setting

Provider configs reference secrets by ID, for example
`"secretRef": { "id": "openai-api-key" }`. Raw API keys stay outside project
files and config examples.

Future secret storage can use `.env`, OS keychains, self-hosted secret stores,
or encrypted local stores. Generated websites must never include provider
secrets.
