# AGENTS.md

Instructions for Codex and future AI coding agents working on Scroll3D:

- Use TypeScript strict mode.
- Keep packages modular and avoid coupling app UI to provider/runtime internals.
- Prefer schema-first design for project data and cross-package contracts.
- Use Zod for project schemas and runtime validation.
- Exported websites must work without a backend.
- The local runtime should run heavy model jobs sequentially.
- Support provider abstraction for local and API models.
- Write tests for core logic and schema behavior.
- Update docs when behavior changes.
- Do not copy proprietary branding, UI, copy, templates, assets, or distinctive
  behavior from other products.
- Keep code simple, typed, and maintainable.
