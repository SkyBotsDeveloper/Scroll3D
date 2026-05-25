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

The mock providers return deterministic outputs for tests and local development.
They do not download models or call real generation APIs.

## Provider Registry

`ProviderRegistry` stores provider registrations, enforces unique provider IDs,
filters by type or mode, and resolves the required provider for each agent step.
Disabled providers are ignored by default and are only selected when a preferred
provider ID is explicitly requested.

## BYO API Key Foundation

Provider configs use `secretRef` IDs instead of raw API keys. Keys should be
stored outside project files in a `ProviderSecretStore` implementation. The
in-memory store is for tests and local development only.

Rules:

- Raw API keys are not stored in project JSON.
- Generated websites must never include provider secrets.
- Serialized provider registry/config output redacts secret values.
- Future real providers will resolve secret IDs at runtime.
