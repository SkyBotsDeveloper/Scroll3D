import { z } from "zod";

export const WebsitePlanSchema = z.object({
  title: z.string().min(1),
  sections: z.array(
    z.object({
      type: z.string().min(1),
      name: z.string().min(1)
    })
  ),
  visualPrompt: z.string().min(1),
  motionPrompt: z.string().min(1),
  sourcePrompt: z.string().min(1)
});

export type WebsitePlan = z.infer<typeof WebsitePlanSchema>;

export const PromptUnderstandingInputSchema = z.object({
  prompt: z.string().min(1)
});

export type PromptUnderstandingInput = z.infer<typeof PromptUnderstandingInputSchema>;

const ProviderArtifactSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["image", "video", "frame-manifest", "code", "json", "other"]),
  path: z.string().min(1),
  metadata: z.record(z.string(), z.unknown())
});

export const ImageGenerationInputSchema = z.object({
  visualPrompt: z.string().min(1)
});

export type ImageGenerationInput = z.infer<typeof ImageGenerationInputSchema>;

export const ImageAgentOutputSchema = z.object({
  image: ProviderArtifactSchema,
  visualPrompt: z.string().min(1)
});

export type ImageAgentOutput = z.infer<typeof ImageAgentOutputSchema>;

export const VideoGenerationInputSchema = z.object({
  image: ProviderArtifactSchema,
  motionPrompt: z.string().min(1)
});

export type VideoGenerationInput = z.infer<typeof VideoGenerationInputSchema>;

export const VideoAgentOutputSchema = z.object({
  video: ProviderArtifactSchema,
  motionPrompt: z.string().min(1)
});

export type VideoAgentOutput = z.infer<typeof VideoAgentOutputSchema>;

export const FrameExtractionInputSchema = z.object({
  video: ProviderArtifactSchema
});

export type FrameExtractionInput = z.infer<typeof FrameExtractionInputSchema>;

const FrameSetSchema = z.object({
  id: z.string().min(1),
  target: z.enum(["desktop", "tablet", "mobile"]),
  frameCount: z.number().int().positive(),
  format: z.enum(["webp", "avif", "png", "jpg"]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  basePath: z.string().min(1),
  manifestPath: z.string().min(1)
});

export const FrameAgentOutputSchema = z.object({
  manifest: ProviderArtifactSchema,
  frameSets: z.array(FrameSetSchema)
});

export type FrameAgentOutput = z.infer<typeof FrameAgentOutputSchema>;

export const WebsiteCompilationInputSchema = z.object({
  plan: WebsitePlanSchema,
  frameManifest: FrameAgentOutputSchema
});

export type WebsiteCompilationInput = z.infer<typeof WebsiteCompilationInputSchema>;

export const WebsiteCompilationOutputSchema = z.object({
  project: z.unknown(),
  compilationPlan: z.object({
    entrypoint: z.string().min(1),
    files: z.array(z.string().min(1))
  }),
  codeArtifactId: z.string().min(1)
});

export type WebsiteCompilationOutput = z.infer<typeof WebsiteCompilationOutputSchema>;
