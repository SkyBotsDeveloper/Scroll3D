import { beforeEach, describe, expect, it } from "vitest";
import { sampleFrameManifest } from "./fixtures/sample-manifest";
import { FramePreloader, selectFrameSet } from "./index";

class MockImageElement {
  static readonly attempts = new Map<string, number>();
  static readonly failuresBeforeSuccess = new Map<string, number>();

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 100;
  naturalHeight = 100;
  width = 100;
  height = 100;
  private source = "";

  set src(value: string) {
    this.source = value;
    const attempt = (MockImageElement.attempts.get(value) ?? 0) + 1;
    MockImageElement.attempts.set(value, attempt);
    const failuresBeforeSuccess =
      MockImageElement.failuresBeforeSuccess.get(value) ?? 0;

    queueMicrotask(() => {
      if (attempt <= failuresBeforeSuccess) {
        this.onerror?.();
        return;
      }

      this.onload?.();
    });
  }

  get src(): string {
    return this.source;
  }
}

function createMockImage(): HTMLImageElement {
  return new MockImageElement() as unknown as HTMLImageElement;
}

describe("FramePreloader", () => {
  const frameSet = selectFrameSet(sampleFrameManifest, "desktop");

  beforeEach(() => {
    MockImageElement.attempts.clear();
    MockImageElement.failuresBeforeSuccess.clear();
  });

  it("preloads initial frames", async () => {
    const preloader = new FramePreloader({
      frameSet,
      createImage: createMockImage,
      config: {
        strategy: "first",
        initialFrameCount: 3,
        nearbyRadius: 1,
        maxConcurrent: 2,
        retryCount: 0
      }
    });

    await preloader.preloadInitial();

    expect(preloader.getStats().cachedFrameCount).toBe(3);
    expect(preloader.getCachedFrame(0)).toBeDefined();
  });

  it("preloads nearby frames around the current frame", async () => {
    const preloader = new FramePreloader({
      frameSet,
      createImage: createMockImage,
      config: {
        strategy: "nearby",
        initialFrameCount: 0,
        nearbyRadius: 2,
        maxConcurrent: 2,
        retryCount: 0
      }
    });

    await preloader.preloadNearby(10);

    expect(preloader.getCachedFrame(8)).toBeDefined();
    expect(preloader.getCachedFrame(10)).toBeDefined();
    expect(preloader.getCachedFrame(12)).toBeDefined();
    expect(preloader.getStats().cachedFrameCount).toBe(5);
  });

  it("reuses cached frames", async () => {
    const preloader = new FramePreloader({
      frameSet,
      createImage: createMockImage,
      config: {
        strategy: "first",
        initialFrameCount: 1,
        nearbyRadius: 1,
        maxConcurrent: 1,
        retryCount: 0
      }
    });

    await preloader.loadFrame(0);
    await preloader.loadFrame(0);

    expect(MockImageElement.attempts.size).toBe(1);
    expect(preloader.getStats().cachedFrameCount).toBe(1);
  });

  it("retries failed images", async () => {
    const preloader = new FramePreloader({
      frameSet,
      createImage: createMockImage,
      config: {
        strategy: "first",
        initialFrameCount: 1,
        nearbyRadius: 1,
        maxConcurrent: 1,
        retryCount: 1
      }
    });
    const firstFrameUrl = "/sample-frames/desktop/frame_0001.webp";
    MockImageElement.failuresBeforeSuccess.set(firstFrameUrl, 1);

    await preloader.loadFrame(0);

    expect(MockImageElement.attempts.get(firstFrameUrl)).toBe(2);
    expect(preloader.getStats().failedFrameCount).toBe(0);
  });
});
