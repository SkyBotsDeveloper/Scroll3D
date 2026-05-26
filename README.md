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
- **Phase 4:** provider selection policy, real provider adapter scaffolds, safe
  config format, file-backed pipeline storage, and checkpoint/resume helpers
  completed.
- **Phase 5:** canvas scroll-frame engine, frame math, preloading, rendering,
  responsive frame sets, reduced motion, and timeline segment foundations
  completed.
- **Phase 6:** static exporter foundation for self-hostable HTML, CSS,
  JavaScript, project JSON, frame manifests, asset manifests, and export notes
  completed.
- **Phase 7:** disk export writer, ZIP archive packaging, safe copy planning,
  and export helper APIs completed.
- **Phase 8:** browser developer preview for JSON editing, validation, static
  export preview, generated file inspection, local persistence, and ZIP download
  completed.
- **Phase 9:** first visual editor controls for project basics, theme values,
  section content/order/visibility, scroll scene settings, JSON sync, and export
  refresh completed.
- **Phase 10:** Settings, provider preferences, API/local/hybrid mode controls,
  local runtime setup planning commands, system scan/model recommendation
  foundation, and deterministic mock prompt pipeline completed.
- **Phase 11:** premium prompt-first dashboard UI/UX polish, clearer Generate,
  Visual Editor, Preview & Export, JSON, and Settings workflows completed.
- **Phase 12:** provider connection status contracts, safe API request-shape
  scaffolds, local provider discovery hints, local runtime config planning,
  model catalog, and setup-local config generation completed.
- **Phase 13:** explicit model download planning, model manager summaries,
  offline runtime handshake contracts, and CLI guidance for future local runtime
  connection completed.
- **Phase 14:** consumer-first web app workflow with Normal Mode, hidden
  Advanced tools, guided prompt-to-export steps, simplified editing, preview, and
  ZIP export completed.
- **Phase 15:** AI builder workspace polish completed with a prompt composer,
  dominant browser-style preview, right-side edit/export inspector, categorized
  Advanced tools, clearer empty states, and friendlier normal-mode copy.
- **Phase 16:** UI quality pass completed with a cleaner prompt composer,
  quieter workflow progress, more dominant preview, simplified collapsible
  inspector controls, stronger export actions, and documented open-source
  reference review.
- **Phase 17:** provider/plugin manifest foundation, polished Advanced provider
  setup, SecretRef guidance, runtime visibility cards, and self-hosting guidance
  completed.
- **Phase 18:** cinematic AI-native workspace rebuild completed with a minimal
  prompt-first landing, post-generation workspace mode, collapsible sidebar,
  Preview/Code switcher, global settings center, and universal provider setup
  direction.
- **Phase 19:** cinematic generation experience completed with staged
  AI-director progress, progressive preview emergence, scene timeline
  foundation, device preview controls, focus-preview mode foundation, and
  motion polish.
- **Phase 20:** cinematic scene editor foundation completed with editable scene
  metadata, motion presets, narrative roles, drag-and-drop scene sequencing,
  selected-scene navigation, and preview focus state.
- **Phase 21:** premium AI workspace redesign completed with lighter chrome,
  fewer nested panels, a more dominant preview, calmer sidebars, quieter status
  language, and a command-center settings overlay.

The full no-code canvas editor, real provider execution, model downloads, real
frame extraction implementation, deployment automation, real binary asset/frame
copying, and scene-specific media generation are intentionally not implemented
yet.

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

## Phase 4 Architecture

Phase 4 makes the queued pipeline ready for real providers without requiring
paid API calls or model downloads:

1. `ProviderSelectionPolicy` chooses providers by project mode, provider type,
   availability, capabilities, secret presence, preferences, and fallback rules.
2. Real adapter scaffolds define future Ollama, OpenAI-compatible, ComfyUI,
   FFmpeg, generic API, and local code-provider integration points.
3. `scroll3d.config.example.json` documents safe local config with secret
   references instead of raw API keys.
4. `FilePipelineRunStore` persists pipeline runs, artifacts, events, and
   checkpoints as redacted JSON.
5. Resume helpers retry failed steps, preserve completed artifacts, and avoid
   rerunning completed steps by default.

## Phase 5 Architecture

Phase 5 implements `@scroll3d/scroll-engine`, the static-export-friendly visual
runtime:

1. Pure frame math maps scroll progress to deterministic frame indices.
2. Frame manifests describe desktop, tablet, and mobile image sequences without
   storing heavy assets in the repository.
3. `FramePreloader` loads first, nearby, or all frames with concurrency limits,
   retries, and an in-memory cache.
4. `CanvasFrameRenderer` renders loaded frames with cover, contain, or fill
   behavior and device-pixel-ratio handling.
5. `Scroll3DEngine` connects scroll progress, preloading, canvas rendering,
   responsive target switching, reduced motion, lifecycle cleanup, and timeline
   segment callbacks.

## Phase 6 Architecture

Phase 6 implements `@scroll3d/exporter`, the self-hostable static website bundle
foundation:

1. Projects are validated through `@scroll3d/core`.
2. Scroll scenes are converted into scroll-engine-compatible frame manifests.
3. Static HTML, CSS, and JavaScript runtime glue are generated safely.
4. Redacted `project.json`, `frame-manifest.json`, and `assets/manifest.json`
   files are included in the in-memory bundle.
5. Sanitization blocks path traversal, escapes user content, redacts
   secret-looking values, and avoids external CDN dependencies by default.

## Phase 7 Architecture

Phase 7 extends `@scroll3d/exporter` with export delivery foundations:

1. Static bundles can be written to a configured output directory.
2. ZIP archives can be created in memory or written to disk.
3. Dry-run mode reports planned writes without touching the filesystem.
4. Copy plans describe generated files, asset references, frame references,
   skipped local absolute paths, traversal blocks, and placeholder copy work.
5. `runStaticExport` gives future CLI and web UI code one helper for bundle,
   directory, and ZIP targets.

## Phase 8 Architecture

Phase 8 turns `@scroll3d/web` into an early developer preview:

1. The app loads the sample project from `@scroll3d/core`.
2. Project JSON can be edited, validated, reset, and applied in the browser.
3. Valid projects are exported through `@scroll3d/exporter/browser`.
4. Generated HTML is previewed in a sandboxed iframe with CSS inlined for
   preview.
5. Generated files can be inspected from the browser.
6. ZIP download runs locally with a browser-safe export helper.
7. Current JSON, selected file, and small export history metadata persist in
   `localStorage` when available.

## Phase 9 Architecture

Phase 9 adds the first visual editor controls to `@scroll3d/web`:

1. Structured controls update project basics, mode, theme colors, typography,
   radius, spacing, section text, CTA-like fields, section order, section
   visibility, and scroll scene playback settings.
2. Visual edits regenerate formatted project JSON and validation state.
3. Applying valid raw JSON updates the visual editor from the latest project.
4. Hidden sections use a UI-level `settings.visible === false` flag and are
   filtered from web preview/export output.
5. Static preview, generated file list, and browser ZIP download refresh from
   the latest valid project.

## Phase 10 Architecture

Phase 10 adds the first settings and prompt workflow layer to `@scroll3d/web`:

1. Settings persist local/API/hybrid mode, provider preferences per pipeline
   stage, API provider placeholders, local runtime placeholders, model pack
   preference, and mock fallback state in browser storage.
2. API provider setup uses `secretRef` values only; raw API keys are not stored
   in project JSON, web settings, generated websites, or logs.
3. Local runtime settings explain the future connection flow and
   one-heavy-model-at-a-time execution constraint without starting model
   servers.
4. Browser-safe system scan and model recommendation helpers provide Lite,
   Balanced, Pro, and Custom setup planning.
5. Root scripts provide lightweight local setup planning commands:
   `pnpm runtime:scan`, `pnpm runtime:doctor`, `pnpm runtime:models`, and
   `pnpm setup:local`.
6. The Prompt tab runs a deterministic mock five-step pipeline and can apply the
   generated project update back into the visual editor, JSON, preview, and ZIP
   export workflow.

## Phase 11 Architecture

Phase 11 improves the web app experience without changing the core data model:

1. The app opens on a Generate-first dashboard with a polished header, mode
   badges, current project metrics, prompt examples, and a clear primary CTA.
2. The tab structure is clearer: Generate, Visual Editor, Preview & Export,
   JSON, and Settings.
3. Visual editing panels now explain what they control and use section badges
   for type, order, and visibility.
4. Preview & Export explains the self-hostable static bundle and keeps generated
   file inspection next to the sandboxed preview.
5. Settings presents API, Local, Hybrid, and Mock fallback behavior in more
   approachable mode cards and documents the future local runtime setup flow.
6. The UI remains original to Scroll3D and does not copy proprietary branding,
   copy, assets, layouts, or templates from other products.

## Phase 12 Architecture

Phase 12 makes Settings more realistic while keeping execution disabled:

1. `@scroll3d/providers` exposes connection status contracts and a safe
   connection checker that reports configured, mock, unavailable, missing-secret,
   and missing-config states without external network calls by default.
2. API adapter scaffolds build future request shapes and redacted debug headers
   without sending requests or exposing raw secret values.
3. Local provider scaffolds expose expected Ollama, ComfyUI, FFmpeg, and
   Scroll3D runtime endpoints plus install/connect hints.
4. `@scroll3d/local-runtime` tracks local runtime config plans, selected model
   pack, model registry, provider bindings, and model statuses without secrets.
5. The model catalog describes Lite, Balanced, Pro, and Custom packs with stage
   coverage and not-installed planning entries.
6. `pnpm setup:local` writes `.scroll3d/local-runtime.config.json` as an ignored
   machine-local plan; it downloads nothing and runs no models.
7. The web Settings and mock prompt pipeline show provider decision summaries
   while continuing to use deterministic mock output.

## Phase 13 Architecture

Phase 13 makes local mode planning explicit while keeping downloads and runtime
execution disabled:

1. `@scroll3d/local-runtime` exposes model download plan contracts, per-model
   requirements, risk flags, install instructions, summaries, validation, and
   stage filters.
2. Download plans estimate size, disk use, RAM/VRAM needs, unsupported platform
   entries, and license/resource warnings without using real model URLs.
3. Local runtime handshake contracts describe future runtime URL, version,
   health, capabilities, stage support, model registry summary, and the
   one-model-at-a-time guarantee.
4. Root scripts add `pnpm runtime:plan-downloads` and
   `pnpm runtime:handshake` for CLI planning and offline connection guidance.
5. `pnpm setup:local` writes both `.scroll3d/local-runtime.config.json` and
   `.scroll3d/model-download-plan.json`; both are ignored machine-local files.
6. Web Settings shows a Model Manager section with selected pack, required
   models per stage, size estimates, risk badges, command hints, and a disabled
   download button.

## Phase 14 Architecture

Phase 14 rebuilds the web app around a normal-user workflow:

1. The default app is Normal Mode: Generate, Edit, Preview, Export.
2. The first screen focuses on a large prompt box, example prompts, a clear
   Generate website button, and a dominant preview.
3. A guided stepper explains Prompt, Generate, Edit, Preview, and Export.
4. Normal Edit exposes only common controls: project name, theme basics, section
   text/order/visibility, scroll length, and playback mode.
5. Preview and Export hide generated file internals by default.
6. Advanced tools are still available in a drawer for Settings, Providers,
   Models, JSON, generated files, pipeline details, diagnostics, and runtime
   command help.
7. The UI keeps mock generation and local-only browser export behavior while
   reducing visible technical complexity for first-time users.

## Phase 15 Architecture

Phase 15 polishes the web app into a cleaner AI builder workspace:

1. The default layout is prompt, preview, and edit/export instead of a dense
   developer dashboard.
2. The prompt composer is the main entry point with examples, quick website
   type chips, and a primary Generate website action.
3. Generation progress uses friendly labels: Understand prompt, Design concept,
   Plan motion, Build scroll scene, and Compile website.
4. The preview is the largest visual surface and uses a browser-like frame with
   a clear empty state before generation.
5. Normal editing stays focused on section text, theme basics, scroll feel, and
   ZIP export.
6. Advanced tools are organized as JSON, Generated Files, Providers, Local
   Models, Runtime, and Diagnostics.
7. Open-source AI builder repos were inspected for broad UX patterns only. No
   third-party code, assets, branding, colors, templates, or copy were reused.

## Phase 16 Architecture

Phase 16 tightens the same normal-user workflow after a UI audit:

1. The workflow stepper is quieter so the first action remains the prompt.
2. Prompt composition now groups the textarea and Generate website action into a
   stronger primary surface.
3. Generation progress uses friendlier AI-builder language and hides raw details
   in Advanced.
4. Preview remains the largest panel and adds a nearby Download ZIP action after
   a draft is ready.
5. The right inspector uses collapsible Quick edit, Theme, Sections, and Scroll
   feel groups so the default view is less dense.
6. Advanced remains the place for JSON, generated files, providers, local models,
   runtime details, diagnostics, and technical output.
7. The open-source references were used for license-aware inspiration only. No
   third-party code, components, assets, or copy were reused.

## Phase 17 Architecture

Phase 17 adds provider and self-hosting foundations without changing the mocked
execution model:

1. `@scroll3d/providers` exposes provider plugin manifest schemas, validation
   helpers, and bundled manifests for mock, API, local runtime, ComfyUI, Ollama,
   and FFmpeg scaffolds.
2. Advanced Providers now shows friendly provider cards, capability groups,
   setup guidance, SecretRef examples, and current stage decisions.
3. SecretRef guidance explains that raw API keys stay outside project files,
   exports, generated websites, and logs.
4. Advanced Runtime now shows offline/mock runtime visibility, one-heavy-job
   execution constraints, and future local runtime lifecycle guidance.
5. Advanced Self-hosting explains the static export flow and common deployment
   targets such as Vercel, Netlify, Cloudflare Pages, GitHub Pages, and
   self-hosted nginx.
6. No provider manifest, UI card, or runtime panel performs real network calls,
   model downloads, model execution, deployment, or media generation.

## Phase 18 Architecture

Phase 18 rebuilds the web app shell into an AI-native workspace:

1. Before generation, the app shows a minimal cinematic prompt landing focused
   on examples, website type chips, and a single Generate website action.
2. After mock generation, the app enters a workspace with a top bar, collapsible
   left sidebar, main stage, and right inspector.
3. The top-center Preview/Code switcher lets users move between the generated
   website preview and a read-only generated-file workspace.
4. Advanced tools are consolidated into one global settings center for
   providers, models, runtime, self-hosting, appearance, JSON, files, and
   diagnostics.
5. Provider setup now orients around custom endpoint URLs, model names,
   SecretRefs, and capability selection for future OpenAI-compatible APIs,
   OpenRouter, Ollama, LM Studio, and custom local inference.
6. All provider execution, local inference, model downloads, deployment
   automation, and media generation remain disabled.

## Phase 19 Architecture

Phase 19 improves perceived generation intelligence while keeping the pipeline
mocked/offline:

1. Generation now moves through staged AI-director phases: brief, structure,
   content, motion, and final polish.
2. The preview evolves during generation with a cinematic skeleton instead of
   instantly rendering the final iframe.
3. Workspace panels, progress states, hover states, and preview surfaces use
   subtle motion with reduced-motion safeguards.
4. Preview controls now include desktop, tablet, and mobile frame widths plus a
   focus-preview mode foundation.
5. The sidebar includes a mocked scene timeline with sequence labels,
   transition hints, and motion direction notes.
6. The real provider/runtime architecture remains unchanged; no real models,
   APIs, media generation, or backend execution are enabled.

## Phase 20 Architecture

Phase 20 adds scene-directed editing while preserving the existing project
schema:

1. Scene metadata is stored per section in `section.settings.scene` so older
   projects remain valid and exports continue to use section order.
2. The scene metadata model tracks title, scene type, motion preset, transition
   style, narrative role, intensity, pacing, timing beats, asset placeholder,
   and director notes.
3. The right inspector includes a Scene Director panel with drag-and-drop scene
   sequencing and move-button fallbacks.
4. The sidebar scene timeline now reflects real project sections and syncs the
   selected scene with the inspector and preview.
5. The preview shows the focused scene, narrative role, motion preset, and
   transition label as workspace context.
6. Motion presets and narrative roles are descriptive metadata only; no real
   media generation, frame rendering changes, provider calls, or model execution
   are enabled.

## Phase 21 Architecture

Phase 21 is a UX shell correction pass rather than a feature expansion:

1. The workspace grid now gives the cinematic preview substantially more room on
   desktop while preserving responsive stacking on smaller screens.
2. Heavy cards, nested panel borders, repeated pills, and admin-style labels are
   reduced in favor of floating surfaces, whitespace, and subtle depth.
3. The sidebar and right inspector are quieter contextual tools instead of
   primary visual anchors.
4. The Settings surface is presented as a Control Center overlay so provider,
   model, runtime, JSON, and diagnostics tools stay available without cluttering
   the normal creative path.
5. The redesign was informed by license-reviewed open-source AI builder
   workspaces, but no third-party code, assets, branding, templates, colors, or
   copy were reused.

## Roadmap

- Phase 1: monorepo foundation, core schemas, validation helpers, fixture, tests.
- Phase 2: provider interfaces, agent job orchestration contracts, local runtime
  queue foundation.
- Phase 3: provider registry, secret-safe config loading, resumable queued
  pipeline foundation.
- Phase 4: provider selection policy, adapter scaffolds, safe local config, and
  persistent pipeline checkpoints.
- Phase 5: scroll engine package for frame-sequence playback.
- Phase 6: static exporter for clean standalone websites.
- Phase 7: disk writing, ZIP export, and safe copy planning.
- Phase 8: web developer preview with JSON editing, export preview, and ZIP
  download.
- Phase 9: first visual editor controls and JSON sync.
- Phase 10: settings, runtime setup planning, provider preferences, and mock
  prompt workflow.
- Phase 11: polished prompt-first web dashboard and improved UX.
- Phase 12: provider connection and local runtime discovery foundation.
- Phase 13: explicit model manager/download planning and runtime handshake
  foundation.
- Phase 14: consumer-first web app workflow rebuild.
- Phase 15: polished AI builder workspace for normal users.
- Phase 16: serious UI quality pass for the AI builder workspace.
- Phase 17: plugin provider setup, runtime visibility, and self-hosting
  foundation.
- Phase 18: AI-native cinematic workspace with prompt landing, Preview/Code
  shell, global settings center, and provider compatibility UX.
- Phase 19: cinematic streaming generation feel, progressive preview states,
  scene timeline foundation, and preview environment polish.
- Phase 20: cinematic scene editor with motion presets, narrative roles,
  drag-and-drop sequencing, and scene focus state.
- Phase 21: premium workspace redesign with preview-first layout, lighter
  sidebars, reduced status noise, and command-center advanced tools.

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

Local setup planning commands:

```bash
pnpm runtime:scan
pnpm runtime:doctor
pnpm runtime:models
pnpm setup:local
pnpm runtime:plan-downloads
pnpm runtime:handshake
```

These commands do not download models or run models. They only print local
system information, prerequisite notes, known model packs, and setup
recommendations, model download plans, and offline handshake guidance for future
local runtime phases.

`pnpm setup:local` writes safe ignored local plans at
`.scroll3d/local-runtime.config.json` and
`.scroll3d/model-download-plan.json`. Stop the dev server before running setup,
inspect the plan with `pnpm runtime:plan-downloads`, restart with `pnpm dev`,
and open Settings. Future download commands will install models only after
explicit user action.

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
