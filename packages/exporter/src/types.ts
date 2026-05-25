import type { Scroll3DProject } from "@scroll3d/core";
import type { FrameManifest } from "@scroll3d/scroll-engine";

export type ExportFormat = "static" | "next" | "react";
export type StaticExportEncoding = "utf8";
export type RuntimeMode = "inline" | "external";
export type AssetMode = "reference" | "copy-placeholder";
export type FrameMode = "reference" | "manifest-only";
export type ExportWarningSeverity = "info" | "warning" | "error";
export type CopyPlanEntryKind =
  | "asset"
  | "frame"
  | "manifest"
  | "runtime"
  | "project"
  | "readme"
  | "other";
export type CopyPlanEntryAction = "copy" | "reference" | "skip" | "warn";
export type StaticExportTarget = "bundle" | "directory" | "zip";

export interface StaticExportFile {
  path: string;
  content: string;
  encoding: StaticExportEncoding;
  mimeType: string;
  size?: number;
}

export interface StaticExportBundle {
  id: string;
  projectId: string;
  format: ExportFormat;
  files: StaticExportFile[];
  warnings: ExportWarning[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface StaticExporterConfig {
  includeProjectJson: boolean;
  includeReadme: boolean;
  minify: boolean;
  outputDir?: string;
  runtimeMode: RuntimeMode;
  assetMode: AssetMode;
  frameMode: FrameMode;
  html: HtmlExportOptions;
  css: CssExportOptions;
  javascript: JavaScriptExportOptions;
}

export interface HtmlExportOptions {
  lang: string;
  title?: string;
  description?: string;
  viewport: string;
  includeNoscript: boolean;
  includeCreditsComment: boolean;
}

export interface CssExportOptions {
  reset: boolean;
  responsive: boolean;
  reducedMotion: boolean;
  themeVariables: boolean;
}

export interface JavaScriptExportOptions {
  moduleFormat: "iife" | "esm";
  includeScrollEngineGlue: boolean;
  exposeGlobal: boolean;
}

export interface ExportWarning {
  code: string;
  message: string;
  path?: string;
  severity: ExportWarningSeverity;
}

export interface ExportResult {
  success: boolean;
  bundle?: StaticExportBundle;
  errors: ExportWarning[];
  warnings: ExportWarning[];
}

export interface DiskExportConfig {
  outputDir: string;
  cleanOutputDir: boolean;
  overwrite: boolean;
  dryRun: boolean;
  preserveExisting: boolean;
  includeDotfiles: boolean;
}

export interface ZipExportConfig {
  filename: string;
  compressionLevel?: number;
  includeDirectoryRoot: boolean;
  rootDirectoryName?: string;
  outputPath?: string;
}

export interface CopyPlan {
  id: string;
  entries: CopyPlanEntry[];
  warnings: ExportWarning[];
  createdAt: string;
}

export interface CopyPlanEntry {
  sourcePath: string;
  destinationPath: string;
  kind: CopyPlanEntryKind;
  required: boolean;
  exists?: boolean;
  size?: number;
  action: CopyPlanEntryAction;
}

export interface CopyPlanOptions {
  assetMode: AssetMode;
  frameMode: FrameMode;
  includeBundleFiles: boolean;
}

export interface WriteFileResult {
  path: string;
  bytesWritten: number;
  skipped: boolean;
  reason?: string;
}

export interface DiskExportResult {
  success: boolean;
  outputDir: string;
  files: WriteFileResult[];
  copyPlan: CopyPlan;
  warnings: ExportWarning[];
  errors: ExportWarning[];
}

export interface ZipExportResult {
  success: boolean;
  filename: string;
  buffer?: Buffer;
  outputPath?: string;
  bytes: number;
  warnings: ExportWarning[];
  errors: ExportWarning[];
}

export interface RunStaticExportOptions {
  target: string;
  staticConfig?: Partial<StaticExporterConfig>;
  diskConfig?: Partial<DiskExportConfig>;
  zipConfig?: Partial<ZipExportConfig>;
  outputDir?: string;
  zipPath?: string;
  dryRun?: boolean;
}

export interface RunStaticExportResult {
  success: boolean;
  target: string;
  bundleResult?: ExportResult;
  diskResult?: DiskExportResult;
  zipResult?: ZipExportResult;
  warnings: ExportWarning[];
  errors: ExportWarning[];
}

export interface AssetManifestEntry {
  id: string;
  type: string;
  src: string;
  alt?: string;
  metadata: Record<string, unknown>;
  mode: AssetMode;
}

export interface AssetManifest {
  projectId: string;
  mode: AssetMode;
  assets: AssetManifestEntry[];
  notes: string[];
}

export interface StaticExporter {
  export(project: unknown): ExportResult;
}

export interface StaticExportContext {
  project: Scroll3DProject;
  config: StaticExporterConfig;
  frameManifest: FrameManifest;
  warnings: ExportWarning[];
}
