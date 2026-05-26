# Phase 17: Provider And Self-Hosting Foundation

Phase 17 makes the Advanced workspace feel like a serious provider/plugin setup
area while keeping the normal user flow simple: prompt, preview, edit, and
export.

No real API calls, model downloads, model execution, deployment automation, or
media generation are enabled in this phase. Everything remains mocked/offline.

## Provider Setup UX

Advanced tools now include a focused provider setup surface with:

- friendly provider cards
- mock, API, and local labels
- capability summaries
- setup guidance states
- current stage decision cards
- SecretRef safety guidance

The default user workflow does not show provider tables or runtime details.
Those tools stay inside Advanced so first-time users can focus on generating and
exporting a website.

## Provider/Plugin Manifest Foundation

`@scroll3d/providers` now includes a provider plugin manifest schema. A manifest
describes:

- provider id
- display name
- version
- description
- provider mode: `mock`, `local`, or `api`
- primary provider type
- capabilities
- runtime requirements
- setup instructions
- tags and metadata

Bundled manifests cover mock providers plus future OpenAI-compatible, generic
video API, Ollama, ComfyUI, and FFmpeg integrations. These are metadata and setup
contracts only; they do not call external services or run local models.

## SecretRef Setup

API setup remains SecretRef-oriented. Users should reference secret ids such as:

- `openai.main`
- `replicate.primary`

Raw keys must stay outside project files, browser settings, exports, generated
websites, logs, and provider manifests.

## Runtime Visibility

Advanced Runtime now shows:

- local runtime status
- offline handshake state
- model readiness count
- one-heavy-model-at-a-time guarantee
- future local generation lifecycle

The current browser app does not contact a local runtime server. Runtime checks
remain placeholders and no models are downloaded or executed.

## Self-Hosting Guidance

Advanced Self-hosting explains the static export flow and deployment targets:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- self-hosted nginx

The app does not deploy automatically. It explains that Scroll3D exports a
self-hostable static site containing HTML, CSS, JavaScript, project JSON, and a
frame manifest.

## Design References

Phase 17 uses broad UX inspiration from extension/plugin ecosystems such as VS
Code extensions, Blender add-ons, Obsidian plugins, Raycast extensions, and the
ComfyUI ecosystem.

No third-party code, assets, branding, icons, templates, or product copy were
reused.

## Limitations

- Provider manifests are metadata only.
- API connection checks remain disabled/offline.
- Local runtime connection is simulated in the web UI.
- Model downloads are not implemented.
- Deployment guidance is manual; no platform automation exists yet.
