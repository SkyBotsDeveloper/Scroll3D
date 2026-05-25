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
- `MockLLMProvider`
- `MockImageProvider`
- `MockVideoProvider`
- `MockFrameProvider`
- `MockCodeProvider`
- `createMockProviders`

The mock providers return deterministic outputs for tests and local development.
They do not download models or call real generation APIs.
