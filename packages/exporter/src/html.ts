import type { Page, Scroll3DProject, Section } from "@scroll3d/core";
import type { StaticExporterConfig } from "./types";
import { escapeAttribute, escapeHtml } from "./sanitize";

export function generateHtml(
  project: Scroll3DProject,
  config: StaticExporterConfig
): string {
  const page = getPrimaryPage(project);
  const title = config.html.title ?? page.title ?? project.name;
  const description =
    config.html.description ??
    page.description ??
    `${project.name} exported with Scroll3D.`;
  const sections = [...page.sections].sort((left, right) => left.order - right.order);
  const scriptTag =
    config.runtimeMode === "external"
      ? '<script src="scroll-engine.js" defer></script>'
      : `<script>${escapeInlineScriptMarker(generateInlineRuntimeNotice())}</script>`;
  const creditsComment = config.html.includeCreditsComment
    ? "\n<!-- Creator: Siddhartha Abhimanyu -->"
    : "";

  return compactHtml(
    `<!doctype html>
<html lang="${escapeAttribute(config.html.lang)}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="${escapeAttribute(config.html.viewport)}">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttribute(description)}">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>${creditsComment}
    <main id="scroll3d-site" class="scroll3d-site" data-project-id="${escapeAttribute(project.id)}">
      <div class="scroll3d-scene" aria-label="${escapeAttribute(project.scene.name)}">
        <canvas id="scroll3d-canvas" class="scroll3d-canvas" width="1920" height="1080" aria-label="${escapeAttribute(project.scene.name)}"></canvas>
        ${renderReducedMotionFallback(project)}
      </div>
      <div class="scroll3d-overlays">
        ${sections.map(renderSection).join("\n        ")}
      </div>
    </main>
    ${config.html.includeNoscript ? renderNoScript(project) : ""}
    ${scriptTag}
  </body>
</html>`,
    config.minify
  );
}

function getPrimaryPage(project: Scroll3DProject): Page {
  const page = project.pages[0];

  if (!page) {
    throw new Error("Static export requires at least one page.");
  }

  return page;
}

function renderSection(section: Section): string {
  const heading = getSectionHeading(section);
  const body = getSectionBody(section);
  const actions = getSectionActions(section);

  return `<section id="${escapeAttribute(section.id)}" class="scroll3d-section scroll3d-section-${escapeAttribute(section.type)}" data-section-type="${escapeAttribute(section.type)}">
  <div class="scroll3d-section-inner">
    <p class="scroll3d-section-kicker">${escapeHtml(section.name)}</p>
    <h2>${escapeHtml(heading)}</h2>
    ${body ? `<div class="scroll3d-section-content">${body}</div>` : ""}
    ${actions}
  </div>
</section>`;
}

function renderReducedMotionFallback(project: Scroll3DProject): string {
  const fallback = project.scene.reducedMotionFallback;

  if (fallback.type !== "image") {
    return "";
  }

  return `<img class="scroll3d-reduced-motion" src="${escapeAttribute(fallback.src)}" alt="${escapeAttribute(fallback.alt ?? "Reduced motion scene fallback")}">`;
}

function renderNoScript(project: Scroll3DProject): string {
  const fallback = project.scene.reducedMotionFallback;

  if (fallback.type === "image") {
    return `<noscript><img class="scroll3d-noscript" src="${escapeAttribute(fallback.src)}" alt="${escapeAttribute(fallback.alt ?? "Static Scroll3D fallback")}"></noscript>`;
  }

  return "<noscript><p>This Scroll3D export uses JavaScript for scroll playback.</p></noscript>";
}

function getSectionHeading(section: Section): string {
  const headline = section.content.headline;

  if (typeof headline === "string") {
    return headline;
  }

  return section.name;
}

function getSectionBody(section: Section): string {
  const parts: string[] = [];
  const subheadline = section.content.subheadline;
  const items = section.content.items;
  const plans = section.content.plans;

  if (typeof subheadline === "string") {
    parts.push(`<p>${escapeHtml(subheadline)}</p>`);
  }

  if (Array.isArray(items)) {
    parts.push(
      `<ul>${items
        .map((item) =>
          typeof item === "string"
            ? `<li>${escapeHtml(item)}</li>`
            : `<li>${escapeHtml(JSON.stringify(item))}</li>`
        )
        .join("")}</ul>`
    );
  }

  if (Array.isArray(plans)) {
    parts.push(
      `<div class="scroll3d-plans">${plans
        .map((plan) => `<article>${escapeHtml(getUnknownRecordTitle(plan))}</article>`)
        .join("")}</div>`
    );
  }

  return parts.join("");
}

function getSectionActions(section: Section): string {
  const primaryAction = section.content.primaryAction;
  const secondaryAction = section.content.secondaryAction;
  const actions = [primaryAction, secondaryAction].filter(
    (action): action is string => typeof action === "string"
  );

  if (actions.length === 0) {
    return "";
  }

  return `<div class="scroll3d-actions">${actions
    .map(
      (action) => `<a href="#${escapeAttribute(section.id)}">${escapeHtml(action)}</a>`
    )
    .join("")}</div>`;
}

function getUnknownRecordTitle(value: unknown): string {
  if (value && typeof value === "object" && "name" in value) {
    return String(value.name);
  }

  return JSON.stringify(value);
}

function compactHtml(html: string, minify: boolean): string {
  if (!minify) {
    return html;
  }

  return html
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

function generateInlineRuntimeNotice(): string {
  return "console.info('Scroll3D inline runtime placeholder. Use external runtime for playback.');";
}

function escapeInlineScriptMarker(script: string): string {
  return script.replaceAll("</script", "<\\/script");
}
