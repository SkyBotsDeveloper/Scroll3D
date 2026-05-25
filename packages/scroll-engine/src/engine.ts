import {
  getFrameAssetSource,
  getFrameSetOrThrow,
  validateFrameManifest
} from "./frame-manifest";
import {
  getTimelineSegment,
  normalizeProgress,
  progressToFrameIndex
} from "./frame-math";
import { FramePreloader } from "./preloader";
import {
  resolveReducedMotionFrameSource,
  shouldUseReducedMotion
} from "./reduced-motion";
import { CanvasFrameRenderer } from "./renderer";
import { resolveResponsiveTarget } from "./responsive";
import type {
  FrameSet,
  FrameTarget,
  ScrollEngineConfig,
  ScrollEngineState
} from "./types";

export class Scroll3DEngine {
  private readonly config: ScrollEngineConfig;
  private frameSet: FrameSet;
  private renderer: CanvasFrameRenderer;
  private preloader: FramePreloader;
  private animationFrameId: AnimationFrameHandle | null = null;
  private destroyed = false;
  private paused = false;
  private listening = false;
  private readonly scrollHandler = (): void => {
    this.scheduleScrollUpdate();
  };

  readonly ready: Promise<void>;

  private state: ScrollEngineState;

  constructor(config: ScrollEngineConfig) {
    this.config = config;
    validateFrameManifest(config.manifest);
    const target = this.resolveTarget(config.target);
    this.frameSet = getFrameSetOrThrow(config.manifest, target);
    this.renderer = new CanvasFrameRenderer({
      canvas: config.canvas,
      config: config.renderer
    });
    this.preloader = this.createPreloader(this.frameSet);
    this.state = {
      status: "idle",
      progress: 0,
      frameIndex: 0,
      frameCount: this.frameSet.frameCount,
      target: this.frameSet.target,
      loadedFrameCount: 0
    };
    this.ready = this.initialize();
  }

  seek(progress: number): void {
    if (this.destroyed) {
      return;
    }

    const previousFrameIndex = this.state.frameIndex;
    const safeProgress = normalizeProgress(progress, 1);
    const frameIndex = progressToFrameIndex(safeProgress, this.frameSet.frameCount);
    const activeSegment = getTimelineSegment(safeProgress, this.config.timeline ?? []);

    this.state = {
      ...this.state,
      progress: safeProgress,
      frameIndex,
      activeSegment,
      loadedFrameCount: this.preloader.getStats().cachedFrameCount,
      ...(this.state.status === "idle" ? { status: "ready" as const } : {})
    };

    if (previousFrameIndex !== frameIndex) {
      this.config.callbacks?.onFrameChange?.(frameIndex, this.getState());
    }

    this.config.callbacks?.onProgress?.(
      {
        progress: safeProgress,
        frameIndex,
        target: this.state.target,
        ...(activeSegment ? { activeSegment } : {})
      },
      this.getState()
    );

    void this.renderFrame(frameIndex);
    void this.preloader.preloadNearby(frameIndex);
  }

  pause(): void {
    if (this.destroyed) {
      return;
    }

    this.paused = true;
    this.state = {
      ...this.state,
      status: "paused"
    };
  }

  resume(): void {
    if (this.destroyed) {
      return;
    }

    this.paused = false;
    this.state = {
      ...this.state,
      status: "playing"
    };
    this.scheduleScrollUpdate();
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.removeScrollListener();

    if (this.animationFrameId !== null) {
      cancelAnimationFrameSafe(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.preloader.clear();
    this.renderer.destroy();
    this.state = {
      ...this.state,
      status: "destroyed",
      loadedFrameCount: 0
    };
    this.config.callbacks?.onDestroy?.(this.getState());
  }

  resize(): void {
    if (this.destroyed) {
      return;
    }

    this.renderer.resize();

    if (this.config.responsive.enabled && !this.config.target) {
      const nextTarget = this.resolveTarget();

      if (nextTarget !== this.state.target) {
        this.setTarget(nextTarget);
        return;
      }
    }

    void this.renderFrame(this.state.frameIndex);
  }

  setTarget(target: FrameTarget): void {
    if (this.destroyed || target === this.state.target) {
      return;
    }

    this.frameSet = getFrameSetOrThrow(this.config.manifest, target);
    this.preloader.clear();
    this.preloader = this.createPreloader(this.frameSet);
    this.state = {
      ...this.state,
      target: this.frameSet.target,
      frameCount: this.frameSet.frameCount,
      frameIndex: progressToFrameIndex(this.state.progress, this.frameSet.frameCount),
      loadedFrameCount: 0
    };
    void this.preloader.preloadInitial();
    void this.renderFrame(this.state.frameIndex);
  }

  getState(): ScrollEngineState {
    return structuredClone(this.state);
  }

  private async initialize(): Promise<void> {
    if (this.destroyed) {
      return;
    }

    this.state = {
      ...this.state,
      status: "loading"
    };

    try {
      const reducedMotionActive = shouldUseReducedMotion(this.config.reducedMotion);

      if (reducedMotionActive) {
        await this.initializeReducedMotion();
      } else {
        this.addScrollListener();
        await this.preloader.preloadInitial();
        this.updateFromScroll();
      }

      if (this.state.status !== "error") {
        this.state = {
          ...this.state,
          status: "ready",
          loadedFrameCount: this.preloader.getStats().cachedFrameCount
        };
        this.config.callbacks?.onReady?.(this.getState());
      }
    } catch (error) {
      this.handleError(toError(error));
    }
  }

  private async initializeReducedMotion(): Promise<void> {
    if (this.config.reducedMotion.mode === "poster") {
      const source =
        resolveReducedMotionFrameSource(
          this.config.reducedMotion,
          this.config.manifest
        ) ?? getFrameAssetSource(this.config.manifest.posterFrame);

      if (source) {
        await this.renderStandaloneImage(source);
      }

      return;
    }

    if (this.config.reducedMotion.mode === "first-frame") {
      await this.renderFrame(0);
    }
  }

  private addScrollListener(): void {
    if (this.listening) {
      return;
    }

    const container = this.getScrollContainer();

    container?.addEventListener("scroll", this.scrollHandler, { passive: true });
    this.listening = Boolean(container);
  }

  private removeScrollListener(): void {
    if (!this.listening) {
      return;
    }

    this.getScrollContainer()?.removeEventListener("scroll", this.scrollHandler);
    this.listening = false;
  }

  private scheduleScrollUpdate(): void {
    if (this.paused || this.destroyed || this.animationFrameId !== null) {
      return;
    }

    this.animationFrameId = requestAnimationFrameSafe(() => {
      this.animationFrameId = null;
      this.updateFromScroll();
    });
  }

  private updateFromScroll(): void {
    if (this.paused || this.destroyed) {
      return;
    }

    this.seek(
      normalizeProgress(this.getScrollTop(), Math.max(1, this.config.scrollLength))
    );
  }

  private async renderFrame(frameIndex: number): Promise<void> {
    try {
      const image = await this.preloader.loadFrame(frameIndex);

      if (this.destroyed || frameIndex !== this.state.frameIndex) {
        return;
      }

      this.renderer.render(image, frameIndex);
      this.state = {
        ...this.state,
        loadedFrameCount: this.preloader.getStats().cachedFrameCount
      };
    } catch (error) {
      this.handleError(toError(error));
    }
  }

  private async renderStandaloneImage(source: string): Promise<void> {
    const image = await loadStandaloneImage(source);
    this.renderer.render(image, 0);
  }

  private handleError(error: Error): void {
    if (this.destroyed) {
      return;
    }

    this.state = {
      ...this.state,
      status: "error",
      error: error.message,
      loadedFrameCount: this.preloader.getStats().cachedFrameCount
    };
    this.config.callbacks?.onError?.(error, this.getState());
  }

  private createPreloader(frameSet: FrameSet): FramePreloader {
    return new FramePreloader({
      frameSet,
      config: this.config.preload
    });
  }

  private resolveTarget(explicitTarget?: FrameTarget): FrameTarget {
    return resolveResponsiveTarget({
      manifest: this.config.manifest,
      responsive: this.config.responsive,
      ...((explicitTarget ?? this.config.target)
        ? { explicitTarget: explicitTarget ?? this.config.target }
        : {})
    });
  }

  private getScrollTop(): number {
    const container = this.getScrollContainer();

    if (!container) {
      return 0;
    }

    if (isWindow(container)) {
      return container.scrollY;
    }

    return container.scrollTop;
  }

  private getScrollContainer(): Window | HTMLElement | undefined {
    if (this.config.scrollContainer) {
      return this.config.scrollContainer;
    }

    return typeof globalThis.window === "undefined" ? undefined : globalThis.window;
  }
}

export function createScroll3DEngine(config: ScrollEngineConfig): Scroll3DEngine {
  return new Scroll3DEngine(config);
}

type AnimationFrameHandle = number | ReturnType<typeof globalThis.setTimeout>;

function requestAnimationFrameSafe(
  callback: FrameRequestCallback
): AnimationFrameHandle {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(callback);
  }

  return globalThis.setTimeout(() => {
    callback(Date.now());
  }, 16);
}

function cancelAnimationFrameSafe(frameId: AnimationFrameHandle): void {
  if (
    typeof frameId === "number" &&
    typeof globalThis.cancelAnimationFrame === "function"
  ) {
    globalThis.cancelAnimationFrame(frameId);
    return;
  }

  globalThis.clearTimeout(frameId);
}

function isWindow(value: Window | HTMLElement): value is Window {
  return "document" in value;
}

function loadStandaloneImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof globalThis.Image !== "function") {
      reject(
        new Error("HTMLImageElement loading is not available in this environment.")
      );
      return;
    }

    const image = new globalThis.Image();

    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error(`Failed to load image '${source}'.`));
    };
    image.src = source;
  });
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Scroll3D engine error.");
}
