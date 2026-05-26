import { z } from "zod";

const ProviderTypeSchema = z.enum(["llm", "image", "video", "frame", "code"]);
const ProviderPluginModeSchema = z.enum(["mock", "local", "api"]);

export const ProviderPluginCapabilitySchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  providerType: ProviderTypeSchema,
  description: z.string().trim().min(1),
  heavy: z.boolean()
});

export const ProviderPluginRuntimeRequirementsSchema = z.object({
  requiresNetwork: z.boolean(),
  requiresLocalRuntime: z.boolean(),
  requiresSecretRef: z.boolean(),
  supportedPlatforms: z.array(z.string().trim().min(1)).default(["any"]),
  minRamGB: z.number().positive().optional(),
  recommendedRamGB: z.number().positive().optional(),
  endpoints: z.array(z.string().trim().min(1)).default([]),
  commands: z.array(z.string().trim().min(1)).default([]),
  notes: z.array(z.string().trim().min(1)).default([])
});

export const ProviderPluginSetupInstructionsSchema = z.object({
  summary: z.string().trim().min(1),
  steps: z.array(z.string().trim().min(1)).min(1),
  secretRefs: z.array(z.string().trim().min(1)).default([]),
  docsUrl: z.string().trim().min(1).optional()
});

export const ProviderPluginManifestSchema = z.object({
  schemaVersion: z.literal("1"),
  providerId: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  version: z.string().trim().min(1),
  description: z.string().trim().min(1),
  mode: ProviderPluginModeSchema,
  providerType: ProviderTypeSchema,
  capabilities: z.array(ProviderPluginCapabilitySchema).min(1),
  runtimeRequirements: ProviderPluginRuntimeRequirementsSchema,
  setupInstructions: ProviderPluginSetupInstructionsSchema,
  tags: z.array(z.string().trim().min(1)).default([]),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export type ProviderPluginMode = z.infer<typeof ProviderPluginModeSchema>;
export type ProviderPluginCapability = z.infer<typeof ProviderPluginCapabilitySchema>;
export type ProviderPluginRuntimeRequirements = z.infer<
  typeof ProviderPluginRuntimeRequirementsSchema
>;
export type ProviderPluginSetupInstructions = z.infer<
  typeof ProviderPluginSetupInstructionsSchema
>;
export type ProviderPluginManifest = z.infer<typeof ProviderPluginManifestSchema>;

export interface ProviderPluginValidationResult {
  success: boolean;
  manifest: ProviderPluginManifest | null;
  errors: string[];
}

function manifest(manifestInput: ProviderPluginManifest): ProviderPluginManifest {
  return ProviderPluginManifestSchema.parse(manifestInput);
}

export const providerPluginManifests: ProviderPluginManifest[] = [
  manifest({
    schemaVersion: "1",
    providerId: "scroll3d.mock.llm",
    displayName: "Scroll3D Mock LLM",
    version: "0.1.0",
    description: "Offline deterministic prompt planning for developer preview.",
    mode: "mock",
    providerType: "llm",
    capabilities: [
      {
        id: "structured-output",
        label: "Prompt planning",
        providerType: "llm",
        description: "Turns a website prompt into a deterministic project plan.",
        heavy: false
      }
    ],
    runtimeRequirements: {
      requiresNetwork: false,
      requiresLocalRuntime: false,
      requiresSecretRef: false,
      supportedPlatforms: ["browser", "node"],
      endpoints: [],
      commands: [],
      notes: ["Available offline for UI and pipeline testing."]
    },
    setupInstructions: {
      summary: "No setup required.",
      steps: ["Keep mock fallback enabled in developer preview."],
      secretRefs: []
    },
    tags: ["offline", "developer-preview", "safe-default"],
    metadata: {}
  }),
  manifest({
    schemaVersion: "1",
    providerId: "scroll3d.mock.media",
    displayName: "Scroll3D Mock Media",
    version: "0.1.0",
    description:
      "Deterministic image, video, and frame references for offline preview.",
    mode: "mock",
    providerType: "image",
    capabilities: [
      {
        id: "image-generation",
        label: "Image concept",
        providerType: "image",
        description: "Creates deterministic image artifact references.",
        heavy: true
      },
      {
        id: "video-generation",
        label: "Motion concept",
        providerType: "video",
        description: "Creates deterministic video artifact references.",
        heavy: true
      },
      {
        id: "frame-extraction",
        label: "Scroll frames",
        providerType: "frame",
        description: "Creates deterministic frame manifest references.",
        heavy: true
      }
    ],
    runtimeRequirements: {
      requiresNetwork: false,
      requiresLocalRuntime: false,
      requiresSecretRef: false,
      supportedPlatforms: ["browser", "node"],
      endpoints: [],
      commands: [],
      notes: ["Does not create real media files in this phase."]
    },
    setupInstructions: {
      summary: "No setup required.",
      steps: ["Use this while real media providers are disabled."],
      secretRefs: []
    },
    tags: ["offline", "media", "developer-preview"],
    metadata: {}
  }),
  manifest({
    schemaVersion: "1",
    providerId: "scroll3d.api.openai-compatible",
    displayName: "OpenAI-Compatible API",
    version: "0.1.0",
    description:
      "Future API adapter for LLM, image, and code providers with BYO secret refs.",
    mode: "api",
    providerType: "llm",
    capabilities: [
      {
        id: "text-generation",
        label: "Text generation",
        providerType: "llm",
        description: "Future prompt understanding and structured planning.",
        heavy: false
      },
      {
        id: "image-generation",
        label: "Image generation",
        providerType: "image",
        description: "Future hosted image generation through compatible APIs.",
        heavy: true
      },
      {
        id: "code-generation",
        label: "Website compilation",
        providerType: "code",
        description: "Future hosted code planning and compilation.",
        heavy: false
      }
    ],
    runtimeRequirements: {
      requiresNetwork: true,
      requiresLocalRuntime: false,
      requiresSecretRef: true,
      supportedPlatforms: ["browser", "node"],
      endpoints: ["https://api.example.invalid/v1"],
      commands: [],
      notes: ["Real network calls are disabled in developer preview."]
    },
    setupInstructions: {
      summary: "Create a provider config that references a secretRef.",
      steps: [
        "Choose API mode or Hybrid mode.",
        "Add a base URL and model name.",
        "Reference a secret id such as openai.main.",
        "Keep the raw key outside project files."
      ],
      secretRefs: ["openai.main"]
    },
    tags: ["api", "byo-key", "future-provider"],
    metadata: {}
  }),
  manifest({
    schemaVersion: "1",
    providerId: "scroll3d.api.generic-video",
    displayName: "Generic Video API",
    version: "0.1.0",
    description: "Future API adapter for hosted video generation providers.",
    mode: "api",
    providerType: "video",
    capabilities: [
      {
        id: "video-generation",
        label: "Video generation",
        providerType: "video",
        description: "Future hosted video generation with BYO secret refs.",
        heavy: true
      }
    ],
    runtimeRequirements: {
      requiresNetwork: true,
      requiresLocalRuntime: false,
      requiresSecretRef: true,
      supportedPlatforms: ["browser", "node"],
      endpoints: ["https://api.example.invalid/video"],
      commands: [],
      notes: ["Real network calls are disabled in developer preview."]
    },
    setupInstructions: {
      summary: "Create a video provider config with a secretRef.",
      steps: [
        "Choose API or Hybrid mode.",
        "Add provider endpoint and model name.",
        "Reference a secret id such as replicate.primary."
      ],
      secretRefs: ["replicate.primary"]
    },
    tags: ["api", "video", "future-provider"],
    metadata: {}
  }),
  manifest({
    schemaVersion: "1",
    providerId: "scroll3d.local.ollama",
    displayName: "Ollama Local LLM",
    version: "0.1.0",
    description: "Future local prompt and code model adapter through Ollama.",
    mode: "local",
    providerType: "llm",
    capabilities: [
      {
        id: "local-text-generation",
        label: "Local text generation",
        providerType: "llm",
        description: "Future local prompt understanding and planning.",
        heavy: true
      }
    ],
    runtimeRequirements: {
      requiresNetwork: false,
      requiresLocalRuntime: true,
      requiresSecretRef: false,
      supportedPlatforms: ["macos", "windows", "linux"],
      minRamGB: 8,
      recommendedRamGB: 16,
      endpoints: ["http://127.0.0.1:11434"],
      commands: ["pnpm setup:local", "pnpm runtime:handshake"],
      notes: ["No local model is downloaded or executed in this phase."]
    },
    setupInstructions: {
      summary: "Plan local setup before connecting runtime.",
      steps: [
        "Stop the dev server.",
        "Run pnpm setup:local.",
        "Review pnpm runtime:plan-downloads.",
        "Restart the dev server and check runtime guidance."
      ],
      secretRefs: []
    },
    tags: ["local", "llm", "future-runtime"],
    metadata: {}
  }),
  manifest({
    schemaVersion: "1",
    providerId: "scroll3d.local.comfyui",
    displayName: "ComfyUI Local Media",
    version: "0.1.0",
    description: "Future local image and video provider adapter through ComfyUI.",
    mode: "local",
    providerType: "image",
    capabilities: [
      {
        id: "local-image-generation",
        label: "Local image generation",
        providerType: "image",
        description: "Future local image concept generation.",
        heavy: true
      },
      {
        id: "local-video-generation",
        label: "Local video generation",
        providerType: "video",
        description: "Future local motion generation.",
        heavy: true
      }
    ],
    runtimeRequirements: {
      requiresNetwork: false,
      requiresLocalRuntime: true,
      requiresSecretRef: false,
      supportedPlatforms: ["windows", "linux", "macos"],
      minRamGB: 16,
      recommendedRamGB: 32,
      endpoints: ["http://127.0.0.1:8188"],
      commands: ["pnpm setup:local", "pnpm runtime:models"],
      notes: ["Media model downloads are disabled until a later phase."]
    },
    setupInstructions: {
      summary: "Plan local media model requirements before enabling execution.",
      steps: [
        "Run pnpm runtime:scan.",
        "Review Lite, Balanced, Pro, or Custom recommendations.",
        "Use mock fallback until explicit downloads exist."
      ],
      secretRefs: []
    },
    tags: ["local", "media", "future-runtime"],
    metadata: {}
  }),
  manifest({
    schemaVersion: "1",
    providerId: "scroll3d.local.ffmpeg",
    displayName: "FFmpeg Frame Tools",
    version: "0.1.0",
    description: "Future local frame extraction and optimization tooling.",
    mode: "local",
    providerType: "frame",
    capabilities: [
      {
        id: "frame-extraction",
        label: "Frame extraction",
        providerType: "frame",
        description: "Future frame sequence extraction and manifest generation.",
        heavy: true
      }
    ],
    runtimeRequirements: {
      requiresNetwork: false,
      requiresLocalRuntime: false,
      requiresSecretRef: false,
      supportedPlatforms: ["windows", "macos", "linux"],
      endpoints: [],
      commands: ["ffmpeg", "pnpm runtime:doctor"],
      notes: ["Doctor can report FFmpeg availability without failing setup."]
    },
    setupInstructions: {
      summary: "Install FFmpeg later when real frame extraction is enabled.",
      steps: [
        "Run pnpm runtime:doctor.",
        "Use mock frame manifests until real extraction is implemented."
      ],
      secretRefs: []
    },
    tags: ["local", "frame", "tooling"],
    metadata: {}
  })
];

export function parseProviderPluginManifest(input: unknown): ProviderPluginManifest {
  return ProviderPluginManifestSchema.parse(input);
}

export function safeParseProviderPluginManifest(
  input: unknown
): ProviderPluginValidationResult {
  const result = ProviderPluginManifestSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      manifest: result.data,
      errors: []
    };
  }

  return {
    success: false,
    manifest: null,
    errors: result.error.issues.map((issue) => issue.message)
  };
}

export function validateProviderPluginManifest(
  input: unknown
): ProviderPluginValidationResult {
  return safeParseProviderPluginManifest(input);
}

export function listProviderPluginManifests(): ProviderPluginManifest[] {
  return [...providerPluginManifests];
}

export function getProviderPluginManifest(
  providerId: string
): ProviderPluginManifest | undefined {
  return providerPluginManifests.find(
    (manifestItem) => manifestItem.providerId === providerId
  );
}

export function listProviderPluginManifestsByMode(
  mode: ProviderPluginMode
): ProviderPluginManifest[] {
  return providerPluginManifests.filter((manifestItem) => manifestItem.mode === mode);
}

export function listProviderPluginManifestsByCapability(
  capabilityId: string
): ProviderPluginManifest[] {
  return providerPluginManifests.filter((manifestItem) =>
    manifestItem.capabilities.some((capability) => capability.id === capabilityId)
  );
}
