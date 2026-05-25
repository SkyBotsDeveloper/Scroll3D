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

## Exports

- `LocalRuntimeConfig`
- `RuntimeJob`
- `RuntimeQueue`
- `RuntimeModelRef`
- `ModelLoadPolicy`
- `RuntimeJobEvent`
- `SequentialJobRunner`
