# @scroll3d/local-runtime

Sequential local runtime foundation for Scroll3D.

This package provides an in-memory `SequentialJobRunner` for future local model
jobs. It does not download models, start a server, or run real inference yet.

## Rules

- Only one heavy model job runs at a time.
- Jobs are queued sequentially.
- Pending and running jobs can be cancelled.
- Job status can be inspected.
- The active job can be inspected.
- Optional job priority controls pending queue order.
- Job events record queued, started, completed, failed, and cancelled states.
- Model load/unload hooks are available for future runtime integration.
- Job lifecycle hooks are available for future runtime integration.
- Runtime config validation applies defaults for temp, storage, model cache, and
  mock fallback settings.
- `maxConcurrentHeavyJobs` remains fixed at `1` until explicit multi-model
  scheduling is supported later.

## Local Setup Planning Commands

Root scripts provide lightweight setup planning helpers:

```bash
corepack pnpm runtime:scan
corepack pnpm runtime:doctor
corepack pnpm runtime:models
corepack pnpm setup:local
```

These commands scan basic system information, print prerequisite notes, list
known model pack targets, and recommend a setup profile. They do not download
models, run inference, start external model servers, or require API keys.

`corepack pnpm setup:local` writes `.scroll3d/local-runtime.config.json` as a
machine-local setup plan. The `.scroll3d/` directory is ignored by git. The plan
contains runtime URL, selected pack, model registry entries, provider bindings,
and `maxConcurrentHeavyJobs: 1`; it contains no secrets.

## Model Catalog

The package includes a safe planning catalog for Lite, Balanced, Pro, and Custom
packs. Model entries track stage, provider type, runtime, estimated size,
requirements, status, and notes. All entries remain `not-installed` until a
future explicit download command exists.

## Exports

- `LocalRuntimeConfig`
- `LocalRuntimeConfigSchema`
- `parseLocalRuntimeConfig`
- `safeParseLocalRuntimeConfig`
- `createLocalRuntimeConfig`
- `RuntimeJob`
- `RuntimeQueue`
- `RuntimeModelRef`
- `ModelLoadPolicy`
- `RuntimeJobEvent`
- `Scroll3DLocalRuntimeConfig`
- `LocalRuntimeConfigPlan`
- `LocalModelEntry`
- `LocalModelStatus`
- `createDefaultLocalRuntimeConfig`
- `createLocalRuntimeConfigPlan`
- `loadLocalRuntimeConfig`
- `saveLocalRuntimeConfig`
- `listModelCatalog`
- `listModelPacks`
- `recommendModelPack`
- `SequentialJobRunner`
