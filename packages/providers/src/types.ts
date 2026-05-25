import type { z } from "zod";

export type ProviderType = "llm" | "image" | "video" | "frame" | "code";
export type ProviderMode = "local" | "api";
export type ProviderRunStatus = "completed" | "failed" | "cancelled";
export type ProviderImplementation =
  | "mock"
  | "openai-compatible"
  | "ollama"
  | "comfyui"
  | "generic-api"
  | "ffmpeg"
  | "local-code-llm";

export interface ProviderCapability {
  id: string;
  description: string;
  heavy: boolean;
}

export interface ProviderLogger {
  debug?: (message: string, metadata?: Record<string, unknown>) => void;
  info?: (message: string, metadata?: Record<string, unknown>) => void;
  warn?: (message: string, metadata?: Record<string, unknown>) => void;
  error?: (message: string, metadata?: Record<string, unknown>) => void;
}

export interface ProviderContext {
  projectId: string;
  jobId: string;
  abortSignal?: AbortSignal;
  logger?: ProviderLogger;
  secrets?: Record<string, string | undefined>;
  tempDir?: string;
}

export interface ProviderArtifact {
  id: string;
  type: "image" | "video" | "frame-manifest" | "code" | "json" | "other";
  path: string;
  metadata: Record<string, unknown>;
}

export interface ProviderUsage {
  inputTokens: number;
  outputTokens: number;
  images: number;
  videos: number;
  frames: number;
  durationMs: number;
}

export interface ProviderRunResult<TOutput = unknown> {
  status: ProviderRunStatus;
  output: TOutput | null;
  artifacts: ProviderArtifact[];
  usage: ProviderUsage;
  warnings: string[];
  metadata: Record<string, unknown>;
}

export interface BaseProvider<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  type: ProviderType;
  mode: ProviderMode;
  capabilities: ProviderCapability[];
  isAvailable(context?: ProviderContext): boolean | Promise<boolean>;
  run(input: TInput, context: ProviderContext): Promise<ProviderRunResult<TOutput>>;
}

export interface ProviderSecretRef {
  id: string;
  label?: string;
}

export interface ProviderSecretStore {
  setSecret(ref: ProviderSecretRef | string, value: string): void;
  getSecret(ref: ProviderSecretRef | string): string | undefined;
  deleteSecret(ref: ProviderSecretRef | string): boolean;
  hasSecret(ref: ProviderSecretRef | string): boolean;
  listSecretRefs(): ProviderSecretRef[];
}

export interface ProviderConfigBase {
  id: string;
  name: string;
  type: ProviderType;
  mode: ProviderMode;
  enabled: boolean;
  provider: ProviderImplementation;
  model?: string;
  baseUrl?: string;
  endpoint?: string;
  localPath?: string;
  secretRef?: ProviderSecretRef;
  capabilities?: ProviderCapability[];
}

export interface LLMProviderConfig extends ProviderConfigBase {
  type: "llm";
}

export interface ImageProviderConfig extends ProviderConfigBase {
  type: "image";
}

export interface VideoProviderConfig extends ProviderConfigBase {
  type: "video";
}

export interface FrameProviderConfig extends ProviderConfigBase {
  type: "frame";
}

export interface CodeProviderConfig extends ProviderConfigBase {
  type: "code";
}

export type AnyProviderConfig =
  | LLMProviderConfig
  | ImageProviderConfig
  | VideoProviderConfig
  | FrameProviderConfig
  | CodeProviderConfig;

export interface ProviderRegistration {
  id: string;
  provider: AnyProvider;
  enabled: boolean;
  config: AnyProviderConfig | null;
  secretRefs: ProviderSecretRef[];
  presetId: string | null;
  createdAt: string;
}

export interface ProviderPreset {
  id: string;
  name: string;
  description: string;
  config: AnyProviderConfig;
}

export interface ProviderConfigValidationResult {
  success: boolean;
  config: AnyProviderConfig | null;
  errors: string[];
}

export interface TextGenerationInput {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface TextGenerationOutput {
  text: string;
}

export interface StructuredOutputInput {
  prompt: string;
  systemPrompt?: string;
}

export interface ImageGenerationInput {
  prompt: string;
  aspectRatio?: string;
  seed?: number;
  style?: string;
}

export interface ImageGenerationOutput {
  image: ProviderArtifact;
  prompt: string;
}

export interface VideoGenerationInput {
  prompt: string;
  sourceImage?: ProviderArtifact;
  durationSeconds?: number;
}

export interface VideoGenerationOutput {
  video: ProviderArtifact;
  prompt: string;
}

export interface FrameExtractionTarget {
  target: "desktop" | "tablet" | "mobile";
  width: number;
  height: number;
  frameCount: number;
  format: "webp" | "avif" | "png" | "jpg";
}

export interface FrameExtractionInput {
  video: ProviderArtifact;
  targets?: FrameExtractionTarget[];
}

export interface ExtractedFrameSet {
  id: string;
  target: FrameExtractionTarget["target"];
  frameCount: number;
  format: FrameExtractionTarget["format"];
  width: number;
  height: number;
  basePath: string;
  manifestPath: string;
}

export interface FrameExtractionOutput {
  manifest: ProviderArtifact;
  frameSets: ExtractedFrameSet[];
}

export interface CodeGenerationInput {
  prompt: string;
  project: unknown;
  artifacts: ProviderArtifact[];
}

export interface CodeGenerationOutput {
  code: ProviderArtifact;
  plan: {
    entrypoint: string;
    files: string[];
  };
}

export interface LLMProvider extends BaseProvider<
  TextGenerationInput | StructuredOutputInput
> {
  type: "llm";
  generateText(
    input: TextGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<TextGenerationOutput>>;
  generateStructuredOutput<TOutput>(
    input: StructuredOutputInput,
    schema: z.ZodType<TOutput>,
    context: ProviderContext
  ): Promise<ProviderRunResult<TOutput>>;
}

export interface ImageProvider extends BaseProvider<
  ImageGenerationInput,
  ImageGenerationOutput
> {
  type: "image";
  generateImage(
    input: ImageGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<ImageGenerationOutput>>;
}

export interface VideoProvider extends BaseProvider<
  VideoGenerationInput,
  VideoGenerationOutput
> {
  type: "video";
  generateVideo(
    input: VideoGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<VideoGenerationOutput>>;
}

export interface FrameProvider extends BaseProvider<
  FrameExtractionInput,
  FrameExtractionOutput
> {
  type: "frame";
  extractFrames(
    input: FrameExtractionInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<FrameExtractionOutput>>;
}

export interface CodeProvider extends BaseProvider<
  CodeGenerationInput,
  CodeGenerationOutput
> {
  type: "code";
  generateCode(
    input: CodeGenerationInput,
    context: ProviderContext
  ): Promise<ProviderRunResult<CodeGenerationOutput>>;
}

export type AnyProvider =
  | LLMProvider
  | ImageProvider
  | VideoProvider
  | FrameProvider
  | CodeProvider;
