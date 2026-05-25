import { z } from "zod";
import { JsonObjectSchema, JsonValueSchema } from "./json";

const IdSchema = z.string().trim().min(1);
const DateTimeSchema = z.iso.datetime({ offset: true });
const PathSchema = z.string().trim().min(1);

export const ProjectModeSchema = z.enum(["local", "api", "hybrid"]);

export const SectionSchema = z
  .object({
    id: IdSchema,
    type: z.string().trim().min(1),
    name: z.string().trim().min(1),
    content: JsonObjectSchema.default({}),
    order: z.number().int().nonnegative(),
    settings: JsonObjectSchema.default({})
  })
  .strict();

export const PageSchema = z
  .object({
    id: IdSchema,
    name: z.string().trim().min(1),
    slug: z
      .string()
      .trim()
      .min(1)
      .regex(/^\/$|^\/?[a-z0-9]+(?:[-/][a-z0-9]+)*\/?$/),
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    sections: z.array(SectionSchema).default([])
  })
  .strict();

export const ThemeSchema = z
  .object({
    colors: z.record(z.string(), z.string().trim().min(1)),
    typography: z.record(z.string(), JsonValueSchema),
    spacing: z.record(z.string(), z.string().trim().min(1)),
    radius: z.record(z.string(), z.string().trim().min(1)),
    effects: JsonObjectSchema.default({})
  })
  .strict();

export const AssetTypeSchema = z.enum([
  "image",
  "video",
  "frame",
  "audio",
  "font",
  "other"
]);

export const AssetSchema = z
  .object({
    id: IdSchema,
    type: AssetTypeSchema,
    src: PathSchema,
    alt: z.string().trim().min(1).optional(),
    metadata: JsonObjectSchema.default({})
  })
  .strict();

export const FrameTargetSchema = z.enum(["desktop", "tablet", "mobile"]);
export const FrameFormatSchema = z.enum(["webp", "avif", "png", "jpg"]);

export const FrameSetSchema = z
  .object({
    id: IdSchema,
    target: FrameTargetSchema,
    frameCount: z.number().int().positive(),
    format: FrameFormatSchema,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    basePath: PathSchema,
    manifestPath: PathSchema
  })
  .strict();

export const PlaybackModeSchema = z.enum(["scroll", "scrub", "hybrid"]);

export const ReducedMotionFallbackSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }).strict(),
  z
    .object({
      type: z.literal("image"),
      src: PathSchema,
      alt: z.string().trim().min(1).optional()
    })
    .strict(),
  z
    .object({
      type: z.literal("video"),
      src: PathSchema,
      alt: z.string().trim().min(1).optional()
    })
    .strict()
]);

export const ScrollSceneSchema = z
  .object({
    id: IdSchema,
    name: z.string().trim().min(1),
    sourceVideo: PathSchema.nullable(),
    frameSets: z.array(FrameSetSchema).default([]),
    scrollLength: z.number().int().positive(),
    playbackMode: PlaybackModeSchema,
    reducedMotionFallback: ReducedMotionFallbackSchema
  })
  .strict();

export const ProviderTypeSchema = z.enum(["llm", "image", "video", "frame", "code"]);
export const ProviderModeSchema = z.enum(["local", "api"]);

export const ProviderConfigSchema = z
  .object({
    id: IdSchema,
    name: z.string().trim().min(1),
    type: ProviderTypeSchema,
    mode: ProviderModeSchema,
    enabled: z.boolean(),
    config: JsonObjectSchema.default({})
  })
  .strict();

export const AgentTypeSchema = z.enum(["prompt", "image", "video", "frame", "code"]);

export const AgentDefinitionSchema = z
  .object({
    id: IdSchema,
    name: z.string().trim().min(1),
    type: AgentTypeSchema,
    providerId: IdSchema,
    description: z.string().trim().min(1)
  })
  .strict();

export const AgentJobStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
]);

export const AgentJobErrorSchema = z
  .object({
    message: z.string().trim().min(1),
    code: z.string().trim().min(1).optional(),
    details: JsonValueSchema.optional()
  })
  .strict();

export const AgentJobSchema = z
  .object({
    id: IdSchema,
    agentId: IdSchema,
    status: AgentJobStatusSchema,
    input: JsonValueSchema.default({}),
    output: JsonValueSchema.nullable().optional(),
    error: AgentJobErrorSchema.nullable().optional(),
    startedAt: DateTimeSchema.nullable().optional(),
    completedAt: DateTimeSchema.nullable().optional()
  })
  .strict();

export const ExportFormatSchema = z.enum(["static", "next", "react"]);

export const ExportSettingsSchema = z
  .object({
    format: ExportFormatSchema,
    includeProjectJson: z.boolean(),
    minify: z.boolean(),
    outputDir: PathSchema
  })
  .strict();

export const Scroll3DProjectSchema = z
  .object({
    id: IdSchema,
    name: z.string().trim().min(1),
    version: z.string().trim().min(1),
    mode: ProjectModeSchema,
    theme: ThemeSchema,
    pages: z.array(PageSchema),
    assets: z.array(AssetSchema),
    scene: ScrollSceneSchema,
    providers: z.array(ProviderConfigSchema),
    agents: z.array(AgentDefinitionSchema),
    exportSettings: ExportSettingsSchema,
    createdAt: DateTimeSchema,
    updatedAt: DateTimeSchema
  })
  .strict()
  .superRefine((project, context) => {
    if (Date.parse(project.updatedAt) < Date.parse(project.createdAt)) {
      context.addIssue({
        code: "custom",
        message: "updatedAt must be greater than or equal to createdAt",
        path: ["updatedAt"]
      });
    }
  });
