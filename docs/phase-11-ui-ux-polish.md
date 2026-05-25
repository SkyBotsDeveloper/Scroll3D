# Phase 11 Web App UI/UX Polish

Phase 11 redesigns the Scroll3D web app from a raw developer tool into a more
polished, prompt-first dashboard for an AI 3D website builder.

## Dashboard Structure

The app now opens with:

- a compact Scroll3D header
- Developer Preview and mode badges
- current project metrics
- a prompt-first Generate tab
- persistent static preview and generated file inspection

The tab structure is:

- Generate
- Visual Editor
- Preview & Export
- JSON
- Settings

This keeps the primary workflow visible: prompt, mock pipeline, visual editing,
static preview, and ZIP export.

## Generate-First Workflow

The Generate tab includes:

- a large prompt textarea
- example prompt chips
- current mode and provider summary
- primary `Generate mock website` action
- five pipeline progress cards
- apply generated project CTA

The developer preview still uses deterministic mock providers only. No paid API
calls, model downloads, local model execution, image generation, video
generation, or frame extraction happen in this phase.

## Visual Editor Polish

The Visual Editor tab groups project basics, theme, sections, and scroll scene
settings into clearer panels. Section cards now show type, order, and visibility
badges so the project structure is easier to scan.

Visual edits still update:

- project state
- synced JSON text
- validation state
- static preview
- generated file list
- ZIP export source

## Preview And Export

Preview & Export is clearer about what the static bundle contains:

- `index.html`
- `styles.css`
- `scroll-engine.js`
- `project.json`
- `frame-manifest.json`
- export notes and asset references

The preview iframe remains sandboxed. The ZIP download remains browser-local and
does not require a backend.

## Settings Modes

Settings explains:

- API Mode: use provider keys later
- Local Mode: run models on the user's machine later
- Hybrid Mode: mix local and API per pipeline stage later
- Mock fallback: safe developer preview behavior now

Raw API keys are still not stored. API provider settings use `secretRef`
placeholders only.

## Local Setup Guidance

The Local Runtime section shows the intended future flow:

1. Stop the web server.
2. Run `pnpm setup:local`.
3. Restart with `pnpm dev`.
4. Connect the local runtime.
5. Prompt execution runs one required model at a time.

The setup planning scripts remain lightweight and do not download models.

## Current Limitations

- No real provider API calls.
- No real local runtime connection.
- No local model downloads.
- No local model execution.
- No real image/video generation.
- No real frame extraction.
- No heavy assets or generated frames are stored in the repository.

## Next Phase

The next phase should start real provider connection plumbing and local runtime
discovery while keeping all real network/model work disabled by default.
