import { z } from "zod";
import { ProviderConfigSchema } from "./config";
import type { ProviderFallbackRule, ProjectModeProviderStrategy } from "./selection";
import type { AnyProviderConfig, ProviderMode, ProviderType } from "./types";

const ProviderTypeSchema = z.enum(["llm", "image", "video", "frame", "code"]);
const SelectionModeSchema = z.enum(["local", "api", "mock"]);

export const Scroll3DConfigSchema = z
  .object({
    project: z
      .object({
        defaultMode: z.enum(["local", "api", "hybrid"]).default("hybrid")
      })
      .default({ defaultMode: "hybrid" }),
    providers: z.array(ProviderConfigSchema).default([]),
    providerPreferences: z
      .partialRecord(
        ProviderTypeSchema,
        z.object({
          preferredProviderId: z.string().trim().min(1).optional(),
          modeOrder: z.array(SelectionModeSchema).optional()
        })
      )
      .default({}),
    fallbackRules: z
      .array(
        z
          .object({
            type: ProviderTypeSchema,
            order: z.array(SelectionModeSchema)
          })
          .strict()
      )
      .default([]),
    localRuntime: z
      .object({
        tempDir: z.string().trim().min(1).default(".scroll3d/tmp"),
        storageDir: z.string().trim().min(1).default(".scroll3d/runs"),
        modelCacheDir: z.string().trim().min(1).default(".scroll3d/models"),
        allowMockFallback: z.boolean().default(true),
        defaultTimeoutMs: z.number().int().positive().optional()
      })
      .default({
        tempDir: ".scroll3d/tmp",
        storageDir: ".scroll3d/runs",
        modelCacheDir: ".scroll3d/models",
        allowMockFallback: true
      })
  })
  .strict();

export type Scroll3DConfig = z.infer<typeof Scroll3DConfigSchema>;

export interface LoadedScroll3DProviderConfig {
  defaultMode: ProjectModeProviderStrategy;
  providers: AnyProviderConfig[];
  preferredProviderIds: Partial<Record<ProviderType, string>>;
  preferredModes: Partial<Record<ProviderType, Array<ProviderMode | "mock">>>;
  fallbackRules: ProviderFallbackRule[];
  allowMockFallback: boolean;
  storageDir: string;
}

export function parseScroll3DConfig(input: unknown): Scroll3DConfig {
  return Scroll3DConfigSchema.parse(input);
}

export function safeParseScroll3DConfig(input: unknown) {
  return Scroll3DConfigSchema.safeParse(input);
}

export function loadScroll3DConfig(input: unknown): LoadedScroll3DProviderConfig {
  const config = parseScroll3DConfig(input);
  const preferredProviderIds: Partial<Record<ProviderType, string>> = {};
  const preferredModes: Partial<Record<ProviderType, Array<ProviderMode | "mock">>> =
    {};

  for (const [providerType, preference] of Object.entries(config.providerPreferences)) {
    const type = providerType as ProviderType;

    if (preference.preferredProviderId) {
      preferredProviderIds[type] = preference.preferredProviderId;
    }

    if (preference.modeOrder) {
      preferredModes[type] = preference.modeOrder;
    }
  }

  return {
    defaultMode: config.project.defaultMode,
    providers: config.providers as AnyProviderConfig[],
    preferredProviderIds,
    preferredModes,
    fallbackRules: config.fallbackRules,
    allowMockFallback: config.localRuntime.allowMockFallback,
    storageDir: config.localRuntime.storageDir
  };
}
