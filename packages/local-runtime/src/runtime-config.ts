import { z } from "zod";
import type { LocalRuntimeConfig } from "./types";

export const LocalRuntimeConfigSchema = z
  .object({
    modelLoadPolicy: z
      .enum(["load-per-job", "keep-loaded", "unload-after-job"])
      .default("load-per-job"),
    maxConcurrentHeavyJobs: z.literal(1).default(1),
    tempDir: z.string().trim().min(1).default(".scroll3d/tmp"),
    storageDir: z.string().trim().min(1).default(".scroll3d/runs"),
    modelCacheDir: z.string().trim().min(1).default(".scroll3d/models"),
    allowMockFallback: z.boolean().default(true),
    defaultTimeoutMs: z.number().int().positive().optional()
  })
  .strict();

export type ValidatedLocalRuntimeConfig = z.infer<typeof LocalRuntimeConfigSchema>;

export function parseLocalRuntimeConfig(input: unknown): ValidatedLocalRuntimeConfig {
  return LocalRuntimeConfigSchema.parse(input);
}

export function safeParseLocalRuntimeConfig(input: unknown) {
  return LocalRuntimeConfigSchema.safeParse(input);
}

export function createLocalRuntimeConfig(input: unknown = {}): LocalRuntimeConfig {
  const config = parseLocalRuntimeConfig(input);

  return {
    modelLoadPolicy: config.modelLoadPolicy,
    maxConcurrentHeavyJobs: 1,
    tempDir: config.tempDir,
    storageDir: config.storageDir,
    modelCacheDir: config.modelCacheDir,
    allowMockFallback: config.allowMockFallback,
    ...(config.defaultTimeoutMs ? { defaultTimeoutMs: config.defaultTimeoutMs } : {})
  };
}
