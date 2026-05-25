import type { Scroll3DProject } from "@scroll3d/core";
import type { CssExportOptions } from "./types";
import { sanitizeCssIdentifier, sanitizeCssValue } from "./sanitize";

export function generateCss(
  project: Scroll3DProject,
  options: CssExportOptions,
  minify: boolean
): string {
  const css = `${options.reset ? generateResetCss() : ""}
${options.themeVariables ? generateThemeVariables(project) : ""}
${generateLayoutCss()}
${options.responsive ? generateResponsiveCss() : ""}
${options.reducedMotion ? generateReducedMotionCss() : ""}`;

  return minify ? minifyCss(css) : css.trim();
}

function generateResetCss(): string {
  return `*,*::before,*::after{box-sizing:border-box}html,body{margin:0;min-height:100%;}body{font-family:var(--scroll3d-font-body);background:var(--scroll3d-color-background);color:var(--scroll3d-color-foreground);}`;
}

function generateThemeVariables(project: Scroll3DProject): string {
  const variables: string[] = [];

  for (const [key, value] of Object.entries(project.theme.colors)) {
    const safeValue = sanitizeCssValue(value);

    if (safeValue) {
      variables.push(`--scroll3d-color-${sanitizeCssIdentifier(key)}:${safeValue};`);
    }
  }

  for (const [key, value] of Object.entries(project.theme.spacing)) {
    const safeValue = sanitizeCssValue(value);

    if (safeValue) {
      variables.push(`--scroll3d-space-${sanitizeCssIdentifier(key)}:${safeValue};`);
    }
  }

  for (const [key, value] of Object.entries(project.theme.radius)) {
    const safeValue = sanitizeCssValue(value);

    if (safeValue) {
      variables.push(`--scroll3d-radius-${sanitizeCssIdentifier(key)}:${safeValue};`);
    }
  }

  const fontFamily = sanitizeCssValue(
    getTypographyString(project.theme.typography.fontFamily)
  );
  const headingFontFamily = sanitizeCssValue(
    getTypographyString(project.theme.typography.headingFontFamily)
  );

  variables.push(
    `--scroll3d-font-body:${fontFamily ?? "ui-sans-serif,system-ui,sans-serif"};`
  );
  variables.push(
    `--scroll3d-font-heading:${headingFontFamily ?? "ui-sans-serif,system-ui,sans-serif"};`
  );

  return `:root{${variables.join("")}}`;
}

function generateLayoutCss(): string {
  return `.scroll3d-site{position:relative;min-height:600vh;overflow-x:hidden}.scroll3d-scene{position:sticky;top:0;width:100%;height:100vh;overflow:hidden;background:var(--scroll3d-color-background,#08090d)}.scroll3d-canvas,.scroll3d-reduced-motion{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.scroll3d-reduced-motion{display:none}.scroll3d-overlays{position:relative;z-index:2}.scroll3d-section{min-height:100vh;display:grid;align-items:center;padding:var(--scroll3d-space-section,8rem) max(24px,8vw)}.scroll3d-section-inner{width:min(760px,100%)}.scroll3d-section-kicker{margin:0 0 12px;color:var(--scroll3d-color-accent,var(--scroll3d-color-primary,#42d6a4));font-weight:700;text-transform:uppercase;letter-spacing:0}h1,h2,h3{font-family:var(--scroll3d-font-heading);letter-spacing:0}.scroll3d-section h2{margin:0;color:var(--scroll3d-color-foreground,#f6f7fb);font-size:clamp(2.25rem,7vw,6rem);line-height:1}.scroll3d-section-content{margin-top:24px;color:var(--scroll3d-color-muted,#a3a8b8);font-size:clamp(1rem,2vw,1.25rem);line-height:1.6}.scroll3d-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.scroll3d-actions a{border:1px solid color-mix(in srgb,var(--scroll3d-color-foreground,#fff),transparent 72%);border-radius:var(--scroll3d-radius-md,8px);padding:10px 14px;color:var(--scroll3d-color-foreground,#fff);text-decoration:none;background:rgba(18,21,29,.72)}.scroll3d-noscript{width:100%;height:auto}`;
}

function generateResponsiveCss(): string {
  return `@media (max-width:767px){.scroll3d-section{padding:96px 20px}.scroll3d-section h2{font-size:clamp(2rem,14vw,4rem)}}`;
}

function generateReducedMotionCss(): string {
  return `@media (prefers-reduced-motion:reduce){.scroll3d-site{min-height:auto}.scroll3d-scene{position:relative}.scroll3d-canvas{display:none}.scroll3d-reduced-motion{display:block;position:relative}.scroll3d-section{min-height:auto}}`;
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTypographyString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
