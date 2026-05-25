import { clamp, resolveFrameUrl } from "./frame-math";
import type { FramePreloaderStats, FrameSet, PreloadConfig } from "./types";

export type ImageFactory = () => HTMLImageElement;

export interface FramePreloaderOptions {
  frameSet: FrameSet;
  config: PreloadConfig;
  createImage?: ImageFactory;
}

type PendingTask = () => void;

export class FramePreloader {
  private readonly frameSet: FrameSet;
  private readonly config: PreloadConfig;
  private readonly createImage: ImageFactory;
  private readonly cache = new Map<number, HTMLImageElement>();
  private readonly inFlight = new Map<number, Promise<HTMLImageElement>>();
  private readonly queue: PendingTask[] = [];
  private activeLoads = 0;
  private loadedFrameCount = 0;
  private failedFrameCount = 0;

  constructor(options: FramePreloaderOptions) {
    this.frameSet = options.frameSet;
    this.config = normalizePreloadConfig(options.config);
    this.createImage = options.createImage ?? createBrowserImage;
  }

  loadFrame(index: number): Promise<HTMLImageElement> {
    const safeIndex = clampFrameIndex(index, this.frameSet.frameCount);
    const cachedFrame = this.cache.get(safeIndex);

    if (cachedFrame) {
      return Promise.resolve(cachedFrame);
    }

    const inFlightFrame = this.inFlight.get(safeIndex);

    if (inFlightFrame) {
      return inFlightFrame;
    }

    const loadPromise = this.schedule(() => this.loadFrameWithRetry(safeIndex))
      .then((image) => {
        this.cache.set(safeIndex, image);
        this.loadedFrameCount += 1;

        return image;
      })
      .catch((error: unknown) => {
        this.failedFrameCount += 1;
        throw toError(error);
      })
      .finally(() => {
        this.inFlight.delete(safeIndex);
      });

    this.inFlight.set(safeIndex, loadPromise);

    return loadPromise;
  }

  preloadInitial(): Promise<HTMLImageElement[]> {
    if (this.config.strategy === "none") {
      return Promise.resolve([]);
    }

    if (this.config.strategy === "all") {
      return this.preloadAll();
    }

    return this.preloadIndices(
      range(0, Math.min(this.config.initialFrameCount, this.frameSet.frameCount) - 1)
    );
  }

  preloadNearby(index: number): Promise<HTMLImageElement[]> {
    if (this.config.strategy === "none" || this.config.strategy === "first") {
      return Promise.resolve([]);
    }

    if (this.config.strategy === "all") {
      return this.preloadAll();
    }

    const safeIndex = clampFrameIndex(index, this.frameSet.frameCount);

    return this.preloadIndices(
      range(safeIndex - this.config.nearbyRadius, safeIndex + this.config.nearbyRadius)
    );
  }

  preloadAll(): Promise<HTMLImageElement[]> {
    return this.preloadIndices(range(0, this.frameSet.frameCount - 1));
  }

  getCachedFrame(index: number): HTMLImageElement | undefined {
    return this.cache.get(clampFrameIndex(index, this.frameSet.frameCount));
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
    this.queue.splice(0, this.queue.length);
    this.activeLoads = 0;
  }

  getStats(): FramePreloaderStats {
    return {
      cachedFrameCount: this.cache.size,
      inFlightFrameCount: this.inFlight.size,
      loadedFrameCount: this.loadedFrameCount,
      failedFrameCount: this.failedFrameCount
    };
  }

  private async preloadIndices(
    indices: readonly number[]
  ): Promise<HTMLImageElement[]> {
    const uniqueIndices = [
      ...new Set(
        indices.map((index) => clampFrameIndex(index, this.frameSet.frameCount))
      )
    ];
    const results = await Promise.allSettled(
      uniqueIndices.map((index) => this.loadFrame(index))
    );

    return results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : []
    );
  }

  private async loadFrameWithRetry(index: number): Promise<HTMLImageElement> {
    const url = resolveFrameUrl(this.frameSet, index);
    let attempt = 0;

    while (attempt <= this.config.retryCount) {
      try {
        return await this.loadImage(url);
      } catch (error) {
        attempt += 1;

        if (attempt > this.config.retryCount) {
          throw error;
        }
      }
    }

    throw new Error(`Failed to load frame ${String(index)}.`);
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = this.createImage();

      image.onload = () => {
        resolve(image);
      };
      image.onerror = () => {
        reject(new Error(`Failed to load frame image '${url}'.`));
      };
      image.src = url;
    });
  }

  private schedule<TValue>(task: () => Promise<TValue>): Promise<TValue> {
    return new Promise((resolve, reject) => {
      const run = (): void => {
        this.activeLoads += 1;
        task()
          .then(resolve, reject)
          .finally(() => {
            this.activeLoads -= 1;
            this.runNextQueuedTask();
          });
      };

      if (this.activeLoads < this.config.maxConcurrent) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }

  private runNextQueuedTask(): void {
    const nextTask = this.queue.shift();

    if (nextTask && this.activeLoads < this.config.maxConcurrent) {
      nextTask();
    }
  }
}

function normalizePreloadConfig(config: PreloadConfig): PreloadConfig {
  return {
    strategy: config.strategy,
    initialFrameCount: Math.max(0, config.initialFrameCount),
    nearbyRadius: Math.max(0, config.nearbyRadius),
    maxConcurrent: Math.max(1, config.maxConcurrent),
    retryCount: Math.max(0, config.retryCount)
  };
}

function createBrowserImage(): HTMLImageElement {
  if (typeof globalThis.Image !== "function") {
    throw new Error("HTMLImageElement loading is not available in this environment.");
  }

  return new globalThis.Image();
}

function clampFrameIndex(index: number, frameCount: number): number {
  return Math.trunc(clamp(index, 0, Math.max(0, frameCount - 1)));
}

function range(start: number, end: number): number[] {
  if (end < start) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_value, index) => start + index);
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Frame loading failed.");
}
