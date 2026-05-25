# Phase 15: AI Builder UX Polish

Phase 15 reshapes the Scroll3D web app into a calmer AI builder workspace for
normal users. The default screen now focuses on the core path:

1. Type a prompt.
2. Generate a website draft.
3. Preview it.
4. Edit section text, theme, and scroll feel.
5. Download a ZIP export.

Advanced provider, model, runtime, JSON, diagnostics, and generated-file details
remain available, but they no longer dominate the first screen.

## Workspace Layout

The default workspace uses three areas:

- Left: prompt composer, example prompts, quick website type chips, and friendly
  generation progress.
- Center: large browser-style preview with a clear empty state before
  generation and sandboxed static preview after generation.
- Right: edit/export inspector with common section, theme, scroll, and ZIP
  controls.

The header keeps the product name, project name, developer preview mode, Export
action, and Advanced toggle visible without showing provider or model internals.

## Prompt-First Flow

The prompt composer uses normal-user language:

- Generate website
- Website draft ready
- Edit website
- Preview website
- Export ZIP

The five generation steps are intentionally friendly:

1. Understand prompt
2. Design concept
3. Plan motion
4. Build scroll scene
5. Compile website

Raw pipeline artifacts, provider decisions, runtime details, and logs are hidden
inside Advanced tools.

## Preview And Export

Preview is the dominant workspace area. Before generation it shows a simple
empty state. After generation it renders the exported website in a sandboxed
iframe inside a browser-like frame.

Export remains one-click in normal mode:

- Download ZIP
- Self-hostable static website
- No backend required

Detailed generated file inspection moved to Advanced > Generated Files.

## Advanced Tools

Advanced tools are organized into:

- JSON
- Generated Files
- Providers
- Local Models
- Runtime
- Diagnostics

This keeps local/API/hybrid setup, local model planning, runtime handshake
details, command help, pipeline diagnostics, and full JSON editing available
without making them part of the default user path.

## Open-Source Reference Review

The following open-source projects were inspected for broad UX patterns only:

- `dyad-sh/dyad`: local-first AI builder onboarding and provider simplicity.
  License review: Apache 2.0 for code outside `src/pro`; `src/pro` is listed as
  fair-source in that repo.
- `stackblitz-labs/bolt.diy`: prompt, preview, provider, and export workflow
  organization. License review: MIT.
- `SujalXplores/v0.diy`: prompt-to-component generation, preview/code split,
  and BYOK setup flow. License review: MIT.
- `freestyle-sh/adorable`: conversational app builder and live-preview
  workflow. License review: MIT.
- `bixoryai/OpenLovable`: chat-first React app builder and sandbox/provider
  setup flow. License review: MIT.

No third-party code, components, icons, images, templates, colors, product copy,
or branding were reused. The implementation is original to Scroll3D, so no
third-party attribution is required for Phase 15 changes.

## Current Limits

- Generation still uses deterministic mock providers.
- No paid API calls are made.
- No local models are downloaded or executed.
- No real image/video/frame generation is implemented.
- The preview references mock frame paths and remains sandboxed for safety.
- The visual editor is still a compact control surface, not a drag/drop canvas.

## Next Direction

The next phase should connect the polished normal-user workflow to real provider
connection checks or a plugin/provider setup flow while preserving the same
simple prompt-to-preview path.
