# Phase 9 Visual Editor Controls

Phase 9 adds the first structured visual editing layer to the Scroll3D web app.
It builds on the Phase 8 developer preview by letting users modify the sample
project without editing raw JSON first.

## Visual Editor Workflow

The web app now has three editor tabs:

- `Visual`: structured controls for project basics, theme, sections, and scroll
  scene settings.
- `JSON`: the raw project JSON editor from Phase 8.
- `Export`: validation/export status, ZIP download, and local export history.

Visual edits update the in-memory project, regenerate the formatted JSON text,
refresh validation, and re-run static export preview generation.

## JSON Sync Behavior

Visual edits are the source of truth while using the Visual tab. Each valid UI
change rewrites the JSON editor text with the latest project object.

Raw JSON edits still work:

1. Edit JSON in the JSON tab.
2. Validate the text.
3. Apply valid JSON.
4. The visual editor updates from the newly applied project.

If JSON is invalid, the visual editor keeps the last valid project and displays
validation errors.

## Section Editing

The section editor supports:

- section name editing
- common primitive content fields
- CTA-like key highlighting for fields containing action, button, CTA, label,
  URL, or href
- simple JSON textarea editing for object/array content values
- up/down section reordering
- visibility toggles

The core schema does not include a section `enabled` field yet, so visibility is
stored as a UI-level `settings.visible === false` flag. The web export helper
filters hidden sections before creating the preview bundle and ZIP.

## Theme Editing

Theme controls cover:

- core color keys such as background, foreground, primary, secondary, accent,
  muted, and panel
- body and heading font-family strings
- small, medium, and large radius values
- common spacing values
- the existing `depthFog` effect toggle

The app does not import external fonts. Exported CSS still comes from the
project theme and exporter sanitization rules.

## Scroll Scene Editing

The scroll scene editor supports:

- scene name
- playback mode: `scroll`, `scrub`, or `hybrid`
- scroll length
- frame set inspection
- reduced-motion fallback alt text editing when the fallback is an image/video

No real frames are required or added in this phase.

## Preview And Export Regeneration

Every visual edit updates the current project and refreshes:

- schema validation state
- static export bundle
- sandboxed preview document
- generated file list
- browser ZIP download source

Hidden sections are excluded from generated preview/export output.

## Current Limitations

- No drag/drop section ordering.
- No full no-code canvas editor.
- No real AI generation UI.
- No real frame extraction.
- No binary asset/frame copying in the web app.
- Complex nested content is edited as JSON text rather than as custom controls.

## Next Planned Integration

The next phase should add the first AI prompt workflow: prompt input, queued mock
pipeline execution from the browser/server boundary, provider selection display,
and project updates from generated pipeline results.
