export type FrameFormat = "webp" | "avif" | "png" | "jpg" | "jpeg";
export type FrameTarget = "desktop" | "tablet" | "mobile";
export type PlaybackMode = "scroll" | "scrub" | "hybrid";
export type PreloadStrategy = "none" | "first" | "nearby" | "all";
export type RendererFit = "cover" | "contain" | "fill";
export type ReducedMotionMode = "poster" | "first-frame" | "disabled";
export type ScrollEngineStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "destroyed"
  | "error";

export interface FrameAssetRef {
  src: string;
  alt?: string;
  metadata?: Record<string, unknown>;
}

export interface FrameManifest {
  id: string;
  name: string;
  version: string;
  frameSets: FrameSet[];
  defaultTarget: FrameTarget;
  posterFrame?: string | FrameAssetRef;
  reducedMotionFallback?: string | FrameAssetRef;
  metadata?: Record<string, unknown>;
}

export interface FrameSet {
  id: string;
  target: FrameTarget;
  frameCount: number;
  format: FrameFormat;
  width: number;
  height: number;
  basePath: string;
  filenamePattern: string;
  manifestPath?: string;
  byteSize?: number;
  metadata?: Record<string, unknown>;
}

export interface PreloadConfig {
  strategy: PreloadStrategy;
  initialFrameCount: number;
  nearbyRadius: number;
  maxConcurrent: number;
  retryCount: number;
}

export interface RendererConfig {
  fit: RendererFit;
  smoothing: boolean;
  background?: string;
  devicePixelRatio?: number;
}

export interface ReducedMotionConfig {
  respectUserPreference: boolean;
  mode: ReducedMotionMode;
  posterFrame?: string | FrameAssetRef;
}

export interface ResponsiveConfig {
  enabled: boolean;
  mobileMaxWidth?: number;
  tabletMaxWidth?: number;
}

export interface TimelineSegment {
  id: string;
  start: number;
  end: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface ScrollProgressEvent {
  progress: number;
  frameIndex: number;
  target: FrameTarget;
  activeSegment?: TimelineSegment;
}

export interface ScrollEngineState {
  status: ScrollEngineStatus;
  progress: number;
  frameIndex: number;
  frameCount: number;
  target: FrameTarget;
  activeSegment?: TimelineSegment | undefined;
  loadedFrameCount: number;
  error?: string | undefined;
}

export interface ScrollEngineCallbacks {
  onReady?: (state: ScrollEngineState) => void;
  onFrameChange?: (frameIndex: number, state: ScrollEngineState) => void;
  onProgress?: (event: ScrollProgressEvent, state: ScrollEngineState) => void;
  onError?: (error: Error, state: ScrollEngineState) => void;
  onDestroy?: (state: ScrollEngineState) => void;
}

export interface ScrollEngineConfig {
  canvas: HTMLCanvasElement;
  manifest: FrameManifest;
  target?: FrameTarget;
  scrollContainer?: Window | HTMLElement;
  playbackMode: PlaybackMode;
  scrollLength: number;
  preload: PreloadConfig;
  renderer: RendererConfig;
  reducedMotion: ReducedMotionConfig;
  responsive: ResponsiveConfig;
  timeline?: TimelineSegment[];
  callbacks?: ScrollEngineCallbacks;
}

export interface FitRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FramePreloaderStats {
  cachedFrameCount: number;
  inFlightFrameCount: number;
  loadedFrameCount: number;
  failedFrameCount: number;
}
