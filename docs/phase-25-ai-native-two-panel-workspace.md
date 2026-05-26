# Phase 25: AI-Native Two-Panel Workspace

Phase 25 is a UX simplification phase. It removes the remaining dashboard-style
workspace structure and reshapes Scroll3D into a normal AI creative workflow:

- left: AI chat and prompting
- right: Preview or Code

All generation remains mocked/offline. No provider execution, model downloads,
backend services, media generation, deployment automation, or paid API calls are
enabled.

## Why This Changed

The previous workspace was technically stronger after Phase 24, but it still had
too many permanent regions:

- sidebar rail and expanded sidebar
- scene timeline stack
- center stage
- permanent right inspector
- bottom status region
- many visible metadata surfaces

That made the app feel closer to an admin/control dashboard than a natural AI
workspace.

## Removed Default Regions

The normal workspace no longer permanently shows:

- left sidebar navigation
- right inspector
- bottom status bar
- provider/runtime/model diagnostics
- generated file list
- JSON editor
- local setup commands
- scene metadata panels

Those systems still exist. They now open through contextual floating tools or
the Advanced center.

## New Chat-First Architecture

The left panel is now the primary creative interface:

- assistant/user message bubbles
- current prompt as a user message
- cinematic mock generation progress as assistant messages
- draft-ready response with Edit/Export actions
- scene request chips for focused editing
- refinement suggestion chips
- sticky composer for follow-up prompts

The chat panel is intentionally conversational and avoids raw provider/runtime
language in the normal user path.

## Preview/Code Output Surface

The right panel owns the product output:

- Preview shows the cinematic website draft.
- Code shows generated files when the user asks for them.
- Preview/Code switcher stays close to the output surface.
- Edit and Export buttons open contextual tools instead of permanent panels.

This keeps the preview/code area spacious and easier to understand.

## Floating Controls Strategy

Advanced or dense controls are now contextual:

- Scene editing opens in a floating drawer.
- Theme/text editing opens in the same contextual drawer.
- Export details open only when requested.
- Providers, local models, runtime, deployment guidance, JSON, files, and
  diagnostics remain inside the Advanced center.

Normal users see conversation plus output. Power users can still reach every
existing tool.

## References Studied

The following systems were studied for broad UX ergonomics:

- ChatGPT canvas-style conversation plus artifact output
- v0 prompt plus preview workflow
- Cursor side chat ergonomics
- Replit AI/workspace output balance
- Lovable prompt-to-preview flow
- Bolt.diy chat/workbench split
- LibreChat message flow and sticky composer
- Open Lovable generation/conversation flow

No third-party source code, branding, logos, assets, product copy, colors,
templates, or proprietary layouts were copied into Scroll3D for this phase.

## Current Limitations

- The conversation is still deterministic and mock-only.
- Follow-up prompts rerun the mock pipeline; they do not perform real semantic
  edits yet.
- The contextual editing drawer reuses existing visual editor foundations.
- Real provider calls, local model execution, media generation, frame extraction,
  and deployment automation remain future phases.

## Credits

Scroll3D project credit remains only:

- Creator: Siddhartha Abhimanyu
- Telegram: @iflexelite
- Instagram: elite.sid
