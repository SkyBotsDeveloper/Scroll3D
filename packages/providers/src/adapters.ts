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
  ProviderConnectionCheck,
  ProviderConnectionContext,
  ProviderConnectionStatus,
  ProviderDiscoveryInfo,
  ProviderArtifact,
  ProviderCapability,
  ProviderContext,
  ProviderMode,
  ProviderRequestDebugShape,
  ProviderRequestShape,
  ProviderRunResult,
  ProviderSecretRef,
  StructuredOutputInput,
  TextGenerationInput,
  TextGenerationOutput,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoProvider
} from "./types";
import { hasSecret } from "./connection";
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

  getAdapterConfig(): ProviderAdapterConfig {
    return { ...this.config };
  }

  checkConnection(context: ProviderConnectionContext = {}): ProviderConnectionCheck {
    const startedAt = Date.now();
    const validation = this.validateConnectionConfig(context);

    return {
      providerId: this.id,
      status: validation.status,
      message: validation.message,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      capabilities: this.capabilities,
      warnings: validation.warnings,
      metadata: this.getSafeConnectionMetadata()
    };
  }

  getDiscoveryInfo(): ProviderDiscoveryInfo {
    return {
      providerId: this.id,
      expectedEndpoint: this.config.baseUrl ?? this.config.endpoint ?? null,
      expectedPath: this.config.localPath ?? null,
      installHint: `${this.name} integration is scaffolded. Install and configure the provider before enabling it.`,
      connectHint: "Use Settings to check connection after configuring the endpoint.",
      modelListPlaceholder: this.config.model ? [this.config.model] : []
    };
  }

  validateConnectionConfig(context: ProviderConnectionContext = {}): {
    status: ProviderConnectionStatus;
    message: string;
    warnings: string[];
  } {
    if (this.mode === "api") {
      const missing = getMissingApiConfig(this.config);

      if (missing.length > 0) {
        return {
          status: "missing-config",
          message: `Missing API provider config: ${missing.join(", ")}.`,
          warnings: ["No network call was made."]
        };
      }

      if (!this.config.secretRef) {
        return {
          status: "missing-secret",
          message: "API provider requires a secretRef.",
          warnings: ["Raw API keys must stay outside project files."]
        };
      }

      if (!hasSecret(this.config.secretRef, context.secrets)) {
        return {
          status: "missing-secret",
          message: `Secret reference '${this.config.secretRef.id}' is not available to the checker.`,
          warnings: ["No raw secret value was logged or serialized."]
        };
      }

      return {
        status: context.allowNetwork === true ? "configured" : "configured",
        message:
          "API provider is configured. Real network connection checks are disabled in this phase.",
        warnings: ["No external network call was made."]
      };
    }

    const endpoint = this.getConfiguredLocalEndpoint();

    if (!endpoint) {
      return {
        status: "missing-config",
        message: "Local provider requires an endpoint, command, path, or model.",
        warnings: ["No local process was started."]
      };
    }

    if (isLocalhostUrl(endpoint) && context.allowLocalhost === false) {
      return {
        status: "unavailable",
        message: "Localhost checks are disabled for this connection context.",
        warnings: ["No local endpoint probe was made."]
      };
    }

    return {
      status: "configured",
      message:
        "Local provider config is present. Runtime probing is shallow and disabled-by-default.",
      warnings: ["No model execution or service startup occurred."]
    };
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

  protected buildApiRequestShape(
    path: string,
    body: Record<string, unknown>,
    context: ProviderConnectionContext = {}
  ): ProviderRequestShape {
    return {
      url: this.resolveEndpointPath(path),
      method: "POST",
      headers: this.buildSafeHeaders(context),
      body
    };
  }

  protected buildRequestDebugShape(
    request: ProviderRequestShape
  ): ProviderRequestDebugShape {
    return {
      ...request,
      headers: Object.fromEntries(
        Object.entries(request.headers).map(([key, value]) => [
          key,
          key.toLowerCase() === "authorization" ? "[redacted]" : value
        ])
      )
    };
  }

  protected buildSafeHeaders(
    context: ProviderConnectionContext = {}
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "content-type": "application/json"
    };

    if (this.config.secretRef && hasSecret(this.config.secretRef, context.secrets)) {
      headers.authorization = `Bearer [secretRef:${this.config.secretRef.id}]`;
    }

    return headers;
  }

  protected resolveEndpointPath(path: string): string {
    const baseUrl = this.config.baseUrl ?? this.config.endpoint ?? "";
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${normalizedBase}${normalizedPath}`;
  }

  protected getConfiguredLocalEndpoint(): string | undefined {
    return (
      this.config.baseUrl ??
      this.config.endpoint ??
      this.config.localPath ??
      this.config.model
    );
  }

  protected getSafeConnectionMetadata(): Record<string, unknown> {
    return {
      mode: this.mode,
      model: this.config.model ?? null,
      baseUrl: this.config.baseUrl ?? null,
      endpoint: this.config.endpoint ?? null,
      localPath: this.config.localPath ?? null,
      secretRef: this.config.secretRef ? { id: this.config.secretRef.id } : null
    };
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

  buildTextRequestShape(
    input: TextGenerationInput,
    context?: ProviderConnectionContext
  ): ProviderRequestShape {
    return this.buildApiRequestShape(
      "chat/completions",
      {
        model: this.config.model,
        messages: [
          ...(input.systemPrompt
            ? [{ role: "system", content: input.systemPrompt }]
            : []),
          { role: "user", content: input.prompt }
        ],
        temperature: input.temperature,
        max_tokens: input.maxTokens
      },
      context
    );
  }

  buildDebugTextRequestShape(
    input: TextGenerationInput,
    context?: ProviderConnectionContext
  ): ProviderRequestDebugShape {
    return this.buildRequestDebugShape(this.buildTextRequestShape(input, context));
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
    super({ baseUrl: "http://127.0.0.1:11434", ...config, mode: "local" }, [
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

  override getDiscoveryInfo(): ProviderDiscoveryInfo {
    return {
      providerId: this.id,
      expectedEndpoint: this.config.baseUrl ?? "http://127.0.0.1:11434",
      expectedPath: null,
      installHint:
        "Install Ollama and pull a compatible local LLM in a later setup phase.",
      connectHint:
        "Start Ollama, then connect to http://127.0.0.1:11434 from Settings.",
      modelListPlaceholder: this.config.model ? [this.config.model] : ["not-installed"]
    };
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

  buildImageRequestShape(
    input: ImageGenerationInput,
    context?: ProviderConnectionContext
  ): ProviderRequestShape {
    return this.buildApiRequestShape(
      "images/generations",
      {
        model: this.config.model,
        prompt: input.prompt,
        size: input.aspectRatio ?? "16:9",
        seed: input.seed,
        style: input.style
      },
      context
    );
  }

  buildDebugImageRequestShape(
    input: ImageGenerationInput,
    context?: ProviderConnectionContext
  ): ProviderRequestDebugShape {
    return this.buildRequestDebugShape(this.buildImageRequestShape(input, context));
  }
}

export class ComfyUIImageProvider extends ProviderAdapterBase implements ImageProvider {
  readonly type = "image" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ baseUrl: "http://127.0.0.1:8188", ...config, mode: "local" }, [
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

  override getDiscoveryInfo(): ProviderDiscoveryInfo {
    return {
      providerId: this.id,
      expectedEndpoint: this.config.baseUrl ?? "http://127.0.0.1:8188",
      expectedPath: null,
      installHint: "Install ComfyUI and configure image workflows in a later phase.",
      connectHint:
        "Start ComfyUI, then connect to http://127.0.0.1:8188 from Settings.",
      modelListPlaceholder: ["not-installed"]
    };
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

  buildVideoRequestShape(
    input: VideoGenerationInput,
    context?: ProviderConnectionContext
  ): ProviderRequestShape {
    return this.buildApiRequestShape(
      "videos/generations",
      {
        model: this.config.model,
        prompt: input.prompt,
        duration_seconds: input.durationSeconds,
        source_image: input.sourceImage?.id
      },
      context
    );
  }

  buildDebugVideoRequestShape(
    input: VideoGenerationInput,
    context?: ProviderConnectionContext
  ): ProviderRequestDebugShape {
    return this.buildRequestDebugShape(this.buildVideoRequestShape(input, context));
  }
}

export class ComfyUIVideoProvider extends ProviderAdapterBase implements VideoProvider {
  readonly type = "video" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ baseUrl: "http://127.0.0.1:8188", ...config, mode: "local" }, [
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

  override getDiscoveryInfo(): ProviderDiscoveryInfo {
    return {
      providerId: this.id,
      expectedEndpoint: this.config.baseUrl ?? "http://127.0.0.1:8188",
      expectedPath: null,
      installHint: "Install ComfyUI and configure video workflows in a later phase.",
      connectHint:
        "Start ComfyUI, then connect to http://127.0.0.1:8188 from Settings.",
      modelListPlaceholder: ["not-installed"]
    };
  }
}

export class FFmpegFrameProvider extends ProviderAdapterBase implements FrameProvider {
  readonly type = "frame" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ localPath: "ffmpeg", ...config, mode: "local" }, [
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

  override getDiscoveryInfo(): ProviderDiscoveryInfo {
    return {
      providerId: this.id,
      expectedEndpoint: null,
      expectedPath: this.config.localPath ?? "ffmpeg",
      installHint: "Install FFmpeg and ensure the ffmpeg command is available on PATH.",
      connectHint:
        "Frame extraction will use FFmpeg in a later phase; no command runs now.",
      modelListPlaceholder: ["ffmpeg-command"]
    };
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

  buildCodeRequestShape(
    input: CodeGenerationInput,
    context?: ProviderConnectionContext
  ): ProviderRequestShape {
    return this.buildApiRequestShape(
      "chat/completions",
      {
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: input.prompt
          }
        ],
        metadata: {
          artifactCount: input.artifacts.length
        }
      },
      context
    );
  }

  buildDebugCodeRequestShape(
    input: CodeGenerationInput,
    context?: ProviderConnectionContext
  ): ProviderRequestDebugShape {
    return this.buildRequestDebugShape(this.buildCodeRequestShape(input, context));
  }
}

export class LocalCodeLLMProvider extends ProviderAdapterBase implements CodeProvider {
  readonly type = "code" as const;

  constructor(config: ProviderAdapterConfig) {
    super({ baseUrl: "http://127.0.0.1:4317", ...config, mode: "local" }, [
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

  override getDiscoveryInfo(): ProviderDiscoveryInfo {
    return {
      providerId: this.id,
      expectedEndpoint: this.config.baseUrl ?? "http://127.0.0.1:4317",
      expectedPath: null,
      installHint: "Configure a local code LLM through the future Scroll3D runtime.",
      connectHint: "Connect the Scroll3D local runtime at http://127.0.0.1:4317.",
      modelListPlaceholder: this.config.model ? [this.config.model] : ["not-installed"]
    };
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

function getMissingApiConfig(config: ProviderAdapterConfig): string[] {
  return [...(config.baseUrl ? [] : ["baseUrl"]), ...(config.model ? [] : ["model"])];
}

function isLocalhostUrl(value: string): boolean {
  return value.includes("127.0.0.1") || value.includes("localhost");
}
