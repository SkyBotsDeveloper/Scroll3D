import type { Scroll3DProject } from "@scroll3d/core";
import type { JavaScriptExportOptions } from "./types";
import { safeJsonStringify } from "./sanitize";

export function generateJavaScript(
  project: Scroll3DProject,
  options: JavaScriptExportOptions,
  minify: boolean
): string {
  const config = {
    projectId: project.id,
    canvasId: "scroll3d-canvas",
    manifestUrl: "frame-manifest.json",
    scrollLength: project.scene.scrollLength,
    playbackMode: project.scene.playbackMode,
    exposeGlobal: options.exposeGlobal
  };
  const source = `${options.moduleFormat === "esm" ? "" : "(function(){\n"}const Scroll3DExportConfig = ${safeJsonStringify(config)};

async function loadFrameManifest() {
  const response = await fetch(Scroll3DExportConfig.manifestUrl);
  if (!response.ok) {
    throw new Error("Unable to load frame-manifest.json");
  }
  return response.json();
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

function progressToFrameIndex(progress, frameCount) {
  if (frameCount <= 1) {
    return 0;
  }
  return clamp(Math.round(clamp(progress, 0, 1) * (frameCount - 1)), 0, frameCount - 1);
}

function resolveFrameUrl(frameSet, frameIndex) {
  const safeFrameIndex = progressToFrameIndex(frameIndex / Math.max(1, frameSet.frameCount - 1), frameSet.frameCount);
  const fileName = frameSet.filenamePattern.replace(/\\{index(?::([0-9]+))?\\}/g, function (_match, pattern) {
    if (!pattern) {
      return String(safeFrameIndex);
    }
    const startIndex = Number.parseInt(pattern, 10);
    return String(safeFrameIndex + (Number.isNaN(startIndex) ? 0 : startIndex)).padStart(pattern.length, "0");
  });
  return frameSet.basePath.replace(/\\/+$/, "") + "/" + fileName;
}

function chooseFrameSet(manifest) {
  var width = window.innerWidth;
  var target = width <= 767 ? "mobile" : width <= 1023 ? "tablet" : "desktop";
  return manifest.frameSets.find(function (frameSet) { return frameSet.target === target; }) ||
    manifest.frameSets.find(function (frameSet) { return frameSet.target === manifest.defaultTarget; }) ||
    manifest.frameSets[0];
}

function drawImageCover(context, image, canvas) {
  var canvasWidth = canvas.clientWidth || canvas.width;
  var canvasHeight = canvas.clientHeight || canvas.height;
  var scale = Math.max(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
  var width = image.naturalWidth * scale;
  var height = image.naturalHeight * scale;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(image, (canvasWidth - width) / 2, (canvasHeight - height) / 2, width, height);
}

async function startScroll3DExport() {
  var canvas = document.getElementById(Scroll3DExportConfig.canvasId);
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }
  var context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  var manifest = await loadFrameManifest();
  var frameSet = chooseFrameSet(manifest);
  var currentFrame = -1;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    var ratio = window.devicePixelRatio || 1;
    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    frameSet = chooseFrameSet(manifest);
    render();
  }

  function render() {
    var progress = reducedMotion ? 0 : clamp(window.scrollY / Math.max(1, Scroll3DExportConfig.scrollLength), 0, 1);
    var frameIndex = progressToFrameIndex(progress, frameSet.frameCount);
    if (frameIndex === currentFrame) {
      return;
    }
    currentFrame = frameIndex;
    var image = new Image();
    image.onload = function () {
      drawImageCover(context, image, canvas);
    };
    image.src = resolveFrameUrl(frameSet, frameIndex);
  }

  resize();
  window.addEventListener("scroll", render, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", function () {
    window.removeEventListener("scroll", render);
    window.removeEventListener("resize", resize);
  });

  if (Scroll3DExportConfig.exposeGlobal) {
    window.Scroll3DExport = { render: render, resize: resize, manifest: manifest };
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startScroll3DExport, { once: true });
} else {
  startScroll3DExport();
}
${options.moduleFormat === "esm" ? "export { startScroll3DExport };\n" : "})();\n"}`;

  if (!options.includeScrollEngineGlue) {
    return "";
  }

  return minify ? minifyJavaScript(source) : source;
}

function minifyJavaScript(source: string): string {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}
