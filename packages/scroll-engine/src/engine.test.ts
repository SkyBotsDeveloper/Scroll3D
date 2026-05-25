import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  sampleFrameManifest,
  sampleTimelineSegments
} from "./fixtures/sample-manifest";
import { Scroll3DEngine, type ScrollEngineConfig } from "./index";

class MockImageElement {
  static readonly failUrls = new Set<string>();

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 160;
  naturalHeight = 90;
  width = 160;
  height = 90;
  private source = "";

  set src(value: string) {
    this.source = value;
    queueMicrotask(() => {
      if (MockImageElement.failUrls.has(value)) {
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

describe("Scroll3DEngine", () => {
  beforeEach(() => {
    MockImageElement.failUrls.clear();
    vi.stubGlobal("Image", MockImageElement);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      queueMicrotask(() => {
        callback(0);
      });
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("initializes state and fires onReady", async () => {
    const onReady = vi.fn();
    const engine = new Scroll3DEngine(createConfig({ callbacks: { onReady } }));

    await engine.ready;

    expect(engine.getState().status).toBe("ready");
    expect(engine.getState().frameCount).toBe(120);
    expect(onReady).toHaveBeenCalledTimes(1);
    engine.destroy();
  });

  it("seek updates progress, frame index, and active segment", async () => {
    const onFrameChange = vi.fn();
    const onProgress = vi.fn();
    const engine = new Scroll3DEngine(
      createConfig({ callbacks: { onFrameChange, onProgress } })
    );

    await engine.ready;
    engine.seek(0.5);
    await nextMicrotask();

    expect(engine.getState().frameIndex).toBe(60);
    expect(engine.getState().activeSegment?.id).toBe("feature-orbit");
    expect(onFrameChange).toHaveBeenCalled();
    expect(onProgress).toHaveBeenCalled();
    engine.destroy();
  });

  it("pause and resume update status", async () => {
    const engine = new Scroll3DEngine(createConfig());

    await engine.ready;
    engine.pause();
    expect(engine.getState().status).toBe("paused");
    engine.resume();
    expect(engine.getState().status).toBe("playing");
    engine.destroy();
  });

  it("destroy cleans state and fires onDestroy", async () => {
    const onDestroy = vi.fn();
    const engine = new Scroll3DEngine(createConfig({ callbacks: { onDestroy } }));

    await engine.ready;
    engine.destroy();

    expect(engine.getState().status).toBe("destroyed");
    expect(engine.getState().loadedFrameCount).toBe(0);
    expect(onDestroy).toHaveBeenCalledTimes(1);
  });

  it("setTarget updates the active frame set", async () => {
    const engine = new Scroll3DEngine(createConfig());

    await engine.ready;
    engine.setTarget("mobile");
    await nextMicrotask();

    expect(engine.getState().target).toBe("mobile");
    expect(engine.getState().frameCount).toBe(90);
    engine.destroy();
  });

  it("calls onError when a frame is missing", async () => {
    const onError = vi.fn();
    const engine = new Scroll3DEngine(createConfig({ callbacks: { onError } }));

    await engine.ready;
    MockImageElement.failUrls.add("/sample-frames/desktop/frame_0061.webp");
    engine.seek(0.5);
    await nextMicrotask();
    await nextMicrotask();
    await nextMacrotask();

    expect(engine.getState().status).toBe("error");
    expect(onError).toHaveBeenCalled();
    engine.destroy();
  });
});

function createConfig(
  overrides: Partial<Pick<ScrollEngineConfig, "callbacks" | "target">> = {}
): ScrollEngineConfig {
  const { canvas } = createMockCanvas();

  return {
    canvas,
    manifest: sampleFrameManifest,
    ...(overrides.target ? { target: overrides.target } : {}),
    playbackMode: "scroll",
    scrollLength: 1000,
    preload: {
      strategy: "none",
      initialFrameCount: 0,
      nearbyRadius: 1,
      maxConcurrent: 2,
      retryCount: 0
    },
    renderer: {
      fit: "cover",
      smoothing: true,
      devicePixelRatio: 1
    },
    reducedMotion: {
      respectUserPreference: false,
      mode: "disabled"
    },
    responsive: {
      enabled: false
    },
    timeline: sampleTimelineSegments,
    ...(overrides.callbacks ? { callbacks: overrides.callbacks } : {})
  };
}

function createMockCanvas(): {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
} {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
    fillStyle: ""
  } as unknown as CanvasRenderingContext2D;
  const canvas = {
    width: 320,
    height: 180,
    clientWidth: 320,
    clientHeight: 180,
    getContext: vi.fn(() => context)
  } as unknown as HTMLCanvasElement;

  return { canvas, context };
}

function nextMicrotask(): Promise<void> {
  return new Promise((resolve) => {
    queueMicrotask(resolve);
  });
}

function nextMacrotask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
