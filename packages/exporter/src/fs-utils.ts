import { constants } from "node:fs";
import { access, mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { sanitizeFilePath } from "./sanitize";
import type { DiskExportConfig, StaticExportFile, WriteFileResult } from "./types";

export const defaultDiskExportConfig: Omit<DiskExportConfig, "outputDir"> = {
  cleanOutputDir: false,
  overwrite: true,
  dryRun: false,
  preserveExisting: false,
  includeDotfiles: false
};

export async function ensureOutputDir(
  outputDir: string,
  options: Partial<DiskExportConfig> = {}
): Promise<string> {
  const resolvedOutputDir = path.resolve(outputDir);
  const config = {
    ...defaultDiskExportConfig,
    ...options,
    outputDir: resolvedOutputDir
  };

  if (config.cleanOutputDir && !config.dryRun) {
    await cleanOutputDirSafe(resolvedOutputDir);
  }

  if (!config.dryRun) {
    await mkdir(resolvedOutputDir, { recursive: true });
  }

  return resolvedOutputDir;
}

export async function cleanOutputDirSafe(outputDir: string): Promise<void> {
  const resolvedOutputDir = path.resolve(outputDir);
  const root = path.parse(resolvedOutputDir).root;

  if (
    resolvedOutputDir === root ||
    resolvedOutputDir === process.cwd() ||
    path.relative(resolvedOutputDir, process.cwd()) === ""
  ) {
    throw new Error(`Refusing to clean unsafe output directory: ${outputDir}`);
  }

  await rm(resolvedOutputDir, { recursive: true, force: true });
  await mkdir(resolvedOutputDir, { recursive: true });
}

export function resolveSafeOutputPath(outputDir: string, relativePath: string): string {
  const safeRelativePath = sanitizeFilePath(relativePath);
  const resolvedOutputDir = path.resolve(outputDir);
  const resolvedFilePath = path.resolve(resolvedOutputDir, safeRelativePath);

  if (!isPathInside(resolvedOutputDir, resolvedFilePath)) {
    throw new Error(`Unsafe output path escaped export directory: ${relativePath}`);
  }

  return resolvedFilePath;
}

export async function writeExportFile(
  file: StaticExportFile,
  outputDir: string,
  options: Partial<DiskExportConfig> = {}
): Promise<WriteFileResult> {
  const config = {
    ...defaultDiskExportConfig,
    ...options,
    outputDir
  };
  const outputPath = resolveSafeOutputPath(outputDir, file.path);
  const byteLength = Buffer.byteLength(file.content, file.encoding);

  if (!config.includeDotfiles && hasDotfileSegment(file.path)) {
    return {
      path: outputPath,
      bytesWritten: 0,
      skipped: true,
      reason: "dotfiles-disabled"
    };
  }

  if (config.dryRun) {
    return {
      path: outputPath,
      bytesWritten: 0,
      skipped: true,
      reason: "dry-run"
    };
  }

  const exists = await pathExists(outputPath);

  if (exists && (config.preserveExisting || !config.overwrite)) {
    return {
      path: outputPath,
      bytesWritten: 0,
      skipped: true,
      reason: config.preserveExisting ? "preserve-existing" : "overwrite-disabled"
    };
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, file.content, { encoding: file.encoding });

  return {
    path: outputPath,
    bytesWritten: byteLength,
    skipped: false
  };
}

export async function getFileSize(filePath: string): Promise<number | undefined> {
  try {
    const fileStat = await stat(filePath);

    return fileStat.isFile() ? fileStat.size : undefined;
  } catch {
    return undefined;
  }
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}

function isPathInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);

  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function hasDotfileSegment(filePath: string): boolean {
  return filePath
    .replaceAll("\\", "/")
    .split("/")
    .some((segment) => segment.startsWith("."));
}
