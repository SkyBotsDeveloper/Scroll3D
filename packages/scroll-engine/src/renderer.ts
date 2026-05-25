import { calculateContainFit, calculateCoverFit } from "./frame-math";
import type { RendererConfig } from "./types";

export interface CanvasFrameRendererOptions {
  canvas: HTMLCanvasElement;
  config: RendererConfig;
}

export class CanvasFrameRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly config: RendererConfig;
  private devicePixelRatio: number;
  private cssWidth = 0;
  private cssHeight = 0;

  constructor(options: CanvasFrameRendererOptions) {
    const context = options.canvas.getContext("2d");

    if (!context) {
      throw new Error("Scroll3D canvas rendering requires a 2D context.");
    }

    this.canvas = options.canvas;
    this.context = context;
    this.config = options.config;
    this.devicePixelRatio = resolveDevicePixelRatio(options.config);
    this.resize();
  }

  resize(): void {
    this.devicePixelRatio = resolveDevicePixelRatio(this.config);
    this.cssWidth = this.canvas.clientWidth || this.canvas.width || 1;
    this.cssHeight = this.canvas.clientHeight || this.canvas.height || 1;
    this.canvas.width = Math.max(1, Math.round(this.cssWidth * this.devicePixelRatio));
    this.canvas.height = Math.max(
      1,
      Math.round(this.cssHeight * this.devicePixelRatio)
    );
    this.context.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
    this.context.imageSmoothingEnabled = this.config.smoothing;
  }

  render(image: CanvasImageSource, frameIndex: number): void {
    void frameIndex;
    const imageWidth = getImageWidth(image);
    const imageHeight = getImageHeight(image);

    this.clear();

    if (this.config.background) {
      this.context.fillStyle = this.config.background;
      this.context.fillRect(0, 0, this.cssWidth, this.cssHeight);
    }

    if (imageWidth <= 0 || imageHeight <= 0) {
      return;
    }

    if (this.config.fit === "fill") {
      this.context.drawImage(image, 0, 0, this.cssWidth, this.cssHeight);
      return;
    }

    const fit =
      this.config.fit === "cover"
        ? calculateCoverFit(this.cssWidth, this.cssHeight, imageWidth, imageHeight)
        : calculateContainFit(this.cssWidth, this.cssHeight, imageWidth, imageHeight);

    this.context.drawImage(image, fit.x, fit.y, fit.width, fit.height);
  }

  clear(): void {
    this.context.clearRect(0, 0, this.cssWidth, this.cssHeight);
  }

  destroy(): void {
    this.clear();
  }
}

function resolveDevicePixelRatio(config: RendererConfig): number {
  if (config.devicePixelRatio) {
    return config.devicePixelRatio;
  }

  return typeof globalThis.devicePixelRatio === "number"
    ? globalThis.devicePixelRatio
    : 1;
}

function getImageWidth(image: CanvasImageSource): number {
  if ("naturalWidth" in image && typeof image.naturalWidth === "number") {
    return image.naturalWidth;
  }

  if ("videoWidth" in image && typeof image.videoWidth === "number") {
    return image.videoWidth;
  }

  return "width" in image && typeof image.width === "number" ? image.width : 0;
}

function getImageHeight(image: CanvasImageSource): number {
  if ("naturalHeight" in image && typeof image.naturalHeight === "number") {
    return image.naturalHeight;
  }

  if ("videoHeight" in image && typeof image.videoHeight === "number") {
    return image.videoHeight;
  }

  return "height" in image && typeof image.height === "number" ? image.height : 0;
}
