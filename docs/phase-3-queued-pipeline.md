# Phase 3 Queued Pipeline

Creator: Siddhartha Abhimanyu

Contact:

- Telegram: @iflexelite
- Instagram: elite.sid

## Pipeline State Model

`@scroll3d/agents` now defines:

- `PipelineRun`
- `PipelineStep`
- `PipelineStatus`
- `PipelineArtifact`
- `PipelineCheckpoint`
- `PipelineEvent`
- `PipelineRunStore`
- `InMemoryPipelineRunStore`

Pipeline runs track prompt input, step status, artifacts, events, checkpoints,
failures, cancellations, and retry counts. Serialized pipeline output is
secret-safe.

## Queued Runtime Execution

`QueuedAgentPipelineRunner` connects:

- Agent contracts
- Provider registry
- Sequential local runtime queue
- Pipeline run store

Each agent step becomes a runtime job. The runtime queue executes one job at a
time, and heavy jobs never run in parallel.

## Resumability

Failed runs preserve completed step output and artifacts. After provider
recovery, the queued runner can retry from the failed step and continue the
remaining pipeline.

## Future Provider Plan

Phase 3 remains mock-only. Later phases can add real local and API providers by
implementing the existing provider interfaces, resolving `secretRef` IDs at
runtime, and keeping generated websites free of secrets and backend
dependencies.
