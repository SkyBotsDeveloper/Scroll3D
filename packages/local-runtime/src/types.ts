export type RuntimeJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ModelLoadPolicy = "load-per-job" | "keep-loaded" | "unload-after-job";
export type LocalModelStatus =
  | "not-installed"
  | "installed"
  | "downloading"
  | "ready"
  | "unavailable"
  | "error";
export type ModelStage = "prompt" | "image" | "video" | "frame" | "code";
export type LocalRuntimeConnectionStatus =
  | "unknown"
  | "configured"
  | "connected"
  | "unavailable"
  | "missing-config";
export type LocalModelPackSelection = "lite" | "balanced" | "pro" | "custom";

export interface RuntimeJobEvent {
  type:
    | "queued"
    | "started"
    | "completed"
    | "failed"
    | "cancelled"
    | "model-load"
    | "model-unload";
  message: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface RuntimeModelRef {
  id: string;
  name: string;
  providerType: "llm" | "image" | "video" | "frame" | "code";
  heavy: boolean;
  path: string | null;
  metadata: Record<string, unknown>;
}

export interface RuntimeExecutionContext {
  jobId: string;
  signal: AbortSignal;
  model: RuntimeModelRef | null;
  metadata: Record<string, unknown>;
}

export interface RuntimeJob<TOutput = unknown> {
  id: string;
  name: string;
  heavy: boolean;
  priority?: number;
  model?: RuntimeModelRef;
  metadata?: Record<string, unknown>;
  run: (context: RuntimeExecutionContext) => Promise<TOutput>;
}

export interface RuntimeJobRecord<TOutput = unknown> {
  id: string;
  name: string;
  heavy: boolean;
  priority: number;
  model: RuntimeModelRef | null;
  status: RuntimeJobStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  output: TOutput | null;
  error: string | null;
  metadata: Record<string, unknown>;
  events: RuntimeJobEvent[];
}

export interface RuntimeModelHooks {
  beforeJobStart?: (job: RuntimeJobRecord) => void | Promise<void>;
  afterJobComplete?: (job: RuntimeJobRecord) => void | Promise<void>;
  onJobFail?: (job: RuntimeJobRecord) => void | Promise<void>;
  beforeModelLoad?: (
    model: RuntimeModelRef,
    job: RuntimeJobRecord
  ) => void | Promise<void>;
  afterModelUnload?: (
    model: RuntimeModelRef,
    job: RuntimeJobRecord
  ) => void | Promise<void>;
}

export interface LocalRuntimeConfig {
  modelLoadPolicy: ModelLoadPolicy;
  maxConcurrentHeavyJobs: 1;
  tempDir?: string;
  storageDir?: string;
  modelCacheDir?: string;
  allowMockFallback?: boolean;
  defaultTimeoutMs?: number;
  hooks?: RuntimeModelHooks;
}

export interface RuntimeSystemSpecs {
  os: string;
  arch: string;
  cpuModel?: string;
  cpuCores?: number;
  totalRamGB?: number;
  freeRamGB?: number;
  gpuName?: string;
  vramGB?: number;
  freeDiskGB?: number;
  nodeVersion?: string;
}

export interface LocalRuntimeEndpoint {
  id: string;
  name: string;
  url: string;
  status: LocalRuntimeConnectionStatus;
  checkedAt?: string;
}

export interface LocalModelEntry {
  id: string;
  name: string;
  stage: ModelStage;
  providerType: "llm" | "image" | "video" | "frame" | "code";
  runtime: "ollama" | "comfyui" | "ffmpeg" | "scroll3d-runtime" | "api" | "mock";
  sizeGB: number;
  minRamGB: number;
  recommendedRamGB: number;
  minVramGB?: number;
  recommendedVramGB?: number;
  downloadUrl?: string;
  licenseNote?: string;
  status: LocalModelStatus;
  installCommand?: string;
  notes: string[];
}

export interface LocalModelRegistry {
  models: LocalModelEntry[];
}

export interface ModelPackDefinition {
  id: LocalModelPackSelection;
  name: string;
  description: string;
  minRamGB: number;
  recommendedRamGB: number;
  minVramGB?: number;
  recommendedVramGB?: number;
  estimatedDiskGB: number;
  modelIds: string[];
  stagesSupported: ModelStage[];
  warnings: string[];
}

export interface ModelPackRecommendation {
  recommendedPack: ModelPackDefinition;
  compatiblePacks: ModelPackDefinition[];
  incompatiblePacks: Array<{ pack: ModelPackDefinition; reasons: string[] }>;
  reasons: string[];
  warnings: string[];
}

export interface Scroll3DLocalRuntimeConfig {
  version: string;
  runtime: LocalRuntimeEndpoint;
  modelCacheDir: string;
  selectedModelPack: LocalModelPackSelection;
  installedModels: LocalModelRegistry;
  providerBindings: Partial<Record<ModelStage, string>>;
  maxConcurrentHeavyJobs: 1;
  allowMockFallback: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocalRuntimeConfigPlan {
  config: Scroll3DLocalRuntimeConfig;
  specs: RuntimeSystemSpecs;
  recommendation: ModelPackRecommendation;
  warnings: string[];
  nextSteps: string[];
}

export interface RuntimeQueue {
  enqueue(job: RuntimeJob): RuntimeJobRecord;
  cancel(jobId: string): boolean;
  getActiveJob(): RuntimeJobRecord | undefined;
  getJob(jobId: string): RuntimeJobRecord | undefined;
  listJobs(): RuntimeJobRecord[];
  runNext(): Promise<RuntimeJobRecord | undefined>;
  runAll(): Promise<RuntimeJobRecord[]>;
}
