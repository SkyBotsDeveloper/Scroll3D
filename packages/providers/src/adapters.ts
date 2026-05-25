import type { z } from "zod";
import { NotImplementedError } from "./errors";
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
  ProviderSecretRef,
  StructuredOutputInput,
  TextGenerationInput,
  TextGenerationOutput,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoProvider
} from "./types";
import { failedResult } from "./utils";

export interface ProviderAdapterConfig {
  id: string;
  name: string;
  mode: ProviderMode;
  model?: string;
  baseUrl?: string;
  endpoint?: string;
  localPath?: string;
  secretRef?: ProviderSecretRef;
  capabilities?: ProviderCapability[];
}

abstract class ProviderAdapterBase {
  readonly id: string;
  readonly name: string;
  readonly mode: ProviderMode;
  readonly capabilities: ProviderCapability[];
  protected readonly config: ProviderAdapterConfig;

  protected constructor(
    config: ProviderAdapterConfig,
    defaultCapabilities: ProviderCapability[]
  ) {
    this.id = config.id;
    this.name = config.name;
    this.mode = config.mode;
    this.capabilities = config.capabilities ?? defaultCapabilities;
    this.config = config;
  }

  isAvailable(context?: ProviderContext): boolean {
    if (this.mode === "api") {
      return Boolean(
        this.config.baseUrl &&
        this.config.secretRef &&
        (!context?.secrets || Boolean(context.secrets[this.config.secretRef.id]))
      );
    }

    return Boolean(this.config.baseUrl || this.config.localPath || this.config.model);
  }

  protected unavailableResult<TOutput>(feature: string): ProviderRunResult<TOutput> {
    const error = new NotImplementedError(
      `${this.name} ${feature} is a scaffold and is not implemented yet.`
    );

    return failedResult(error.message);
  }
}

export class OpenAICompatibleLLMProvider
  extends ProviderAdapterBase
  implements LLMProvider
{
  readonly type = "llm" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "api" }, [
      {
        id: "llm-text",
        description: "Future OpenAI-compatible text generation.",
        heavy: false
      },
      {
        id: "llm-structured-output",
        description: "Future OpenAI-compatible structured output generation.",
        heavy: false
      }
    ]);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("text generation"));
  }

  generateStructuredOutput<TOutput>(
    input: StructuredOutputInput,
    schema: z.ZodType<TOutput>,
    context: ProviderContext
  ): Promise<ProviderRunResult<TOutput>> {
    markScaffoldInputsUnused(input, schema, context);
    return Promise.resolve(this.unavailableResult("structured output generation"));
  }
}

export class OllamaLLMProvider extends ProviderAdapterBase implements LLMProvider {
  readonly type = "llm" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "local" }, [
      {
        id: "local-llm-text",
        description: "Future Ollama text generation.",
        heavy: true
      },
      {
        id: "local-llm-structured-output",
        description: "Future Ollama structured output generation.",
        heavy: true
      }
    ]);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("text generation"));
  }

  generateStructuredOutput<TOutput>(
    input: StructuredOutputInput,
    schema: z.ZodType<TOutput>,
    context: ProviderContext
  ): Promise<ProviderRunResult<TOutput>> {
    markScaffoldInputsUnused(input, schema, context);
    return Promise.resolve(this.unavailableResult("structured output generation"));
  }
}

export class OpenAICompatibleImageProvider
  extends ProviderAdapterBase
  implements ImageProvider
{
  readonly type = "image" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "api" }, [
      {
        id: "image-generation",
        description: "Future OpenAI-compatible image generation.",
        heavy: true
      }
    ]);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("image generation"));
  }
}

export class ComfyUIImageProvider extends ProviderAdapterBase implements ImageProvider {
  readonly type = "image" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "local" }, [
      {
        id: "comfyui-image-generation",
        description: "Future ComfyUI image workflow execution.",
        heavy: true
      }
    ]);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("image generation"));
  }
}

export class GenericAPIVideoProvider
  extends ProviderAdapterBase
  implements VideoProvider
{
  readonly type = "video" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "api" }, [
      {
        id: "video-generation",
        description: "Future generic API video generation.",
        heavy: true
      }
    ]);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("video generation"));
  }
}

export class ComfyUIVideoProvider extends ProviderAdapterBase implements VideoProvider {
  readonly type = "video" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "local" }, [
      {
        id: "comfyui-video-generation",
        description: "Future ComfyUI video workflow execution.",
        heavy: true
      }
    ]);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("video generation"));
  }
}

export class FFmpegFrameProvider extends ProviderAdapterBase implements FrameProvider {
  readonly type = "frame" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "local" }, [
      {
        id: "ffmpeg-frame-extraction",
        description: "Future FFmpeg frame extraction.",
        heavy: true
      }
    ]);
  }

  override isAvailable(): boolean {
    return Boolean(this.config.localPath || this.config.model || this.config.endpoint);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("frame extraction"));
  }
}

export class OpenAICompatibleCodeProvider
  extends ProviderAdapterBase
  implements CodeProvider
{
  readonly type = "code" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "api" }, [
      {
        id: "code-generation",
        description: "Future OpenAI-compatible website code generation.",
        heavy: false
      }
    ]);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("code generation"));
  }
}

export class LocalCodeLLMProvider extends ProviderAdapterBase implements CodeProvider {
  readonly type = "code" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ ...config, mode: "local" }, [
      {
        id: "local-code-generation",
        description: "Future local code LLM website generation.",
        heavy: true
      }
    ]);
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
    markScaffoldInputsUnused(input, context);
    return Promise.resolve(this.unavailableResult("code generation"));
  }
}

export function createScaffoldArtifact(
  id: string,
  type: ProviderArtifact["type"]
): ProviderArtifact {
  return {
    id,
    type,
    path: "",
    metadata: {}
  };
}

function markScaffoldInputsUnused(...values: unknown[]): void {
  void values;
}
