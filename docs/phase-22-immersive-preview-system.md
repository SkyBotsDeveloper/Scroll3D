# Phase 22: Immersive Preview System

Phase 22 is a focused UX refinement pass. It does not add backend services,
provider execution, model inference, model downloads, media generation, or
deployment automation. The goal is to make the generated website preview feel
like the primary creative stage instead of an iframe inside a dashboard.

## Reference Review

The following references were reviewed again before implementation:

- Bolt.diy: run locally and inspected for preview/code hierarchy, workbench
  proportions, compact shell behavior, fullscreen/device-preview affordances,
  and side-panel transitions.
- Open Lovable: inspected for preview-first generation layout and lightweight
  preview controls.
- LibreChat: inspected for collapsible sidebar behavior, icon-rail navigation,
  width transitions, and small-screen drawer behavior.
- Open WebUI: inspected for settings/sidebar density tradeoffs and used as a
  cautionary reference for keeping Scroll3D's normal path uncluttered.

No third-party code, components, assets, colors, branding, copy, templates, or
layouts were reused. The implementation remains original to Scroll3D.

## Preview-First Decisions

The preview is treated as the product surface:

- The desktop workspace grid now allocates more width to the preview.
- The normal sidebar and inspector are narrower and softer by default.
- Entering preview focus mode compresses the sidebar into a small rail and
  reduces the inspector to lightweight contextual tabs.
- The status bar is hidden in focus mode.
- The preview header, device controls, scene focus, and export footer become
  floating overlays around the live stage.
- The focus preview surface is closer to edge-to-edge with less visible chrome.

## Floating Workspace System

Phase 22 introduces a stronger floating control language:

- side controls use translucent surfaces and blur instead of heavy boxes;
- compact rail buttons provide prompt, generate, and Control Center access;
- inspector tabs remain available while the form-heavy editor body stays hidden
  during focus mode;
- preview device controls and scene context float over the stage;
- hover and focus states use small motion and subtle contrast rather than dense
  borders.

## Responsive Behavior

The immersive focus state is desktop-first. On smaller screens:

- focus mode keeps panels readable instead of forcing rail-only controls;
- floating preview overlays return to normal document flow;
- preview heights are capped to avoid unusable mobile layouts;
- the existing stacked workspace behavior remains intact.

## Current Limitations

- Focus mode is a UI shell state, not a true browser fullscreen API integration.
- The generated website still runs through the safe sandboxed preview pipeline.
- Scene controls and motion presets remain metadata only.
- No real provider execution, local model inference, media generation, or
  deployment automation is enabled.
