# Phase 20: Cinematic Scene Editor

Phase 20 turns the mocked cinematic workspace into a scene-directed editing
environment. Generation remains offline and deterministic; this phase adds
story sequencing, motion vocabulary, scene metadata, and timeline interaction
foundations.

No real provider calls, model inference, model downloads, backend services,
deployment automation, media generation, or frame extraction were added.

## Scene Metadata Model

Scene metadata is stored per section under `section.settings.scene`. This keeps
the current `Scroll3DProject` schema valid while preparing future scene-specific
generation and rendering systems.

Each scene can track:

- title
- scene type
- motion preset
- transition style
- narrative role
- intensity
- pacing
- timing beats
- asset placeholder
- director note

The helper layer in `apps/web/src/lib/scene-metadata.ts` reads legacy sections
without metadata and derives safe defaults, so older projects still open.

## Motion Vocabulary

Phase 20 introduces reusable cinematic motion presets:

- Slow Reveal
- Cinematic Zoom
- Layered Motion
- Snap Transition
- Horizontal Sweep
- Depth Push
- Fade Through
- Parallax Drift

These are metadata presets only. They do not run a motion engine yet, but they
give the UI and future providers a shared language.

## Narrative Roles

The scene editor adds storytelling roles:

- Opening Hook
- Momentum Build
- Feature Reveal
- Immersive Transition
- Final CTA Impact

Each role includes guidance text so normal users can direct scenes without
editing raw JSON.

## Scene Sequencing

The right inspector now has a scene director panel. Users can:

- select a scene
- edit scene metadata
- reorder scenes with drag-and-drop
- reorder scenes with move buttons
- adjust motion, transition, intensity, pacing, timing, and notes

Scene order updates the underlying section order, so preview/export continue to
use the same validated project data.

## Scene Navigation

The workspace sidebar now reflects real project scenes instead of a fixed mock
timeline. Selecting a scene syncs the sidebar, inspector, and preview focus
state.

The preview browser frame shows the focused scene, narrative role, motion
preset, and transition label. It does not yet scroll the iframe to a section or
render a true motion timeline.

## Drag-And-Drop Scope

The scene sequencing interaction uses browser-native drag-and-drop plus button
fallbacks. No heavy drag/drop library was added. This keeps the implementation
light and local-first while preparing for richer timeline editing later.

## Open-Source Reference Policy

No third-party code, assets, branding, icons, templates, colors, or copy were
reused. The implementation builds on Scroll3D's existing workspace patterns and
the requested broad creative-tool direction.

## Limitations

- Scene metadata affects editor state and export order, not generated media yet.
- Motion presets are descriptive metadata only.
- Scene thumbnails are visual placeholders.
- Drag-and-drop is a foundation, not a full timeline editor.
- The preview focus strip does not drive frame-sequence playback yet.
- Scene-specific regeneration and provider routing remain future work.
