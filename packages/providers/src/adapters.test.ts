import { describe, expect, it } from "vitest";
import {
  ComfyUIImageProvider,
  ComfyUIVideoProvider,
  FFmpegFrameProvider,
  GenericAPIVideoProvider,
  LocalCodeLLMProvider,
  OllamaLLMProvider,
  OpenAICompatibleCodeProvider,
  OpenAICompatibleImageProvider,
  OpenAICompatibleLLMProvider,
  parseScroll3DConfig
} from "./index";

describe("provider adapter scaffolds", () => {
  it("exports provider scaffolds with expected types and capabilities", () => {
    const providers = [
      new OpenAICompatibleLLMProvider({
        id: "openai-llm",
        name: "OpenAI LLM",
        mode: "api",
        baseUrl: "https://api.example.invalid/v1",
        secretRef: { id: "openai-key" }
      }),
      new OllamaLLMProvider({
        id: "ollama",
        name: "Ollama",
        mode: "local",
        baseUrl: "http://127.0.0.1:11434"
      }),
      new OpenAICompatibleImageProvider({
        id: "openai-image",
        name: "OpenAI Image",
        mode: "api",
        baseUrl: "https://api.example.invalid/v1",
        secretRef: { id: "openai-key" }
      }),
      new ComfyUIImageProvider({
        id: "comfy-image",
        name: "Comfy Image",
        mode: "local",
        baseUrl: "http://127.0.0.1:8188"
      }),
      new GenericAPIVideoProvider({
        id: "generic-video",
        name: "Generic Video",
        mode: "api",
        baseUrl: "https://api.example.invalid/video",
        secretRef: { id: "video-key" }
      }),
      new ComfyUIVideoProvider({
        id: "comfy-video",
        name: "Comfy Video",
        mode: "local",
        baseUrl: "http://127.0.0.1:8188"
      }),
      new FFmpegFrameProvider({
        id: "ffmpeg",
        name: "FFmpeg",
        mode: "local",
        localPath: "ffmpeg"
      }),
      new OpenAICompatibleCodeProvider({
        id: "openai-code",
        name: "OpenAI Code",
        mode: "api",
        baseUrl: "https://api.example.invalid/v1",
        secretRef: { id: "openai-key" }
      }),
      new LocalCodeLLMProvider({
        id: "local-code",
        name: "Local Code",
        mode: "local",
        model: "code-model"
      })
    ];

    expect(providers.map((provider) => provider.type)).toEqual([
      "llm",
      "llm",
      "image",
      "image",
      "video",
      "video",
      "frame",
      "code",
      "code"
    ]);
    expect(providers.every((provider) => provider.capabilities.length > 0)).toBe(true);
  });

  it("reports unavailable safely when config or secret is missing", async () => {
    const provider = new OpenAICompatibleLLMProvider({
      id: "missing-config",
      name: "Missing Config",
      mode: "api",
      secretRef: { id: "real-secret-id" }
    });

    expect(provider.isAvailable()).toBe(false);

    const result = await provider.generateText(
      { prompt: "test" },
      { projectId: "p", jobId: "j" }
    );
    const serialized = JSON.stringify(result);

    expect(result.status).toBe("failed");
    expect(serialized).not.toContain("real-secret-value");
  });

  it("validates the safe Scroll3D config shape", () => {
    const config = parseScroll3DConfig({
      project: { defaultMode: "hybrid" },
      providers: [
        {
          id: "ollama",
          name: "Ollama",
          type: "llm",
          mode: "local",
          enabled: false,
          provider: "ollama",
          baseUrl: "http://127.0.0.1:11434"
        }
      ],
      providerPreferences: {
        llm: {
          modeOrder: ["local", "mock"]
        }
      }
    });

    expect(config.project.defaultMode).toBe("hybrid");
    expect(config.providers[0]?.provider).toBe("ollama");
  });
});
