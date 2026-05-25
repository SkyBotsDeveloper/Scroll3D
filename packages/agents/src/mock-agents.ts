import type { Scroll3DProject } from "@scroll3d/core";
import {
  findProviderByType,
  type ProviderArtifact,
  type ProviderContext
} from "@scroll3d/providers";
import {
  FrameExtractionInputSchema,
  ImageGenerationInputSchema,
  PromptUnderstandingInputSchema,
  VideoGenerationInputSchema,
  WebsiteCompilationInputSchema,
  WebsitePlanSchema
} from "./contracts";
import type {
  FrameAgentOutput,
  ImageAgentOutput,
  VideoAgentOutput,
  WebsiteCompilationOutput
} from "./contracts";
import {
  cancelledAgentResult,
  completedAgentResult,
  failedAgentResult
} from "./results";
import type { Agent, AgentContext, AgentRunResult } from "./types";

export class PromptUnderstandingAgent implements Agent {
  readonly id = "prompt-understanding";
  readonly name = "Prompt Understanding Agent";
  readonly type = "prompt" as const;
  readonly description = "Turns a raw user prompt into a structured website plan.";
  readonly requiredProviderType = "llm" as const;

  async run(input: unknown, context: AgentContext): Promise<AgentRunResult> {
    if (context.signal?.aborted) {
      return cancelledAgentResult();
    }

    const parsedInput = PromptUnderstandingInputSchema.safeParse(input);

    if (!parsedInput.success) {
      return failedAgentResult("Prompt Understanding Agent received invalid input.");
    }

    const provider = findProviderByType(context.providers, this.requiredProviderType);

    if (!provider) {
      return failedAgentResult("No LLM provider is available.");
    }

    const result = await provider.generateStructuredOutput(
      { prompt: parsedInput.data.prompt },
      WebsitePlanSchema,
      createProviderContext(context, this.id)
    );

    if (result.status !== "completed" || result.output === null) {
      return failedAgentResult(result.warnings[0] ?? "LLM provider failed.");
    }

    return completedAgentResult(result.output, {
      nextSuggestions: ["Generate a visual direction from the approved plan."],
      warnings: result.warnings
    });
  }
}

export class ImageGenerationAgent implements Agent {
  readonly id = "image-generation";
  readonly name = "Image Generation Agent";
  readonly type = "image" as const;
  readonly description = "Creates an original still image direction.";
  readonly requiredProviderType = "image" as const;

  async run(input: unknown, context: AgentContext): Promise<AgentRunResult> {
    if (context.signal?.aborted) {
      return cancelledAgentResult();
    }

    const parsedInput = ImageGenerationInputSchema.safeParse(input);

    if (!parsedInput.success) {
      return failedAgentResult("Image Generation Agent received invalid input.");
    }

    const provider = findProviderByType(context.providers, this.requiredProviderType);

    if (!provider) {
      return failedAgentResult("No image provider is available.");
    }

    const result = await provider.generateImage(
      { prompt: parsedInput.data.visualPrompt, aspectRatio: "16:9", seed: 1 },
      createProviderContext(context, this.id)
    );

    if (result.status !== "completed" || result.output === null) {
      return failedAgentResult(result.warnings[0] ?? "Image provider failed.");
    }

    const output: ImageAgentOutput = {
      image: result.output.image,
      visualPrompt: parsedInput.data.visualPrompt
    };

    return completedAgentResult(output, {
      artifacts: {
        generatedImage: result.output.image
      },
      nextSuggestions: ["Use the generated image as the video seed."],
      warnings: result.warnings
    });
  }
}

export class VideoGenerationAgent implements Agent {
  readonly id = "video-generation";
  readonly name = "Video Generation Agent";
  readonly type = "video" as const;
  readonly description = "Creates an original source video for frame extraction.";
  readonly requiredProviderType = "video" as const;

  async run(input: unknown, context: AgentContext): Promise<AgentRunResult> {
    if (context.signal?.aborted) {
      return cancelledAgentResult();
    }

    const parsedInput = VideoGenerationInputSchema.safeParse(input);

    if (!parsedInput.success) {
      return failedAgentResult("Video Generation Agent received invalid input.");
    }

    const provider = findProviderByType(context.providers, this.requiredProviderType);

    if (!provider) {
      return failedAgentResult("No video provider is available.");
    }

    const result = await provider.generateVideo(
      {
        prompt: parsedInput.data.motionPrompt,
        sourceImage: parsedInput.data.image,
        durationSeconds: 8
      },
      createProviderContext(context, this.id)
    );

    if (result.status !== "completed" || result.output === null) {
      return failedAgentResult(result.warnings[0] ?? "Video provider failed.");
    }

    const output: VideoAgentOutput = {
      video: result.output.video,
      motionPrompt: parsedInput.data.motionPrompt
    };

    return completedAgentResult(output, {
      artifacts: {
        generatedVideo: result.output.video
      },
      nextSuggestions: ["Extract responsive frame sequences from the video."],
      warnings: result.warnings
    });
  }
}

export class FrameExtractionAgent implements Agent {
  readonly id = "frame-extraction";
  readonly name = "Frame Extraction Agent";
  readonly type = "frame" as const;
  readonly description = "Extracts responsive frame manifests from source motion.";
  readonly requiredProviderType = "frame" as const;

  async run(input: unknown, context: AgentContext): Promise<AgentRunResult> {
    if (context.signal?.aborted) {
      return cancelledAgentResult();
    }

    const parsedInput = FrameExtractionInputSchema.safeParse(input);

    if (!parsedInput.success) {
      return failedAgentResult("Frame Extraction Agent received invalid input.");
    }

    const provider = findProviderByType(context.providers, this.requiredProviderType);

    if (!provider) {
      return failedAgentResult("No frame provider is available.");
    }

    const result = await provider.extractFrames(
      { video: parsedInput.data.video },
      createProviderContext(context, this.id)
    );

    if (result.status !== "completed" || result.output === null) {
      return failedAgentResult(result.warnings[0] ?? "Frame provider failed.");
    }

    const output: FrameAgentOutput = {
      manifest: result.output.manifest,
      frameSets: result.output.frameSets
    };

    return completedAgentResult(output, {
      artifacts: {
        frameManifest: result.output.manifest
      },
      nextSuggestions: ["Compile the website plan with frame manifests."],
      warnings: result.warnings
    });
  }
}

export class WebsiteCompilationAgent implements Agent {
  readonly id = "website-compilation";
  readonly name = "Website Coding/Compilation Agent";
  readonly type = "code" as const;
  readonly description = "Compiles the plan and artifacts into a site build plan.";
  readonly requiredProviderType = "code" as const;

  async run(input: unknown, context: AgentContext): Promise<AgentRunResult> {
    if (context.signal?.aborted) {
      return cancelledAgentResult();
    }

    const parsedInput = WebsiteCompilationInputSchema.safeParse(input);

    if (!parsedInput.success) {
      return failedAgentResult("Website Compilation Agent received invalid input.");
    }

    const provider = findProviderByType(context.providers, this.requiredProviderType);

    if (!provider) {
      return failedAgentResult("No code provider is available.");
    }

    const generatedVideo = context.artifacts.generatedVideo;
    const updatedProject = applyFrameManifestToProject(
      context.project,
      parsedInput.data.frameManifest.frameSets,
      generatedVideo
    );

    const result = await provider.generateCode(
      {
        prompt: `Compile ${parsedInput.data.plan.title}`,
        project: updatedProject,
        artifacts: Object.values(context.artifacts)
      },
      createProviderContext(context, this.id)
    );

    if (result.status !== "completed" || result.output === null) {
      return failedAgentResult(result.warnings[0] ?? "Code provider failed.");
    }

    const output: WebsiteCompilationOutput = {
      project: updatedProject,
      compilationPlan: result.output.plan,
      codeArtifactId: result.output.code.id
    };

    return completedAgentResult(output, {
      artifacts: {
        siteCompilationPlan: result.output.code
      },
      nextSuggestions: ["Review the generated build plan before export."],
      warnings: result.warnings
    });
  }
}

export function createDefaultAgents(): Agent[] {
  return [
    new PromptUnderstandingAgent(),
    new ImageGenerationAgent(),
    new VideoGenerationAgent(),
    new FrameExtractionAgent(),
    new WebsiteCompilationAgent()
  ];
}

function applyFrameManifestToProject(
  project: Scroll3DProject,
  frameSets: FrameAgentOutput["frameSets"],
  generatedVideo: ProviderArtifact | undefined
): Scroll3DProject {
  return {
    ...project,
    scene: {
      ...project.scene,
      sourceVideo: generatedVideo?.path ?? project.scene.sourceVideo,
      frameSets
    },
    updatedAt: new Date().toISOString()
  };
}

function createProviderContext(context: AgentContext, jobId: string): ProviderContext {
  return {
    projectId: context.project.id,
    jobId,
    ...(context.signal ? { abortSignal: context.signal } : {}),
    ...(context.logger ? { logger: context.logger } : {})
  };
}
