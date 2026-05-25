# Phase 4 Persistent Pipelines

Phase 4 adds file-backed pipeline run storage and checkpoint/resume helpers for
the queued agent pipeline.

## Pipeline State Model

`PipelineRun` records:

- run ID, project ID, prompt, status, timestamps
- five ordered agent steps
- step inputs, outputs, errors, artifacts, and retry counts
- pipeline events
- checkpoints after completed steps

`PipelineStep` status can be `idle`, `pending`, `running`, `completed`,
`failed`, or `cancelled`.

## File-Backed Run Store

`FilePipelineRunStore` saves each run as JSON in a configurable storage
directory. It supports:

- save
- load by run ID
- list runs
- update existing runs
- append events
- append artifacts
- append checkpoints
- delete runs

Writes use a temporary file followed by rename for an atomic-ish local write.
Corrupt JSON files report clear read errors.

Serialized output is secret-safe. Secret-looking keys and values are redacted
before run state is written to disk.

## Checkpoint And Resume

The runner creates a checkpoint after every completed step. Resume helpers can:

- find the next runnable step in a stored run
- retry a failed step with an incremented retry count
- preserve artifacts from completed steps
- avoid rerunning completed steps by default
- keep cancelled runs stopped unless resume is explicitly allowed

`QueuedAgentPipelineRunner` can resume against any `PipelineRunStore`, including
the file-backed store, and continues from the next valid step.

## Runtime Queue Integration

The queued runner connects:

- `ProviderSelectionPolicy`
- `ProviderRegistry`
- `SequentialJobRunner`
- `PipelineRunStore`

Each agent step is converted into a runtime job. The local runtime still enforces
one heavy job at a time, so local model work remains sequential.

## Future Provider Activation

The persistent run model is designed to support real providers later:

- Ollama for local LLM jobs
- OpenAI-compatible APIs for LLM, image, and code jobs
- ComfyUI for local image and video workflows
- FFmpeg for local frame extraction

Real provider activation should add explicit configuration, secret resolution,
timeouts, retries, and logs without changing the stored project schema or
exporting secrets.
