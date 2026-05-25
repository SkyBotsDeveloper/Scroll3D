import type { z } from "zod";
import type {
  CodeGenerationInput,
  CodeGenerationOutput,
  CodeProvider,
  FrameExtractionInput,
  FrameExtractionOutput,
  FrameProvider,
  ImageGenerationInput,
  ImageGenerationOutput,
  ImageProvider,
  LLMProvider,
  ProviderArtifact,
  ProviderCapability,
  ProviderContext,
  ProviderMode,
  ProviderRunResult,
  StructuredOutputInput,
  TextGenerationInput,
  TextGenerationOutput,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoProvider
} from "./types";
import {
  cancelledResult,
  completedResult,
  createUsage,
  failedResult,
  slugify
} from "./utils";

const lightCapability: ProviderCapability = {
  id: "mock-light",
  description: "Deterministic mock execution for tests and development.",
  heavy: false
};

const heavyCapability: ProviderCapability = {
  id: "mock-heavy",
  description: "Represents a future heavy local model job.",
  heavy: true
};

export interface MockProviderOptions {
  id?: string;
  name?: string;
  mode?: ProviderMode;
  capabilities?: ProviderCapability[];
}

abstract class MockProviderBase {
  readonly id: string;
  readonly name: string;
  readonly mode: ProviderMode;
  readonly capabilities: ProviderCapability[];

  protected constructor(
    defaults: Required<Pick<MockProviderOptions, "id" | "name" | "mode">> & {
      capabilities: ProviderCapability[];
    },
    options: ProviderMode | MockProviderOptions | undefined
  ) {
    const resolvedOptions = resolveMockOptions(defaults, options);

    this.id = resolvedOptions.id;
    this.name = resolvedOptions.name;
    this.mode = resolvedOptions.mode;
    this.capabilities = resolvedOptions.capabilities;
  }

  isAvailable(): boolean {
    return true;
  }

  protected isCancelled(context: ProviderContext): boolean {
    return context.abortSignal?.aborted ?? false;
  }
}

export class MockLLMProvider extends MockProviderBase implements LLMProvider {
  readonly type = "llm" as const;

  constructor(options: ProviderMode | MockProviderOptions = "local") {
    super(
      {
        id: "mock-llm-provider",
        name: "Mock LLM Provider",
        mode: "local",
        capabilities: [lightCapability]
      },
      options
    );
  }

  run(
    input: TextGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<TextGenerationOutput>> {
    return this.generateText(input, context);
  }

  generateText(
    input: TextGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<TextGenerationOutput>> {
    if (this.isCancelled(context)) {
      return Promise.resolve(cancelledResult());
    }

    const text = `Mock response for: ${input.prompt}`;

    return Promise.resolve(
      completedResult(
        { text },
        {
          usage: createUsage({
            inputTokens: input.prompt.length,
            outputTokens: text.length
          }),
          metadata: {
            providerId: this.id
          }
        }
      )
    );
  }

  generateStructuredOutput<TOutput>(
    input: StructuredOutputInput,
    schema: z.ZodType<TOutput>,
    context: ProviderContext
  ): Promise<ProviderRunResult<TOutput>> {
    if (this.isCancelled(context)) {
      return Promise.resolve(cancelledResult());
    }

    const structuredCandidate = {
      title: "Mock Scroll3D SaaS Landing Page",
      sections: [
        { type: "hero", name: "Hero" },
        { type: "features", name: "Features" },
        { type: "pricing", name: "Pricing" },
        { type: "faq", name: "FAQ" }
      ],
      visualPrompt:
        "Dark cinematic SaaS interface with luminous product panels and depth.",
      motionPrompt: "Slow orbital camera move through layered product UI panels.",
      sourcePrompt: input.prompt
    };

    const parsed = schema.safeParse(structuredCandidate);

    if (!parsed.success) {
      return Promise.resolve(
        failedResult("Mock structured output did not match the provided schema.")
      );
    }

    return Promise.resolve(
      completedResult(parsed.data, {
        usage: createUsage({
          inputTokens: input.prompt.length,
          outputTokens: JSON.stringify(parsed.data).length
        }),
        metadata: {
          providerId: this.id,
          structured: true
        }
      })
    );
  }
}

export class MockImageProvider extends MockProviderBase implements ImageProvider {
  readonly type = "image" as const;

  constructor(options: ProviderMode | MockProviderOptions = "api") {
    super(
      {
        id: "mock-image-provider",
        name: "Mock Image Provider",
        mode: "api",
        capabilities: [heavyCapability]
      },
      options
    );
  }

  run(
    input: ImageGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<ImageGenerationOutput>> {
    return this.generateImage(input, context);
  }

  generateImage(
    input: ImageGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<ImageGenerationOutput>> {
    if (this.isCancelled(context)) {
      return Promise.resolve(cancelledResult());
    }

    const slug = slugify(input.prompt);
    const image: ProviderArtifact = {
      id: `mock-image-${slug}`,
      type: "image",
      path: `/mock-assets/images/${slug}.webp`,
      metadata: {
        prompt: input.prompt,
        aspectRatio: input.aspectRatio ?? "16:9",
        seed: input.seed ?? 1
      }
    };

    return Promise.resolve(
      completedResult(
        { image, prompt: input.prompt },
        {
          artifacts: [image],
          usage: createUsage({ images: 1, durationMs: 10 }),
          metadata: {
            providerId: this.id
          }
        }
      )
    );
  }
}

export class MockVideoProvider extends MockProviderBase implements VideoProvider {
  readonly type = "video" as const;

  constructor(options: ProviderMode | MockProviderOptions = "api") {
    super(
      {
        id: "mock-video-provider",
        name: "Mock Video Provider",
        mode: "api",
        capabilities: [heavyCapability]
      },
      options
    );
  }

  run(
    input: VideoGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<VideoGenerationOutput>> {
    return this.generateVideo(input, context);
  }

  generateVideo(
    input: VideoGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<VideoGenerationOutput>> {
    if (this.isCancelled(context)) {
      return Promise.resolve(cancelledResult());
    }

    const slug = slugify(input.prompt);
    const video: ProviderArtifact = {
      id: `mock-video-${slug}`,
      type: "video",
      path: `/mock-assets/videos/${slug}.mp4`,
      metadata: {
        prompt: input.prompt,
        durationSeconds: input.durationSeconds ?? 8,
        sourceImageId: input.sourceImage?.id ?? null
      }
    };

    return Promise.resolve(
      completedResult(
        { video, prompt: input.prompt },
        {
          artifacts: [video],
          usage: createUsage({ videos: 1, durationMs: 15 }),
          metadata: {
            providerId: this.id
          }
        }
      )
    );
  }
}

export class MockFrameProvider extends MockProviderBase implements FrameProvider {
  readonly type = "frame" as const;

  constructor(options: ProviderMode | MockProviderOptions = "local") {
    super(
      {
        id: "mock-frame-provider",
        name: "Mock Frame Provider",
        mode: "local",
        capabilities: [heavyCapability]
      },
      options
    );
  }

  run(
    input: FrameExtractionInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<FrameExtractionOutput>> {
    return this.extractFrames(input, context);
  }

  extractFrames(
    input: FrameExtractionInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<FrameExtractionOutput>> {
    if (this.isCancelled(context)) {
      return Promise.resolve(cancelledResult());
    }

    const slug = slugify(input.video.id);
    const targets = input.targets ?? [
      {
        target: "desktop" as const,
        width: 1920,
        height: 1080,
        frameCount: 180,
        format: "webp" as const
      },
      {
        target: "mobile" as const,
        width: 828,
        height: 1792,
        frameCount: 120,
        format: "webp" as const
      }
    ];
    const frameSets = targets.map((target) => ({
      id: `mock-frames-${target.target}`,
      target: target.target,
      frameCount: target.frameCount,
      format: target.format,
      width: target.width,
      height: target.height,
      basePath: `/mock-assets/frames/${slug}/${target.target}`,
      manifestPath: `/mock-assets/frames/${slug}/${target.target}/manifest.json`
    }));
    const manifest: ProviderArtifact = {
      id: `mock-frame-manifest-${slug}`,
      type: "frame-manifest",
      path: `/mock-assets/frames/${slug}/manifest.json`,
      metadata: {
        videoId: input.video.id,
        frameSetCount: frameSets.length
      }
    };

    return Promise.resolve(
      completedResult(
        { manifest, frameSets },
        {
          artifacts: [manifest],
          usage: createUsage({
            frames: frameSets.reduce(
              (total, frameSet) => total + frameSet.frameCount,
              0
            ),
            durationMs: 20
          }),
          metadata: {
            providerId: this.id
          }
        }
      )
    );
  }
}

export class MockCodeProvider extends MockProviderBase implements CodeProvider {
  readonly type = "code" as const;

  constructor(options: ProviderMode | MockProviderOptions = "api") {
    super(
      {
        id: "mock-code-provider",
        name: "Mock Code Provider",
        mode: "api",
        capabilities: [lightCapability]
      },
      options
    );
  }

  run(
    input: CodeGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<CodeGenerationOutput>> {
    return this.generateCode(input, context);
  }

  generateCode(
    input: CodeGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<CodeGenerationOutput>> {
    if (this.isCancelled(context)) {
      return Promise.resolve(cancelledResult());
    }

    const code: ProviderArtifact = {
      id: "mock-site-compilation-plan",
      type: "code",
      path: "/mock-output/site-plan.json",
      metadata: {
        prompt: input.prompt,
        artifactCount: input.artifacts.length
      }
    };

    return Promise.resolve(
      completedResult(
        {
          code,
          plan: {
            entrypoint: "index.html",
            files: ["index.html", "styles.css", "scroll-scene.js", "project.json"]
          }
        },
        {
          artifacts: [code],
          usage: createUsage({
            inputTokens: input.prompt.length,
            outputTokens: 120,
            durationMs: 8
          }),
          metadata: {
            providerId: this.id
          }
        }
      )
    );
  }
}

export function createMockProviders(): [
  MockLLMProvider,
  MockImageProvider,
  MockVideoProvider,
  MockFrameProvider,
  MockCodeProvider
] {
  return [
    new MockLLMProvider(),
    new MockImageProvider(),
    new MockVideoProvider(),
    new MockFrameProvider(),
    new MockCodeProvider()
  ];
}

function resolveMockOptions(
  defaults: Required<Pick<MockProviderOptions, "id" | "name" | "mode">> & {
    capabilities: ProviderCapability[];
  },
  options: ProviderMode | MockProviderOptions | undefined
): Required<MockProviderOptions> {
  if (typeof options === "string") {
    return {
      id: defaults.id,
      name: defaults.name,
      mode: options,
      capabilities: defaults.capabilities
    };
  }

  return {
    id: options?.id ?? defaults.id,
    name: options?.name ?? defaults.name,
    mode: options?.mode ?? defaults.mode,
    capabilities: options?.capabilities ?? defaults.capabilities
  };
}
