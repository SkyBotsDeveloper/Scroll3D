# Phase 2 Architecture

Creator: Siddhartha Abhimanyu

Contact:

- Telegram: @iflexelite
- Instagram: elite.sid

## Provider System

`@scroll3d/providers` defines local and API provider contracts for:

- LLM generation
- Image generation
- Video generation
- Frame extraction
- Website code generation

The package includes deterministic mock providers only. Real downloads, API
calls, model execution, and provider plugins are later-phase work.

## Agent Pipeline

`@scroll3d/agents` defines the agent interface and a sequential orchestrator.
The default pipeline is:

1. Prompt Understanding Agent
2. Image Generation Agent
3. Video Generation Agent
4. Frame Extraction Agent
5. Website Coding/Compilation Agent

The orchestrator selects a provider by required provider type, records job
status, passes artifacts between agents, stops on failure, and returns a pipeline
summary.

## Local Runtime Queue

`@scroll3d/local-runtime` provides an in-memory `SequentialJobRunner`.

The runner queues jobs, runs them one at a time, supports cancellation, exposes
status inspection, and includes future hooks for model load/unload behavior.

The key local-runtime rule is that only one heavy model job may run at a time.
