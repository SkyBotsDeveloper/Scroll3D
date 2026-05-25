# Phase 16: UI Quality Pass

Phase 16 is a focused product-quality pass on the Scroll3D web app. The goal is
to make the default experience feel closer to a modern AI builder workspace while
remaining original to Scroll3D.

## UI Audit

The Phase 15 app was functional, but the audit found several areas to tighten:

- The workflow stepper still competed with the prompt as the first action.
- The prompt box and Generate button felt separate instead of one primary
  composer.
- Preview was dominant, but export was not close enough to the result after a
  draft was ready.
- The right inspector exposed too many section fields at once.
- Some normal-mode copy still sounded technical.
- Advanced tools were correctly hidden, but normal mode still needed a clearer
  separation between simple controls and developer details.

## What Changed

- The workflow stepper is now a quieter progress row.
- The prompt composer groups the textarea, Generate website button, example
  prompts, website type chips, and developer preview note into a single focused
  panel.
- Generation progress uses friendly labels:
  1. Understanding your idea
  2. Designing the website concept
  3. Planning the cinematic motion
  4. Preparing scroll scenes
  5. Building your website draft
- Preview keeps the largest workspace surface and shows Download ZIP near the
  draft once generation has completed.
- The inspector now emphasizes Quick edit, Theme, Sections, and Scroll feel.
  Theme, sections, and scroll feel are collapsible so the default view is easier
  to scan.
- Generated files, JSON, provider settings, local model planning, runtime
  details, and diagnostics remain inside Advanced tools.

## Normal User Flow

The intended normal path is:

1. Type a prompt.
2. Click Generate website.
3. Review the website draft in the preview.
4. Make quick edits in the inspector.
5. Download the ZIP.

Normal mode avoids showing JSON, provider tables, model catalogs, runtime
handshakes, download plan JSON, generated file lists, raw pipeline output, and
setup command walls.

## Advanced Tools

Advanced remains organized into:

- JSON
- Generated Files
- Providers
- Local Models
- Runtime
- Diagnostics

These areas keep the technical controls available without making them part of
the first user experience.

## Open-Source Reference Review

The following projects were inspected for broad UX patterns and license context:

- `dyad-sh/dyad`: local-first app-builder onboarding, provider simplicity, and
  private/local positioning. License review: Apache 2.0 outside `src/pro`;
  `src/pro` is separately listed as fair-source in that repo.
- `stackblitz-labs/bolt.diy`: prompt, preview, workspace, and provider settings
  organization. License review: MIT, with a separate WebContainers production
  licensing note in the project README.
- `SujalXplores/v0.diy`: prompt-to-component generation, preview/code split,
  BYOK flow, and project dashboard shape. License review: MIT.
- `freestyle-sh/adorable`: conversational builder, live preview, and
  one-click-publish style flow. License review: MIT.
- `bixoryai/OpenLovable`: website-to-app generation flow, sandbox/provider
  setup, and preview-first positioning. License review: MIT.

No third-party code, components, icons, images, templates, product copy, colors,
or branding were copied. Phase 16 uses only broad UX inspiration, so no new
third-party attribution is required.

## Current Limits

- Generation still uses deterministic mock providers.
- No real API calls are made.
- No local models are downloaded or executed.
- No real image/video/frame generation is implemented.
- The preview remains sandboxed.
- The visual editor remains a compact control surface, not a full canvas editor.

## Next Direction

The next phase should connect this cleaner user flow to provider/plugin setup
and self-hosting guidance while keeping Advanced tools optional.
