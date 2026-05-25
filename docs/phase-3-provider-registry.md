# Phase 3 Provider Registry

Creator: Siddhartha Abhimanyu

Contact:

- Telegram: @iflexelite
- Instagram: elite.sid

## Purpose

The provider registry is the internal source of truth for resolving local,
API-mode, and mock providers. Agent code asks for a provider type such as `llm`,
`image`, `video`, `frame`, or `code`; the registry chooses the enabled provider
or an explicitly requested provider ID.

## Provider Config Loading

Provider configs are safe local objects with:

- `id`
- `name`
- `type`
- `mode`
- `enabled`
- `provider`
- optional `model`
- optional `baseUrl`
- optional `secretRef`
- optional `capabilities`

Phase 3 includes mock presets for local/API LLM, image, video, frame, and code
providers. Real provider implementations are later-phase work.

## Secret References

BYO API keys are represented by `secretRef` IDs. Raw keys must live outside
project files in a secret store.

Rules:

- Raw API keys are never stored in project JSON.
- Raw API keys are never exported into generated websites.
- Logs and serialized registry output redact secret values.
- Future real providers will resolve `secretRef` IDs at runtime.

## Local/API/Hybrid Modes

The registry supports mixed provider modes. A project can use local providers for
LLM and frame extraction, API providers for image/video/code generation, or any
hybrid combination supported by installed providers.
