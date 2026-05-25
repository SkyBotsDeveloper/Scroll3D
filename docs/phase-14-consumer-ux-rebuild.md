# Phase 14: Consumer UX Rebuild

Creator: Siddhartha Abhimanyu

Contact:

- Telegram: @iflexelite
- Instagram: elite.sid

Phase 14 rebuilds the Scroll3D web app for normal users. The goal is a simple
first impression: type a prompt, generate a cinematic website, edit it, preview
it, and download a ZIP.

## Normal Mode

Normal Mode is the default app experience. It contains:

- Generate
- Edit
- Preview
- Export

The first screen shows the Scroll3D name, the tagline “Generate cinematic 3D
websites from a prompt.”, a large prompt box, a primary Generate website button,
example prompts, a developer-preview mock-generation badge, and a large preview.

Normal Mode avoids raw JSON, provider tables, model catalogs, runtime handshake
details, local setup commands, file internals, and dense diagnostics.

## Guided Workflow

The main workflow is shown as five steps:

1. Prompt
2. Generate
3. Edit
4. Preview
5. Export

Generation still uses deterministic mock providers. The UI describes this as
“Generate website” instead of exposing the queued mock pipeline by default.
Pipeline artifacts and provider decisions remain available in Advanced tools.

## Edit Mode

Normal Edit mode focuses on common website controls:

- Project name
- Background, accent, and text colors
- Font and corner radius
- Section names and text fields
- Section order
- Section hide/show
- Scroll length
- Playback mode

Full visual controls and technical details remain available in Advanced.

## Preview And Export

Preview shows the generated website in a sandboxed iframe with simple status:

- valid project
- export ready
- mock scroll scene files referenced

Export shows a large Download ZIP button and a checklist for:

- `index.html`
- `styles.css`
- `scroll-engine.js`
- `project.json`
- `frame-manifest.json`

Generated files and detailed text previews are hidden in Advanced by default.

## Advanced Mode

Advanced tools are accessible from the Advanced drawer. They contain:

- Settings
- Provider preferences
- API provider config
- Local runtime
- Model manager
- JSON editor
- Generated file viewer
- Pipeline details
- Diagnostics
- Runtime command help

Advanced copy explains that these tools are for local models, provider
configuration, JSON editing, and debugging.

## Current Limitations

- Generation is deterministic mock output.
- Paid API calls are not enabled.
- Local model downloads are not enabled.
- Local model execution is not enabled.
- Real image/video generation and frame extraction are not implemented.
- Heavy generated assets and frame sequences are not stored in the repository.

## Why Advanced Features Are Hidden

Scroll3D needs powerful local/API/hybrid and self-hosting foundations, but those
details should not dominate the first user experience. Phase 14 keeps all
advanced functionality intact while moving it out of the default path.
