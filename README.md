# Scroll3D

Scroll3D is an open-source AI 3D website builder. It turns prompts, images,
and videos into editable cinematic scroll-driven websites using local or
API-based AI agents.

The project exists to make rich, frame-sequence website experiences easier to
create, inspect, edit, self-host, and export as clean web projects. Scroll3D is
an original project and must not copy proprietary branding, UI, wording,
templates, assets, or product behavior from other tools.

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

## Phase 1 Status

Phase 1 creates the production-ready monorepo foundation and implements the core
schema package. The visual editor, provider integrations, local runtime, frame
extractor, and exporter are intentionally not implemented yet.

## Roadmap

- Phase 1: monorepo foundation, core schemas, validation helpers, fixture, tests.
- Phase 2: provider interfaces and agent job orchestration contracts.
- Phase 3: local runtime queue with one heavy model job running at a time.
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
