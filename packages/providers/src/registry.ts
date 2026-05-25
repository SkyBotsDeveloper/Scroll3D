import { ProviderConfigLoader } from "./config";
import { InMemorySecretStore, serializeSecretSafe } from "./secrets";
import type {
  AnyProvider,
  AnyProviderConfig,
  ProviderConfigValidationResult,
  ProviderMode,
  ProviderPreset,
  ProviderRegistration,
  ProviderSecretStore,
  ProviderType
} from "./types";

export interface RegisterProviderOptions {
  enabled?: boolean;
  config?: AnyProviderConfig;
  presetId?: string | null;
}

export class ProviderRegistry {
  private readonly registrations = new Map<string, ProviderRegistration>();
  private readonly secretStore: ProviderSecretStore;
  private readonly configLoader: ProviderConfigLoader;

  constructor(options: { secretStore?: ProviderSecretStore } = {}) {
    this.secretStore = options.secretStore ?? new InMemorySecretStore();
    this.configLoader = new ProviderConfigLoader(this.secretStore);
  }

  register(
    providerOrRegistration: AnyProvider | ProviderRegistration,
    options: RegisterProviderOptions = {}
  ): ProviderRegistration {
    const registration = isProviderRegistration(providerOrRegistration)
      ? providerOrRegistration
      : createRegistration(providerOrRegistration, options);

    if (this.registrations.has(registration.id)) {
      throw new Error(`Provider already registered: ${registration.id}`);
    }

    this.registrations.set(registration.id, registration);

    return cloneRegistration(registration);
  }

  registerConfig(config: AnyProviderConfig): ProviderRegistration {
    return this.register(this.configLoader.load(config));
  }

  registerPreset(preset: ProviderPreset): ProviderRegistration {
    return this.register(this.configLoader.loadPreset(preset));
  }

  unregister(providerId: string): boolean {
    return this.registrations.delete(providerId);
  }

  get(providerId: string): ProviderRegistration | undefined {
    const registration = this.registrations.get(providerId);

    return registration ? cloneRegistration(registration) : undefined;
  }

  list(): ProviderRegistration[] {
    return Array.from(this.registrations.values()).map((registration) =>
      cloneRegistration(registration)
    );
  }

  listByType(type: ProviderType): ProviderRegistration[] {
    return this.list().filter((registration) => registration.provider.type === type);
  }

  listByMode(mode: ProviderMode): ProviderRegistration[] {
    return this.list().filter((registration) => registration.provider.mode === mode);
  }

  resolveRequiredProvider(
    type: ProviderType,
    preferredProviderId?: string
  ): AnyProvider {
    if (preferredProviderId) {
      const preferred = this.registrations.get(preferredProviderId);

      if (!preferred) {
        throw new Error(`Provider not found: ${preferredProviderId}`);
      }

      if (preferred.provider.type !== type) {
        throw new Error(
          `Provider '${preferredProviderId}' is type '${preferred.provider.type}', not '${type}'.`
        );
      }

      return preferred.provider;
    }

    const registration = Array.from(this.registrations.values()).find(
      (candidate) => candidate.enabled && candidate.provider.type === type
    );

    if (!registration) {
      throw new Error(`No enabled provider registered for type '${type}'.`);
    }

    return registration.provider;
  }

  validateProviderConfig(config: unknown): ProviderConfigValidationResult {
    return this.configLoader.validate(config);
  }

  toJSON(): { providers: unknown[] } {
    return {
      providers: this.list().map((registration) =>
        serializeSecretSafe(registration, this.secretStore)
      )
    };
  }
}

export class ProviderResolver {
  constructor(private readonly registry: ProviderRegistry) {}

  resolve(type: ProviderType, preferredProviderId?: string): AnyProvider {
    return this.registry.resolveRequiredProvider(type, preferredProviderId);
  }
}

export function createDefaultProviderRegistry(
  presets: readonly ProviderPreset[],
  secretStore?: ProviderSecretStore
): ProviderRegistry {
  const registry = new ProviderRegistry(secretStore ? { secretStore } : {});

  for (const preset of presets) {
    registry.registerPreset(preset);
  }

  return registry;
}

function isProviderRegistration(value: unknown): value is ProviderRegistration {
  return (
    value !== null &&
    typeof value === "object" &&
    "provider" in value &&
    "enabled" in value &&
    "createdAt" in value
  );
}

function createRegistration(
  provider: AnyProvider,
  options: RegisterProviderOptions
): ProviderRegistration {
  return {
    id: provider.id,
    provider,
    enabled: options.enabled ?? true,
    config: options.config
      ? (serializeSecretSafe(options.config) as AnyProviderConfig)
      : null,
    secretRefs: options.config?.secretRef ? [options.config.secretRef] : [],
    presetId: options.presetId ?? null,
    createdAt: new Date().toISOString()
  };
}

function cloneRegistration(registration: ProviderRegistration): ProviderRegistration {
  return {
    ...registration,
    config: registration.config
      ? (serializeSecretSafe(registration.config) as AnyProviderConfig)
      : null,
    secretRefs: registration.secretRefs.map((secretRef) => ({ ...secretRef }))
  };
}
