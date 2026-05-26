# Provider Manifest Spec

Provider manifests describe provider/plugin metadata for Scroll3D. They are
intended for future plugin discovery, setup guidance, marketplace-like listings,
and provider capability matching.

They do not contain raw secrets and do not execute providers.

## Shape

```ts
interface ProviderPluginManifest {
  schemaVersion: "1";
  providerId: string;
  displayName: string;
  version: string;
  description: string;
  mode: "mock" | "local" | "api";
  providerType: "llm" | "image" | "video" | "frame" | "code";
  capabilities: ProviderPluginCapability[];
  runtimeRequirements: ProviderPluginRuntimeRequirements;
  setupInstructions: ProviderPluginSetupInstructions;
  tags: string[];
  metadata: Record<string, unknown>;
}
```

## Capabilities

Capabilities describe what a provider can support:

- `id`
- `label`
- `providerType`
- `description`
- `heavy`

The `heavy` flag helps future runtime planning keep expensive model jobs
sequential.

## Runtime Requirements

Runtime requirements describe setup constraints:

- whether network access is needed
- whether a local runtime is needed
- whether a SecretRef is needed
- supported platforms
- RAM recommendations
- local endpoints or commands
- human-readable notes

API providers should require a SecretRef instead of storing raw API keys.

## Setup Instructions

Setup instructions are user-facing metadata:

- summary
- setup steps
- example SecretRefs such as `openai.main`
- optional documentation URL

## Safety Rules

- Do not store raw API keys in manifests.
- Do not store local machine secrets in manifests.
- Do not store provider credentials in exported websites.
- Do not make network calls from manifest parsing.
- Do not run local models from manifest parsing.
- Keep manifests deterministic and safe to serialize.

## Current Bundled Manifests

The current package includes manifests for:

- Scroll3D Mock LLM
- Scroll3D Mock Media
- OpenAI-compatible API scaffold
- Generic Video API scaffold
- Ollama local LLM scaffold
- ComfyUI local media scaffold
- FFmpeg frame tooling scaffold

All real execution remains disabled in this phase.
