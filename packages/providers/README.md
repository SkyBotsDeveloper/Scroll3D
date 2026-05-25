# @scroll3d/providers

Provider contracts and deterministic mock providers for Scroll3D.

## Provider Types

- `llm`
- `image`
- `video`
- `frame`
- `code`

## Modes

- `local`
- `api`

## Exports

- `BaseProvider`
- `LLMProvider`
- `ImageProvider`
- `VideoProvider`
- `FrameProvider`
- `CodeProvider`
- `ProviderContext`
- `ProviderRunResult`
- `ProviderRegistry`
- `ProviderSelectionPolicy`
- `ProviderCapabilityMatcher`
- `ProviderConfigLoader`
- `ProviderResolver`
- `ProviderSecretRef`
- `ProviderSecretStore`
- `InMemorySecretStore`
- `ProviderPreset`
- `MockLLMProvider`
- `MockImageProvider`
- `MockVideoProvider`
- `MockFrameProvider`
- `MockCodeProvider`
- `createMockProviders`
- real-provider scaffolds for Ollama, OpenAI-compatible APIs, ComfyUI, FFmpeg,
  generic video APIs, and local code LLMs

The mock providers return deterministic outputs for tests and local development.
They do not download models or call real generation APIs.

## Provider Registry

`ProviderRegistry` stores provider registrations, enforces unique provider IDs,
filters by type or mode, and resolves the required provider for each agent step.
Disabled providers are ignored by default and are only selected when a preferred
provider ID is explicitly requested.

## Provider Selection Policy

`ProviderSelectionPolicy` chooses providers by project mode, required provider
type, preferred provider ID, enabled state, provider availability, capabilities,
fallback order, and secret availability.

Rules:

- Local mode prefers local providers.
- API mode prefers API providers.
- Hybrid mode can mix local and API providers per provider type.
- Mock fallback is used only when configured.
- Disabled or unavailable providers are skipped.
- API providers missing secret references are skipped.
- Selection events and errors are secret-safe.

## Adapter Scaffolds

The real-provider classes are non-networking scaffolds in this phase. They
define IDs, modes, provider types, capability metadata, availability checks, and
clear not-implemented responses. Later phases can activate the adapters without
changing agent contracts.

## BYO API Key Foundation

Provider configs use `secretRef` IDs instead of raw API keys. Keys should be
stored outside project files in a `ProviderSecretStore` implementation. The
in-memory store is for tests and local development only.

Rules:

- Raw API keys are not stored in project JSON.
- Raw API keys are not stored in `scroll3d.config.example.json`.
- Generated websites must never include provider secrets.
- Serialized provider registry/config output redacts secret values.
- Future real providers will resolve secret IDs at runtime.
