# Scroll3D

Scroll3D is an open-source AI 3D website builder. It turns prompts, images,
and videos into editable cinematic scroll-driven websites using local or
API-based AI agents.

The project exists to make rich, frame-sequence website experiences easier to
create, inspect, edit, self-host, and export as clean web projects. Scroll3D is
an original project and must not copy proprietary branding, UI, wording,
templates, assets, or product behavior from other tools.

## Creator

Creator: Siddhartha Abhimanyu

Contact:

- Telegram: @iflexelite
- Instagram: elite.sid

## Modes

- **Local mode:** run supported local models and tools on the user's machine.
- **API mode:** use provider APIs through bring-your-own API keys.
- **Hybrid mode:** combine local and API providers in the same project.

The local runtime is designed around a one-heavy-model-at-a-time constraint so
consumer machines can run model jobs sequentially without oversubscribing GPU or
memory resources.

## Multi-Agent Pipeline

Scroll3D is planned around a modular pipeline:

1. Prompt Understanding Agent
2. Image Generation Agent
3. Video Generation Agent
4. Frame Extraction Agent
5. Website Coding/Compilation Agent

Each agent should use provider abstractions so local and API-backed models can
be swapped without rewriting project or export logic.

## Static Export Goal

Exported websites should work without a backend. The long-term export target is
clean HTML, CSS, JavaScript, assets, frame manifests, and optional project JSON
that can be hosted on static infrastructure.

## Phase Status

- **Phase 1:** monorepo foundation and core schema package completed.
- **Phase 2:** provider interfaces, mock providers, agent orchestration
  contracts, and sequential local runtime queue foundation completed.
- **Phase 3:** provider registry, BYO API-key foundation, pipeline state, and
  queued agent pipeline runner completed.

The visual editor, real provider integrations, model downloads, frame extraction
implementation, and exporter are intentionally not implemented yet.

## Phase 2 Architecture

Phase 2 adds three foundations:

- `@scroll3d/providers`: typed provider contracts for local and API modes, with
  deterministic mock providers for LLM, image, video, frame, and code work.
- `@scroll3d/agents`: typed agent contracts and a sequential orchestrator for
  prompt understanding, image generation, video generation, frame extraction,
  and website compilation.
- `@scroll3d/local-runtime`: an in-memory sequential job runner for future local
  model execution where only one heavy model job runs at a time.

Provider implementations are intentionally mock-only in this phase. API keys,
real model downloads, and real image/video generation belong in later phases.

## Phase 3 Architecture

Phase 3 turns the contracts into an internal pipeline foundation:

1. Provider registry resolves mock, local, or API-mode providers.
2. Provider configs reference secret IDs instead of raw API keys.
3. Pipeline state records steps, events, artifacts, checkpoints, failures, and
   retries.
4. Agent steps run through the sequential local runtime queue.
5. Heavy model jobs remain one-at-a-time.

BYO API keys are represented by secret references. Raw keys should live outside
project files, never be exported into generated websites, and never appear in
logs or serialized pipeline/provider output.

## Roadmap

- Phase 1: monorepo foundation, core schemas, validation helpers, fixture, tests.
- Phase 2: provider interfaces, agent job orchestration contracts, local runtime
  queue foundation.
- Phase 3: provider registry, secret-safe config loading, resumable queued
  pipeline foundation.
- Phase 4: scroll engine package for frame-sequence playback.
- Phase 5: static exporter for clean standalone websites.
- Phase 6: web editor with visual editing and JSON/code editing.
- Phase 7: plugin provider system and self-hosting documentation.

## Run Locally

Requirements:

- Node.js 22 or newer
- pnpm 11, or Corepack enabled

Install dependencies:

```bash
pnpm install
```

Start the web app:

```bash
pnpm dev
```

Run verification:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If pnpm is not installed globally, run the same commands through Corepack:

```bash
corepack pnpm install
corepack pnpm dev
```

## Contributing

Contributions should keep packages modular, typed, schema-first, and covered by
focused tests for core logic. See [CONTRIBUTING.md](./CONTRIBUTING.md) and
[AGENTS.md](./AGENTS.md).

## Safety And Legal Note

Do not copy proprietary UI, assets, templates, prompts, product copy, branding,
or distinctive behavior from other products. Use original designs, original
copy, permissively licensed assets, or user-owned materials.
