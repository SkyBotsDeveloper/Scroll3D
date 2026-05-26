# Phase 23: OSS-Inspired Workspace Refinement

Phase 23 refines Scroll3D's web app ergonomics without adding new generation,
provider, runtime, or deployment features. The goal is a calmer AI-native
workspace where the prompt, preview, edit inspector, and export path are obvious
without exposing advanced implementation details.

## Reference Review

The following open-source projects were cloned outside the Scroll3D repository
under `D:\Scroll3D-reference-repos` and reviewed for broad workspace patterns.
No source code, branding, logos, assets, templates, colors, or product copy were
copied into Scroll3D.

| Reference    | License / reuse decision                                                          | Local run result                                                                                                                              | UX patterns studied                                                                                                          |
| ------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Bolt.diy     | MIT. Used for broad layout inspiration only.                                      | Ran locally with `corepack pnpm dev`; served at `http://localhost:5174`.                                                                      | Workbench proportions, Preview/Code switching, preview toolbar density, animated workbench opening, device preview controls. |
| Open Lovable | MIT. Used for broad layout inspiration only.                                      | Ran locally with `npm run dev -- --port 3102`; served at `http://localhost:3102`.                                                             | Prompt-to-preview flow, sparse preview controls, collapsible console/detail patterns.                                        |
| LibreChat    | MIT license file reviewed. Used for broad layout inspiration only.                | Installed dependencies and ran `npm run frontend:dev`; served at `http://localhost:3090`.                                                     | Compact rail plus expandable panel, mobile overlay behavior, transition timing, resize ergonomics.                           |
| Open WebUI   | Custom Open WebUI License reviewed. No code reused.                               | Local install was blocked by the repo engine range requiring Node `<=22`; this machine uses Node `24.14.0`.                                   | Dense settings/sidebar surfaces as a cautionary reference for what Scroll3D should keep hidden in Advanced.                  |
| Flowise      | Apache 2.0 for standard code with commercial-license areas noted. No code reused. | Local install was blocked by repo engine requirements for Node `^20` and pnpm `^10.26.0`; this machine uses Node `24.14.0` and pnpm `11.3.0`. | Persistent drawer layout and responsive shell behavior, mainly as a caution against admin-heavy chrome.                      |

## Workspace Changes

- The workspace sidebar now uses an always-present compact rail with a lightweight
  expandable content area.
- Collapsed desktop sidebar state supports hover/focus expansion so navigation is
  available without permanently shrinking the preview.
- The top bar is quieter: fewer words, lighter status treatment, and a more
  command-like Advanced entry.
- Preview receives more horizontal and vertical space through narrower side
  surfaces, smaller gaps, and a more immersive stage height.
- Device controls, scene context, and export actions remain visually secondary
  floating elements around the preview instead of heavy dashboard blocks.
- The right inspector is lighter and more contextual, with less visible chrome
  around scene/edit/export controls.

## Interaction Decisions

- The preview remains the product center. Sidebar and inspector surfaces should
  support the preview, not compete with it.
- Normal-mode language stays simple: prompt, preview, edit, export, draft, and
  ZIP. Technical provider/runtime/model terms remain in Advanced tools.
- Advanced systems remain available but are organized as optional tooling rather
  than first-screen navigation.
- No real provider calls, model downloads, model execution, backend services, or
  deployment automation were added.

## Responsive Behavior

- Desktop uses a compact rail plus preview-dominant center stage.
- Collapsed desktop navigation expands as an overlay on hover or keyboard focus.
- Tablet and mobile layouts fall back to stacked panels so prompt, preview,
  inspector, and Advanced tools remain readable.
- Focus mode continues to compress side surfaces and hide lower-priority status
  chrome.

## Safety And Attribution

- No third-party code was copied.
- No third-party assets, logos, branding, templates, proprietary wording, or
  distinctive product identity were reused.
- No additional license notices are required for Phase 23 because the
  implementation is original Scroll3D code.
- Project credit remains only Siddhartha Abhimanyu with Telegram `@iflexelite`
  and Instagram `elite.sid`.
