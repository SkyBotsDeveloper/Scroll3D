# @scroll3d/agents

Agent contracts and sequential orchestration foundation for Scroll3D.

## Pipeline

1. Prompt Understanding Agent
2. Image Generation Agent
3. Video Generation Agent
4. Frame Extraction Agent
5. Website Coding/Compilation Agent

## Exports

- `Agent`
- `AgentContext`
- `AgentRunResult`
- `AgentOrchestrator`
- `QueuedAgentPipelineRunner`
- `PipelineRun`
- `PipelineStep`
- `PipelineRunStore`
- `InMemoryPipelineRunStore`
- `PromptUnderstandingAgent`
- `ImageGenerationAgent`
- `VideoGenerationAgent`
- `FrameExtractionAgent`
- `WebsiteCompilationAgent`
- `createDefaultAgents`

The orchestrator runs agents in order, selects a matching provider type, records
job status, stops on failure, and does not run heavy jobs in parallel.

## Queued Pipeline Runner

`QueuedAgentPipelineRunner` connects agents to:

- `ProviderRegistry`
- `SequentialJobRunner`
- `PipelineRunStore`

The queued runner creates inspectable pipeline state, records artifacts and
events, runs agent steps through the sequential runtime queue, stops on
failed/cancelled steps, and can retry from a failed step after provider recovery.
