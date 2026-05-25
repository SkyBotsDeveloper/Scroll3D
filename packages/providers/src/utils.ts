import type {
  AnyProvider,
  BaseProvider,
  ProviderRunResult,
  ProviderType,
  ProviderUsage
} from "./types";

export function isProviderType<TType extends ProviderType>(
  provider: BaseProvider,
  type: TType
): provider is Extract<AnyProvider, { type: TType }> {
  return provider.type === type;
}

export function findProviderByType<TType extends ProviderType>(
  providers: readonly BaseProvider[],
  type: TType
): Extract<AnyProvider, { type: TType }> | undefined {
  return providers.find((provider): provider is Extract<AnyProvider, { type: TType }> =>
    isProviderType(provider, type)
  );
}

export function createUsage(overrides: Partial<ProviderUsage> = {}): ProviderUsage {
  return {
    inputTokens: overrides.inputTokens ?? 0,
    outputTokens: overrides.outputTokens ?? 0,
    images: overrides.images ?? 0,
    videos: overrides.videos ?? 0,
    frames: overrides.frames ?? 0,
    durationMs: overrides.durationMs ?? 0
  };
}

export function completedResult<TOutput>(
  output: TOutput,
  options: Partial<Omit<ProviderRunResult<TOutput>, "status" | "output">> = {}
): ProviderRunResult<TOutput> {
  return {
    status: "completed",
    output,
    artifacts: options.artifacts ?? [],
    usage: options.usage ?? createUsage(),
    warnings: options.warnings ?? [],
    metadata: options.metadata ?? {}
  };
}

export function cancelledResult<TOutput = never>(
  warnings: string[] = ["Provider run was cancelled."]
): ProviderRunResult<TOutput> {
  return {
    status: "cancelled",
    output: null,
    artifacts: [],
    usage: createUsage(),
    warnings,
    metadata: {}
  };
}

export function failedResult<TOutput = never>(
  message: string
): ProviderRunResult<TOutput> {
  return {
    status: "failed",
    output: null,
    artifacts: [],
    usage: createUsage(),
    warnings: [message],
    metadata: {
      error: message
    }
  };
}

export function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "scroll3d";
}
