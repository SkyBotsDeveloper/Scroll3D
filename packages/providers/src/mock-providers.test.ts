import { z } from "zod";
import { describe, expect, it } from "vitest";
import {
  createMockProviders,
  findProviderByType,
  MockFrameProvider,
  MockImageProvider,
  MockLLMProvider,
  MockVideoProvider
} from "./index";
import type { ProviderContext } from "./types";

const context: ProviderContext = {
  projectId: "project-test",
  jobId: "job-test"
};

describe("mock providers", () => {
  it("returns deterministic image output", async () => {
    const provider = new MockImageProvider();
    const first = await provider.generateImage({ prompt: "Cinematic SaaS" }, context);
    const second = await provider.generateImage({ prompt: "Cinematic SaaS" }, context);

    expect(first.status).toBe("completed");
    expect(first.output?.image.path).toBe("/mock-assets/images/cinematic-saas.webp");
    expect(second.output?.image.path).toBe(first.output?.image.path);
  });

  it("generates structured LLM output against a schema", async () => {
    const provider = new MockLLMProvider();
    const schema = z.object({
      title: z.string(),
      sections: z.array(z.object({ type: z.string(), name: z.string() })),
      visualPrompt: z.string(),
      motionPrompt: z.string(),
      sourcePrompt: z.string()
    });

    const result = await provider.generateStructuredOutput(
      { prompt: "Build a landing page" },
      schema,
      context
    );

    expect(result.status).toBe("completed");
    expect(result.output?.sections).toHaveLength(4);
  });

  it("extracts deterministic desktop and mobile frame sets", async () => {
    const videoProvider = new MockVideoProvider();
    const frameProvider = new MockFrameProvider();
    const videoResult = await videoProvider.generateVideo(
      { prompt: "Orbit through interface" },
      context
    );

    expect(videoResult.output).not.toBeNull();

    if (videoResult.output === null) {
      throw new Error("Expected mock video output.");
    }

    const result = await frameProvider.extractFrames(
      { video: videoResult.output.video },
      context
    );

    expect(result.status).toBe("completed");
    expect(result.output?.frameSets.map((frameSet) => frameSet.target)).toEqual([
      "desktop",
      "mobile"
    ]);
  });

  it("matches providers by type", () => {
    const providers = createMockProviders();

    expect(findProviderByType(providers, "llm")?.type).toBe("llm");
    expect(findProviderByType(providers, "code")?.type).toBe("code");
    expect(findProviderByType(providers, "frame")?.mode).toBe("local");
  });
});
