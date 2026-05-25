import { describe, expect, it } from "vitest";
import {
  createProviderConnectionChecker,
  FFmpegFrameProvider,
  GenericAPIVideoProvider,
  InMemorySecretStore,
  MockLLMProvider,
  OllamaLLMProvider,
  OpenAICompatibleLLMProvider
} from "./index";

describe("provider connection checks", () => {
  it("reports mock providers as mock without network work", async () => {
    const checker = createProviderConnectionChecker();
    const check = await checker.checkProvider(new MockLLMProvider());

    expect(check.status).toBe("mock");
    expect(check.message).toContain("Mock provider");
  });

  it("reports API providers missing secret as missing-secret", async () => {
    const checker = createProviderConnectionChecker();
    const check = await checker.checkProvider(
      new OpenAICompatibleLLMProvider({
        id: "api-llm",
        name: "API LLM",
        mode: "api",
        baseUrl: "https://api.example.invalid/v1",
        model: "text-model",
        secretRef: { id: "api-key" }
      })
    );

    expect(check.status).toBe("missing-secret");
    expect(JSON.stringify(check)).not.toContain("secret-value");
  });

  it("reports API providers missing base URL as missing-config", async () => {
    const checker = createProviderConnectionChecker();
    const secrets = new InMemorySecretStore();
    secrets.setSecret("api-key", "secret-value");
    const check = await checker.checkProvider(
      new GenericAPIVideoProvider({
        id: "api-video",
        name: "API Video",
        mode: "api",
        model: "video-model",
        secretRef: { id: "api-key" }
      }),
      { secrets }
    );

    expect(check.status).toBe("missing-config");
    expect(JSON.stringify(check)).not.toContain("secret-value");
  });

  it("reports local providers missing endpoint as missing-config", async () => {
    const checker = createProviderConnectionChecker();
    const check = await checker.checkProvider(
      new OllamaLLMProvider({
        id: "ollama-empty",
        name: "Ollama Empty",
        mode: "local",
        baseUrl: ""
      })
    );

    expect(check.status).toBe("missing-config");
  });

  it("serializes configured API checks without raw secrets", async () => {
    const checker = createProviderConnectionChecker();
    const secrets = new InMemorySecretStore();
    secrets.setSecret("api-key", "secret-value");
    const check = await checker.checkProvider(
      new OpenAICompatibleLLMProvider({
        id: "api-llm",
        name: "API LLM",
        mode: "api",
        baseUrl: "https://api.example.invalid/v1",
        model: "text-model",
        secretRef: { id: "api-key" }
      }),
      { secrets }
    );

    expect(check.status).toBe("configured");
    expect(JSON.stringify(check)).not.toContain("secret-value");
  });

  it("provides local discovery hints without running tools", () => {
    const ffmpeg = new FFmpegFrameProvider({
      id: "ffmpeg",
      name: "FFmpeg",
      mode: "local"
    });

    expect(ffmpeg.getDiscoveryInfo().expectedPath).toBe("ffmpeg");
    expect(ffmpeg.getDiscoveryInfo().installHint).toContain("FFmpeg");
  });
});
