# @scroll3d/local-runtime

Sequential local runtime foundation for Scroll3D.

This package provides an in-memory `SequentialJobRunner` for future local model
jobs. It does not download models, start a server, or run real inference yet.

## Rules

- Only one heavy model job runs at a time.
- Jobs are queued sequentially.
- Pending and running jobs can be cancelled.
- Job status can be inspected.
- Model load/unload hooks are available for future runtime integration.

## Exports

- `LocalRuntimeConfig`
- `RuntimeJob`
- `RuntimeQueue`
- `RuntimeModelRef`
- `ModelLoadPolicy`
- `SequentialJobRunner`
