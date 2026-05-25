import { parseProject } from "@scroll3d/core";
import { createAssetManifest } from "./assets";
import { generateCss } from "./css";
import { createExportWarning } from "./errors";
import { createFrameManifest, generateFrameManifestJson } from "./frame-manifest";
import { generateHtml } from "./html";
import { generateJavaScript } from "./javascript";
import { generateProjectJson } from "./project-json";
import { sanitizeFilePath, safeJsonStringify } from "./sanitize";
import type {
  ExportResult,
  StaticExportBundle,
  StaticExportFile,
  StaticExporter,
  StaticExporterConfig,
  ExportWarning
} from "./types";

const defaultConfig: StaticExporterConfig = {
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
};

export class StaticProjectExporter implements StaticExporter {
  private readonly config: StaticExporterConfig;

  constructor(config: Partial<StaticExporterConfig> = {}) {
    this.config = mergeConfig(defaultConfig, config);
  }

  export(input: unknown): ExportResult {
    const warnings: ExportWarning[] = [];

    try {
      const project = parseProject(input);
      const frameManifest = createFrameManifest(project);
      const assetManifest = createAssetManifest(
        project,
        this.config.assetMode,
        warnings
      );
      const files: StaticExportFile[] = [
        createTextFile(
          "index.html",
          generateHtml(project, this.config),
          "text/html; charset=utf-8"
        ),
        createTextFile(
          "styles.css",
          generateCss(project, this.config.css, this.config.minify),
          "text/css; charset=utf-8"
        ),
        createTextFile(
          "scroll-engine.js",
          generateJavaScript(project, this.config.javascript, this.config.minify),
          "text/javascript; charset=utf-8"
        ),
        createTextFile(
          "frame-manifest.json",
          generateFrameManifestJson(project),
          "application/json; charset=utf-8"
        ),
        createTextFile(
          "assets/manifest.json",
          safeJsonStringify(assetManifest),
          "application/json; charset=utf-8"
        )
      ];

      if (this.config.includeProjectJson) {
        files.push(
          createTextFile(
            "project.json",
            generateProjectJson(project),
            "application/json; charset=utf-8"
          )
        );
      }

      if (this.config.includeReadme) {
        files.push(
          createTextFile("README.md", generateExportReadme(project.id), "text/markdown")
        );
      }

      const bundle: StaticExportBundle = {
        id: `export_${project.id}_${String(Date.now())}`,
        projectId: project.id,
        format: "static",
        files,
        warnings,
        metadata: {
          outputDir: this.config.outputDir ?? project.exportSettings.outputDir,
          runtimeMode: this.config.runtimeMode,
          assetMode: this.config.assetMode,
          frameMode: this.config.frameMode,
          frameSetCount: frameManifest.frameSets.length,
          assetCount: assetManifest.assets.length
        },
        createdAt: new Date().toISOString()
      };

      return {
        success: true,
        bundle,
        errors: [],
        warnings
      };
    } catch (error) {
      const warning = createExportWarning(
        "export-failed",
        error instanceof Error ? error.message : "Static export failed.",
        "error"
      );

      return {
        success: false,
        errors: [warning],
        warnings
      };
    }
  }
}

function mergeConfig(
  base: StaticExporterConfig,
  override: Partial<StaticExporterConfig>
): StaticExporterConfig {
  return {
    ...base,
    ...override,
    html: {
      ...base.html,
      ...override.html
    },
    css: {
      ...base.css,
      ...override.css
    },
    javascript: {
      ...base.javascript,
      ...override.javascript
    }
  };
}

function createTextFile(
  path: string,
  content: string,
  mimeType: string
): StaticExportFile {
  const safePath = sanitizeFilePath(path);

  return {
    path: safePath,
    content,
    encoding: "utf8",
    mimeType,
    size: new TextEncoder().encode(content).byteLength
  };
}

function generateExportReadme(projectId: string): string {
  return `# Scroll3D Static Export

Project ID: ${projectId}

This folder is a static website export structure. It is intended to run from
ordinary static hosting with no backend.

Files:

- index.html
- styles.css
- scroll-engine.js
- frame-manifest.json
- project.json, when included
- assets/manifest.json

Frame and asset files are referenced by path in this phase. Binary copying is
planned for a later phase. ZIP packaging can be produced by the exporter APIs.
`;
}
