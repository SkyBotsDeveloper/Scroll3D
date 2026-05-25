import JSZip from "jszip";
import { createExportWarning } from "./errors";
import { sanitizeFilePath } from "./sanitize";
import type {
  BrowserZipExportConfig,
  BrowserZipExportResult,
  ExportWarning,
  StaticExportBundle
} from "./types";

const defaultBrowserZipConfig: BrowserZipExportConfig = {
  filename: "scroll3d-export.zip",
  compressionLevel: 6,
  includeDirectoryRoot: false
};

type ResolvedBrowserZipExportConfig = BrowserZipExportConfig & {
  filename: string;
  compressionLevel: number;
  includeDirectoryRoot: boolean;
};

export async function createBrowserZipFromBundle(
  bundle: StaticExportBundle,
  config: Partial<BrowserZipExportConfig> = {}
): Promise<BrowserZipExportResult> {
  const resolvedConfig = resolveBrowserZipConfig(config);
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

    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: resolvedConfig.compressionLevel
      }
    });

    return {
      success: true,
      filename: resolvedConfig.filename,
      blob,
      bytes: blob.size,
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
          "browser-zip-export-failed",
          error instanceof Error ? error.message : "Browser ZIP export failed.",
          "error"
        )
      ]
    };
  }
}

function resolveBrowserZipConfig(
  config: Partial<BrowserZipExportConfig>
): ResolvedBrowserZipExportConfig {
  const filename = normalizeZipFilename(
    config.filename ?? defaultBrowserZipConfig.filename
  );
  const compressionLevel = clampCompressionLevel(
    config.compressionLevel ?? defaultBrowserZipConfig.compressionLevel ?? 6
  );

  return {
    ...defaultBrowserZipConfig,
    ...config,
    filename,
    compressionLevel
  };
}

function normalizeZipFilename(filename: string): string {
  const basename = filename.trim().replaceAll("\\", "/").split("/").at(-1) ?? "";
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
