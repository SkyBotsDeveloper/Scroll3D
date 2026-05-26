# Phase 24: Professional Workspace Layout System

Phase 24 focuses on workspace ergonomics instead of adding product features.
The goal is to make Scroll3D feel closer to a professional AI workbench: fluid,
resizable, balanced, and predictable across desktop, laptop, tablet, and wide
screen layouts.

## References Studied

The following systems were reviewed for broad layout and resizing lessons:

- Bolt.diy: `react-resizable-panels` based workbench composition, split editor
  regions, and preview/code ergonomics.
- LibreChat: persisted sidebar widths, collapsed/expanded constraints, and
  narrow rail behavior.
- VS Code: split view and grid view source code for min/max constraints,
  proportional resizing, resize handles, and editor/side bar balance.
- Replit, v0, and Cursor: public product behavior was used as high-level
  reference for preview dominance, command chrome restraint, and predictable
  workbench proportions.

No branding, logos, product copy, assets, templates, colors, or proprietary
layouts were copied.

## Resizing Architecture

`@scroll3d/web` now uses the MIT-licensed `react-resizable-panels` package for
the generated workspace:

- Left panel: prompt, scene navigation, generation status, and project actions.
- Center panel: dominant Preview/Code stage.
- Right panel: contextual edit/export inspector.
- Separators: accessible resize handles between the three panels.

The panel group stores user-adjusted proportions in browser storage through a
safe storage adapter. This keeps layout preference local to the browser and
avoids project/schema coupling.

## Panel Constraints

The workspace uses explicit constraints rather than ad hoc CSS widths:

- Sidebar default: `18%`
- Sidebar min/max: `13%` to `28%`
- Preview stage default: `60%`
- Preview stage min: `44%`
- Inspector default: `22%`
- Inspector min/max: `16%` to `30%`
- Focus mode collapses secondary panels so the preview can expand.

These ratios are tuned so the preview remains the product center while the
prompt/sidebar and inspector stay readable.

## Spacing System

Phase 24 introduces a more predictable workspace rhythm:

- Shared workspace gap variables.
- Consistent panel padding.
- Height-safe `min-height: 0` containers for nested scroll regions.
- Overflow-safe sidebar, preview, code, and inspector regions.
- Larger preview viewport sizing derived from available shell height.

The implementation reduces fixed pixel layout decisions and lets the split
system control proportions.

## Responsive Behavior

Desktop and laptop widths use the resizable workbench. Smaller widths fall back
to stacked panels so users are not forced into cramped sidebars.

Responsive rules prioritize:

- preview readability,
- no horizontal overflow,
- usable prompt/navigation controls,
- inspector content that remains scrollable,
- export actions that remain reachable.

## License Notes

`react-resizable-panels` is MIT licensed and used as a package dependency. No
third-party source files were copied into Scroll3D. No third-party project is
credited as a Scroll3D creator or maintainer.

Scroll3D project credit remains only:

- Creator: Siddhartha Abhimanyu
- Telegram: @iflexelite
- Instagram: elite.sid

## Current Limitations

- Visual generation remains mocked/offline.
- The resizable layout is browser-local and not part of exported project data.
- Advanced workspace tools are still feature-complete foundations, not real
  provider/model execution surfaces.
- Real AI providers, model downloads, local inference, and frame extraction
  remain future phases.
