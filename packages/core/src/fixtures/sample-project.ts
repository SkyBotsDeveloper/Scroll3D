import type { Scroll3DProject } from "../types";

export const sampleProject: Scroll3DProject = {
  id: "project_saas_cinematic",
  name: "Cinematic SaaS Launch",
  version: "0.1.0",
  mode: "hybrid",
  theme: {
    colors: {
      background: "#08090d",
      foreground: "#f6f7fb",
      primary: "#42d6a4",
      secondary: "#ffb54d",
      accent: "#7cc7ff",
      muted: "#a3a8b8",
      panel: "#12151d"
    },
    typography: {
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      headingFontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif",
      scale: {
        hero: "clamp(3rem, 9vw, 7rem)",
        heading: "clamp(2rem, 5vw, 4rem)",
        body: "1rem"
      }
    },
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      section: "8rem"
    },
    radius: {
      sm: "4px",
      md: "8px",
      lg: "12px"
    },
    effects: {
      sceneBlend: "screen",
      motionIntensity: "cinematic",
      depthFog: true
    }
  },
  pages: [
    {
      id: "page_home",
      name: "Home",
      slug: "/",
      title: "Cinematic SaaS Launch",
      description: "A dark cinematic SaaS landing page driven by scroll frames.",
      sections: [
        {
          id: "section_hero",
          type: "hero",
          name: "Hero",
          order: 0,
          content: {
            headline: "Launch complex products with cinematic clarity",
            subheadline:
              "A scroll-driven SaaS page that turns product motion into the main narrative.",
            primaryAction: "Request demo",
            secondaryAction: "View pricing"
          },
          settings: {
            sceneRange: [0, 90],
            align: "center"
          }
        },
        {
          id: "section_features",
          type: "features",
          name: "Features",
          order: 1,
          content: {
            headline: "Everything in motion, still easy to scan",
            items: [
              "Prompt-to-page planning",
              "Frame sequence playback",
              "Editable sections",
              "Static export"
            ]
          },
          settings: {
            layout: "three-column",
            sceneRange: [91, 210]
          }
        },
        {
          id: "section_pricing",
          type: "pricing",
          name: "Pricing",
          order: 2,
          content: {
            headline: "Start with a local-first workflow",
            plans: [
              {
                name: "Creator",
                price: "$19",
                features: ["Static exports", "Project JSON", "Basic providers"]
              },
              {
                name: "Studio",
                price: "$79",
                features: ["Hybrid providers", "Team review", "Advanced export"]
              }
            ]
          },
          settings: {
            sceneRange: [211, 300]
          }
        },
        {
          id: "section_faq",
          type: "faq",
          name: "FAQ",
          order: 3,
          content: {
            headline: "Questions",
            items: [
              {
                question: "Can the exported site run without Scroll3D?",
                answer: "Yes. Static export is a primary project goal."
              },
              {
                question: "Can providers run locally or through APIs?",
                answer: "Yes. The project supports local, API, and hybrid modes."
              }
            ]
          },
          settings: {
            sceneRange: [301, 360]
          }
        }
      ]
    }
  ],
  assets: [
    {
      id: "asset_source_video",
      type: "video",
      src: "/assets/videos/saas-orbit-source.mp4",
      alt: "Abstract product interface orbit source video",
      metadata: {
        durationSeconds: 12,
        generatedBy: "mock-video-provider"
      }
    },
    {
      id: "asset_reduced_motion",
      type: "image",
      src: "/assets/fallbacks/saas-orbit-poster.webp",
      alt: "Static poster for the SaaS orbit scene",
      metadata: {
        width: 1600,
        height: 900
      }
    }
  ],
  scene: {
    id: "scene_saas_orbit",
    name: "SaaS Product Orbit",
    sourceVideo: "/assets/videos/saas-orbit-source.mp4",
    frameSets: [
      {
        id: "frames_desktop",
        target: "desktop",
        frameCount: 360,
        format: "webp",
        width: 1920,
        height: 1080,
        basePath: "/frames/desktop",
        manifestPath: "/frames/desktop/manifest.json"
      },
      {
        id: "frames_mobile",
        target: "mobile",
        frameCount: 240,
        format: "webp",
        width: 828,
        height: 1792,
        basePath: "/frames/mobile",
        manifestPath: "/frames/mobile/manifest.json"
      }
    ],
    scrollLength: 4800,
    playbackMode: "scroll",
    reducedMotionFallback: {
      type: "image",
      src: "/assets/fallbacks/saas-orbit-poster.webp",
      alt: "Static poster for reduced-motion visitors"
    }
  },
  providers: [
    {
      id: "provider_local_llm",
      name: "Mock Local LLM",
      type: "llm",
      mode: "local",
      enabled: true,
      config: {
        model: "local-planner-mock",
        sequential: true
      }
    },
    {
      id: "provider_api_image",
      name: "Mock Image API",
      type: "image",
      mode: "api",
      enabled: true,
      config: {
        endpoint: "https://example.invalid/image"
      }
    },
    {
      id: "provider_api_video",
      name: "Mock Video API",
      type: "video",
      mode: "api",
      enabled: true,
      config: {
        endpoint: "https://example.invalid/video"
      }
    },
    {
      id: "provider_local_frame",
      name: "Mock Local Frame Extractor",
      type: "frame",
      mode: "local",
      enabled: true,
      config: {
        tool: "ffmpeg",
        fps: 30
      }
    },
    {
      id: "provider_api_code",
      name: "Mock Code API",
      type: "code",
      mode: "api",
      enabled: true,
      config: {
        endpoint: "https://example.invalid/code"
      }
    }
  ],
  agents: [
    {
      id: "agent_prompt",
      name: "Prompt Understanding Agent",
      type: "prompt",
      providerId: "provider_local_llm",
      description: "Turns the user prompt into a structured site plan."
    },
    {
      id: "agent_image",
      name: "Image Generation Agent",
      type: "image",
      providerId: "provider_api_image",
      description: "Creates original visual direction and still assets."
    },
    {
      id: "agent_video",
      name: "Video Generation Agent",
      type: "video",
      providerId: "provider_api_video",
      description: "Creates original source motion for frame extraction."
    },
    {
      id: "agent_frame",
      name: "Frame Extraction Agent",
      type: "frame",
      providerId: "provider_local_frame",
      description: "Extracts responsive frame sequences from source motion."
    },
    {
      id: "agent_code",
      name: "Website Coding Agent",
      type: "code",
      providerId: "provider_api_code",
      description: "Compiles project data into editable website code."
    }
  ],
  exportSettings: {
    format: "static",
    includeProjectJson: true,
    minify: true,
    outputDir: "dist"
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};
