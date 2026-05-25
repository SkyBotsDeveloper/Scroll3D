import type { FrameManifest, TimelineSegment } from "../types";

export const sampleTimelineSegments: TimelineSegment[] = [
  {
    id: "intro",
    start: 0,
    end: 0.32,
    label: "Hero intro"
  },
  {
    id: "feature-orbit",
    start: 0.32,
    end: 0.68,
    label: "Feature orbit"
  },
  {
    id: "conversion",
    start: 0.68,
    end: 1,
    label: "Conversion close"
  }
];

export const sampleFrameManifest: FrameManifest = {
  id: "sample-scroll3d-manifest",
  name: "Sample Scroll3D Frame Manifest",
  version: "0.1.0",
  defaultTarget: "desktop",
  posterFrame: {
    src: "/sample-frames/poster.webp",
    alt: "Sample Scroll3D poster frame"
  },
  reducedMotionFallback: {
    src: "/sample-frames/reduced-motion.webp",
    alt: "Sample reduced motion frame"
  },
  frameSets: [
    {
      id: "sample-desktop",
      target: "desktop",
      frameCount: 120,
      format: "webp",
      width: 1920,
      height: 1080,
      basePath: "/sample-frames/desktop",
      filenamePattern: "frame_{index:0001}.webp",
      manifestPath: "/sample-frames/desktop/manifest.json"
    },
    {
      id: "sample-mobile",
      target: "mobile",
      frameCount: 90,
      format: "webp",
      width: 828,
      height: 1792,
      basePath: "/sample-frames/mobile",
      filenamePattern: "frame_{index:0001}.webp",
      manifestPath: "/sample-frames/mobile/manifest.json"
    }
  ],
  metadata: {
    timelineSegments: sampleTimelineSegments.map((segment) => segment.id),
    fixtureOnly: true
  }
};
