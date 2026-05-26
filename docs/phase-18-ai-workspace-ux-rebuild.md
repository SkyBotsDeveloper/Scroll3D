# Phase 18: AI Workspace UX Rebuild

Phase 18 shifts the web app from a dashboard-style builder toward an AI-native
workspace for cinematic website generation.

The main interaction model is now:

1. before generation, focus on the prompt
2. after generation, enter an immersive workspace
3. preview, inspect generated code, edit, export, or open global settings

No real API calls, model downloads, local inference, deployment automation,
backend services, authentication, media generation, or frame extraction were
added.

## Prompt-First Landing

The default first screen is intentionally minimal:

- Scroll3D brand and one-line product direction
- large cinematic prompt surface
- example prompt cards
- quick website type chips
- strong Generate website CTA
- small developer preview/mock generation status

The initial screen hides JSON, provider tables, model catalogs, runtime
diagnostics, generated files, and setup command walls.

## Post-Generation Workspace

After a mock generation completes, Scroll3D switches into a workspace with:

- top workspace bar
- centered Preview / Code switcher
- collapsible left workspace sidebar
- large main preview/code stage
- right inspector for quick edit/export controls
- global settings center for advanced tools

This preserves the normal user path while preparing the app for future
agentic-generation workflows.

## Collapsible Workspace Sidebar

The sidebar shows:

- current prompt
- regenerate and new project actions
- friendly generation progress
- scene/section navigation
- asset placeholder
- history placeholder
- workspace settings entry point

The sidebar can collapse on desktop and stacks naturally on smaller screens.

## Preview / Code Toggle

The top-center switcher controls the main stage:

- Preview shows the dominant browser-style website preview.
- Code shows a professional generated-file workspace with a file explorer, file
  tab row, and code preview panel.

The Code tab is a foundation for future Monaco/live editing. It does not execute
user scripts or add backend editing.

## Global Settings Center

Fragmented advanced settings are now represented as one global settings center.
It contains:

- Providers
- Local Models
- Runtime
- Self-hosting
- Appearance
- JSON
- Generated Files
- Diagnostics

Normal users do not see these tools until they open Settings.

## Provider UX Direction

Provider setup now points toward universal compatibility through:

- custom endpoint URL
- model name
- SecretRef
- capability selection
- provider/plugin manifests

The UI is prepared for future OpenAI-compatible APIs, OpenRouter, Ollama, LM
Studio, and custom local inference endpoints, while keeping execution disabled.

## Design References

Phase 18 uses broad product-quality inspiration from AI builder and workspace
tools such as v0, Replit, Cursor, Lovable, Bolt, Raycast, Blender workspace
systems, and VS Code panels.

No proprietary code, assets, layouts, copy, branding, or distinctive
interactions were copied.

## Current Limitations

- Mock generation remains deterministic and offline.
- Preview uses generated static export output from the current project.
- Code view is read-only.
- Settings center is a UI foundation, not real provider execution.
- Local runtime and model manager remain planning/visibility tools only.
