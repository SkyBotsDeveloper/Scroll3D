import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { createExportWarning } from "./errors";
import { sanitizeFilePath } from "./sanitize";
import type {
  ExportWarning,
  StaticExportBundle,
  ZipExportConfig,
  ZipExportResult
} from "./types";

const defaultZipExportConfig: ZipExportConfig = {
  filename: "scroll3d-export.zip",
  compressionLevel: 6,
  includeDirectoryRoot: false
};

type ResolvedZipExportConfig = ZipExportConfig & {
  filename: string;
  compressionLevel: number;
  includeDirectoryRoot: boolean;
};

export async function createZipFromBundle(
  bundle: StaticExportBundle,
  config: Partial<ZipExportConfig> = {}
): Promise<ZipExportResult> {
  const resolvedConfig = resolveZipConfig(config);
  const warnings: ExportWarning[] = [...bundle.warnings];

  try {
    const zip = new JSZip();
    const root = resolvedConfig.includeDirectoryRoot
      ? `${sanitizeFilePath(
          resolvedConfig.rootDirectoryName ?? stripZipExtension(resolvedConfig.filename)
        )}/`
      : "";

    for (const file of bundle.files) {
      zip.file(`${root}${sanitizeFilePath(file.path)}`, file.content);
    }

    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: resolvedConfig.compressionLevel
      }
    });

    return {
      success: true,
      filename: resolvedConfig.filename,
      buffer,
      bytes: buffer.byteLength,
      warnings,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      filename: resolvedConfig.filename,
      bytes: 0,
      warnings,
      errors: [
        createExportWarning(
          "zip-export-failed",
          error instanceof Error ? error.message : "ZIP export failed.",
          "error"
        )
      ]
    };
  }
}

export async function writeZipFromBundle(
  bundle: StaticExportBundle,
  config: Partial<ZipExportConfig> & { outputPath: string }
): Promise<ZipExportResult> {
  const result = await createZipFromBundle(bundle, config);

  if (!result.success || !result.buffer) {
    return result;
  }

  try {
    const outputPath = resolveSafeZipOutputPath(config.outputPath);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, result.buffer);

    return {
      ...result,
      outputPath
    };
  } catch (error) {
    return {
      ...result,
      success: false,
      errors: [
        ...result.errors,
        createExportWarning(
          "zip-write-failed",
          error instanceof Error ? error.message : "ZIP write failed.",
          "error"
        )
      ]
    };
  }
}

function resolveZipConfig(config: Partial<ZipExportConfig>): ResolvedZipExportConfig {
  const filename = normalizeZipFilename(
    config.filename ?? defaultZipExportConfig.filename
  );
  const compressionLevel = clampCompressionLevel(
    config.compressionLevel ?? defaultZipExportConfig.compressionLevel ?? 6
  );

  return {
    ...defaultZipExportConfig,
    ...config,
    filename,
    compressionLevel
  };
}

function normalizeZipFilename(filename: string): string {
  const basename = path.posix.basename(filename.trim().replaceAll("\\", "/"));
  const safeName = sanitizeFilePath(basename || "scroll3d-export.zip");

  return safeName.toLowerCase().endsWith(".zip") ? safeName : `${safeName}.zip`;
}

function stripZipExtension(filename: string): string {
  return filename.replace(/\.zip$/i, "") || "scroll3d-export";
}

function clampCompressionLevel(level: number): number {
  if (!Number.isFinite(level)) {
    return 6;
  }

  return Math.min(9, Math.max(0, Math.trunc(level)));
}

function resolveSafeZipOutputPath(outputPath: string): string {
  const normalized = outputPath.trim().replaceAll("\\", "/");

  if (
    normalized.length === 0 ||
    normalized.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    throw new Error(`Unsafe ZIP output path: ${outputPath}`);
  }

  return path.resolve(outputPath);
}
