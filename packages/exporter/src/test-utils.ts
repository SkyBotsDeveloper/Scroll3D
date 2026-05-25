import type { StaticExporterConfig } from "./types";

export function getDefaultTestConfig(): StaticExporterConfig {
  return {
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
}
