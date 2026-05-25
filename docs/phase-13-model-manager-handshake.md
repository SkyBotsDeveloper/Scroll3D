# Phase 13: Model Manager Planning And Runtime Handshake

Creator: Siddhartha Abhimanyu

Contact:

- Telegram: @iflexelite
- Instagram: elite.sid

Phase 13 adds explicit local model planning and offline runtime handshake
contracts. It keeps the core architecture rule intact: downloading models is
separate from running models.

## What This Phase Adds

- Model download plan contracts in `@scroll3d/local-runtime`.
- Per-model stage, runtime, provider type, size, requirements, source,
  install-instruction, risk, status, and warning metadata.
- Download plan summaries for total estimated size, disk after install,
  unsupported entries, risky entries, and stage coverage.
- Runtime handshake contracts for future local runtime URL, version, health,
  capabilities, stage support, model registry summary, and compatibility.
- CLI helpers:
  - `pnpm runtime:plan-downloads`
  - `pnpm runtime:handshake`
- Settings UI model-manager summaries and offline handshake display.

## No Automatic Downloads

No command in this phase downloads model files. `pnpm setup:local` and
`pnpm runtime:plan-downloads` only write or print safe planning JSON. Future
download support must require explicit user confirmation and should review
license, disk, RAM, and VRAM requirements before starting.

Generated machine-local files:

- `.scroll3d/local-runtime.config.json`
- `.scroll3d/model-download-plan.json`

The `.scroll3d/` directory is ignored and must not be committed.

## Download Plan Model

A `ModelDownloadPlan` contains entries for the selected pack. Each entry
includes:

- model ID, stage, provider type, and runtime
- estimated size and disk-after-install estimate
- requirements for RAM, VRAM, disk, runtime, and license review
- source metadata using placeholders rather than direct huge model URLs
- action such as `future-download`, `external-tool`, or `manual-install`
- status such as `waiting-confirmation` or `not-supported-yet`
- risk flags such as `large-download`, `high-vram`, `license-review`,
  `experimental`, `unsupported-platform`, and `disk-space-warning`

The plan is deterministic and secret-free.

## Runtime Handshake

The runtime handshake is an offline contract in this phase. It models the data
Settings and future runtime clients need:

- runtime URL
- protocol/runtime version
- health
- capabilities
- stage support
- model registry summary
- `maxConcurrentHeavyJobs: 1`
- `oneModelAtATime: true`

`pnpm runtime:handshake` prints an offline placeholder response. It does not
start a server, contact a server, download models, or execute inference.

## One-Model-At-A-Time Lifecycle

Future local execution should follow this order:

1. Load the required model for the active pipeline stage.
2. Run that stage.
3. Unload the model.
4. Move to the next queued stage.

This keeps heavy local jobs sequential and avoids oversubscribing consumer
machines.

## Settings Integration

The web Settings tab now shows:

- selected model pack
- download plan summary
- total estimated download and disk size
- required models per stage
- status and risk badges
- disabled download button
- command hints for setup, planning, and handshake
- offline local runtime handshake status

The Prompt tab continues to run deterministic mock providers. In local or
hybrid mode, it explains that real execution requires installed and ready models
in a later phase.

## Current Limits

- No real model downloads.
- No real local model execution.
- No real local runtime server.
- No paid API calls.
- No real image/video generation.
- No real frame extraction.
- No heavy assets or generated frame sequences are committed.

## Next Step

The next phase should add a disabled-by-default local runtime server handshake
endpoint or model-manager service boundary, still without downloading or running
models unless the user explicitly opts into future commands.
