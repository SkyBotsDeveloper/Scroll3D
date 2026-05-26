# Phase 19: Cinematic Generation Experience

Phase 19 makes the mocked generation flow feel more like an intelligent
cinematic production workspace while keeping all execution local and offline.

No real API calls, local inference, backend services, model downloads, deployment
automation, media generation, or frame extraction were added.

## Streaming Generation Feel

Generation now moves through an AI-director sequence:

1. Reading the creative brief
2. Blocking the website structure
3. Writing the scene copy
4. Directing cinematic motion
5. Polishing the export draft

The underlying pipeline is still deterministic and mocked, but the UI paces the
experience so users can see direction, progress, and creative intent.

## Progressive Preview

The preview no longer jumps straight to the final iframe during generation.
While the mock pipeline is being staged, the preview shows:

- initial canvas composition
- layout skeleton emergence
- content layer appearance
- scroll scene activation
- final cinematic pass

After the final pass, Scroll3D swaps in the generated static preview.

## Workspace Motion

The workspace adds subtle motion and depth:

- panel entrance motion
- smoother hover states
- focus-preview mode foundation
- animated progress track
- reduced-motion guardrails

Motion is decorative only and does not change generated project data.

## Preview Environment

The preview now includes:

- more cinematic browser chrome
- device controls for desktop, tablet, and mobile preview widths
- focus-preview mode foundation
- staged preview skeleton while generation is active

The preview remains sandboxed and browser-local.

## Scene Timeline Foundation

The left workspace sidebar now includes a mocked cinematic timeline:

- Opening reveal
- Feature orbit
- Decision frame
- Soft landing

Each scene has an order, transition hint, and motion hint. This prepares the
workspace for future scroll-scene editing and frame timeline controls.

## AI Director Tone

Normal-mode generation copy now uses creative-direction language instead of
system logs. Technical provider/runtime details remain hidden in Settings.

## Limitations

- Generation is still deterministic and offline.
- Staged progress is UI orchestration, not real streaming model output.
- Scene thumbnails and timeline details are mocked placeholders.
- Device preview controls affect the iframe frame, not a full responsive test
  harness.
- Focus-preview mode is a UI foundation, not browser Fullscreen API integration.
