# Phase 21: Premium Workspace Redesign

Phase 21 is a focused UX correction pass. It does not add provider execution,
model inference, downloads, backend services, or new generation features. The
goal is to make Scroll3D feel less like a dashboard and more like a cinematic AI
creative workspace.

## Reference Review

The following open-source projects were cloned and inspected for broad UX
patterns only:

- Bolt.diy: MIT license. It was installed and run locally to study workspace
  proportions, preview/code switching, floating workbench behavior, prompt-first
  flow, and visual density.
- Open Lovable: MIT license. It was inspected for preview-first app builder
  ergonomics and generation-to-preview flow.
- LibreChat: MIT license. It was inspected for collapsible sidebar structure
  and lighter navigation hierarchy.
- Open WebUI: custom/multiple license terms. It was inspected only as a
  reference for settings density and admin-surface tradeoffs.

No third-party code, components, assets, branding, templates, colors, logos, or
copy were reused. The resulting UI remains an original Scroll3D implementation.

## UX Decisions

The redesign focuses on visual restraint:

- The preview is now the dominant workspace surface.
- The shell width was expanded so the canvas has room to breathe on large
  displays.
- Heavy panels, nested cards, repetitive borders, and noisy status badges were
  reduced.
- The top bar now behaves more like lightweight workspace chrome.
- The left sidebar and right inspector are slimmer, softer, and less visually
  competitive with the preview.
- Settings moved further into a command-center style overlay with calmer
  hierarchy.
- Normal-mode copy avoids unnecessary technical terminology.

## Workspace Simplification

Before Phase 21, too many surfaces competed at the same visual weight. The
updated shell uses:

- transparent center stage instead of a boxed main container,
- larger preview frame with browser-like chrome,
- softer floating side panels,
- reduced pill and badge usage,
- quieter secondary text,
- wider desktop grid proportions,
- responsive stacking on smaller viewports.

The default experience continues to prioritize:

1. prompt,
2. generation,
3. preview,
4. scene/edit controls,
5. ZIP export.

Advanced provider, model, runtime, JSON, diagnostics, and generated file tools
remain available through the Control Center, but they no longer dominate the
creative workspace.

## Implementation Notes

- The work is CSS and component-copy focused.
- Existing mock generation, scene editing, preview, Code view, ZIP export,
  settings persistence, JSON tools, model manager, runtime diagnostics, and
  provider setup remain intact.
- The preview, sidebar, inspector, landing prompt, and global settings surfaces
  now share the same lighter visual system.
- No real network calls, media generation, provider execution, model downloads,
  or local inference were introduced.

## Remaining Limitations

- Generation is still deterministic and mocked.
- The Code view remains a read-only editor-shell foundation.
- Settings connection checks and local runtime handshakes remain safe/offline
  scaffolds.
- Fullscreen preview is a UI foundation, not a separate routed presentation
  mode.
- Scene motion presets are metadata only until future rendering and generation
  phases connect them to real media output.
