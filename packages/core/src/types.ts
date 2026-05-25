import type { z } from "zod";
import type {
  AgentDefinitionSchema,
  AgentJobErrorSchema,
  AgentJobSchema,
  AgentJobStatusSchema,
  AgentTypeSchema,
  AssetSchema,
  AssetTypeSchema,
  ExportFormatSchema,
  ExportSettingsSchema,
  FrameFormatSchema,
  FrameSetSchema,
  FrameTargetSchema,
  PageSchema,
  PlaybackModeSchema,
  ProjectModeSchema,
  ProviderConfigSchema,
  ProviderModeSchema,
  ProviderTypeSchema,
  ReducedMotionFallbackSchema,
  Scroll3DProjectSchema,
  ScrollSceneSchema,
  SectionSchema,
  ThemeSchema
} from "./schemas";

export type ProjectMode = z.infer<typeof ProjectModeSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type AssetType = z.infer<typeof AssetTypeSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type FrameTarget = z.infer<typeof FrameTargetSchema>;
export type FrameFormat = z.infer<typeof FrameFormatSchema>;
export type FrameSet = z.infer<typeof FrameSetSchema>;
export type PlaybackMode = z.infer<typeof PlaybackModeSchema>;
export type ReducedMotionFallback = z.infer<typeof ReducedMotionFallbackSchema>;
export type ScrollScene = z.infer<typeof ScrollSceneSchema>;
export type ProviderType = z.infer<typeof ProviderTypeSchema>;
export type ProviderMode = z.infer<typeof ProviderModeSchema>;
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;
export type AgentType = z.infer<typeof AgentTypeSchema>;
export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;
export type AgentJobStatus = z.infer<typeof AgentJobStatusSchema>;
export type AgentJobError = z.infer<typeof AgentJobErrorSchema>;
export type AgentJob = z.infer<typeof AgentJobSchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type ExportSettings = z.infer<typeof ExportSettingsSchema>;
export type Scroll3DProject = z.infer<typeof Scroll3DProjectSchema>;
