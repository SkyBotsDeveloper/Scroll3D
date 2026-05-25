import type { Scroll3DProject } from "@scroll3d/core";
import {
  exportStaticProjectToBundle,
  type ExportResult,
  type StaticExportBundle,
  type StaticExportFile
} from "@scroll3d/exporter/browser";
import { createExportableProject } from "./editor-state";

const textMimePrefixes = ["text/", "application/json"];
const previewLimit = 16000;

export interface FilePreview {
  path: string;
  mimeType: string;
  size: number;
  text: string;
  truncated: boolean;
  supported: boolean;
}

export function exportProjectToBundle(project: Scroll3DProject): ExportResult {
  return exportStaticProjectToBundle(createExportableProject(project), {
    includeProjectJson: true,
    includeReadme: true,
    minify: false,
    runtimeMode: "external",
    assetMode: "reference",
    frameMode: "reference",
    html: {
      lang: "en",
      viewport: "width=device-width, initial-scale=1",
      includeNoscript: true,
      includeCreditsComment: false
    },
    css: {
      reset: true,
      responsive: true,
      reducedMotion: true,
      themeVariables: true
    },
    javascript: {
      moduleFormat: "iife",
      includeScrollEngineGlue: true,
      exposeGlobal: false
    }
  });
}

export function getBundleFile(
  bundle: StaticExportBundle | undefined,
  filePath: string | undefined
): StaticExportFile | undefined {
  if (!bundle || !filePath) {
    return undefined;
  }

  return bundle.files.find((file) => file.path === filePath);
}

export function createFilePreview(
  file: StaticExportFile | undefined,
  maxLength = previewLimit
): FilePreview | undefined {
  if (!file) {
    return undefined;
  }

  const supported = isTextFile(file);
  const text = supported
    ? truncateText(file.content, maxLength)
    : "Binary or unsupported file preview.";

  return {
    path: file.path,
    mimeType: file.mimeType,
    size: file.size ?? new TextEncoder().encode(file.content).byteLength,
    text,
    truncated: supported && file.content.length > maxLength,
    supported
  };
}

export function createPreviewSrcDoc(bundle: StaticExportBundle | undefined): string {
  const html = getBundleFile(bundle, "index.html")?.content;
  const css = getBundleFile(bundle, "styles.css")?.content;

  if (!html) {
    return "<!doctype html><html><body><p>No preview available.</p></body></html>";
  }

  const withoutScript = html.replaceAll(
    /<script\b[^>]*src=["']scroll-engine\.js["'][^>]*><\/script>/gi,
    ""
  );
  const withInlineCss = css
    ? withoutScript.replaceAll(
        /<link\b[^>]*href=["']styles\.css["'][^>]*>/gi,
        `<style>${css}</style>`
      )
    : withoutScript;

  return withInlineCss.replace(
    "</body>",
    `<aside style="position:fixed;left:12px;bottom:12px;z-index:10000;max-width:320px;border:1px solid rgba(255,255,255,.24);border-radius:8px;background:rgba(8,9,13,.86);color:#f6f7fb;padding:10px 12px;font:12px system-ui,sans-serif;">Preview iframe: generated scripts are disabled in this sandbox.</aside></body>`
  );
}

export function getDefaultSelectedFile(bundle: StaticExportBundle | undefined): string {
  return bundle?.files[0]?.path ?? "";
}

function isTextFile(file: StaticExportFile): boolean {
  return (
    textMimePrefixes.some((prefix) => file.mimeType.startsWith(prefix)) ||
    file.path.endsWith(".js") ||
    file.path.endsWith(".css") ||
    file.path.endsWith(".md")
  );
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n\n/* Preview truncated. */`;
}
