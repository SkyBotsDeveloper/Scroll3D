import { serializeSecretSafe } from "./secrets";
import type { ProviderRegistry } from "./registry";
import type {
  AnyProvider,
  ProviderMode,
  ProviderRegistration,
  ProviderSecretStore,
  ProviderType
} from "./types";

export type ProjectModeProviderStrategy = "local" | "api" | "hybrid";

export interface ProviderFallbackRule {
  type: ProviderType;
  order: Array<ProviderMode | "mock">;
}

export interface ProviderSelectionContext {
  projectMode: ProjectModeProviderStrategy;
  requiredProviderType: ProviderType;
  preferredProviderId?: string;
  preferredModes?: Partial<Record<ProviderType, Array<ProviderMode | "mock">>>;
  requiredCapabilityIds?: string[];
  allowMockFallback?: boolean;
  allowDisabledDiagnostics?: boolean;
  fallbackRules?: ProviderFallbackRule[];
  secretStore?: ProviderSecretStore;
}

export interface ProviderHealthStatus {
  providerId: string;
  available: boolean;
  reasons: string[];
}

export interface ProviderSelectionRejection {
  providerId: string;
  reasons: string[];
}

export interface ProviderSelectionResult {
  selectedProvider: AnyProvider | null;
  selectedProviderId: string | null;
  selectedRegistration: ProviderRegistration | null;
  rejected: ProviderSelectionRejection[];
  health: ProviderHealthStatus[];
  explanation: string;
}

export class ProviderCapabilityMatcher {
  matches(
    provider: AnyProvider,
    requiredCapabilityIds: readonly string[] = []
  ): boolean {
    if (requiredCapabilityIds.length === 0) {
      return true;
    }

    const providerCapabilityIds = new Set(
      provider.capabilities.map((capability) => capability.id)
    );

    return requiredCapabilityIds.every((capabilityId) =>
      providerCapabilityIds.has(capabilityId)
    );
  }
}

export class ProviderSelectionPolicy {
  private readonly capabilityMatcher = new ProviderCapabilityMatcher();

  constructor(private readonly registry: ProviderRegistry) {}

  async selectProvider(
    context: ProviderSelectionContext
  ): Promise<ProviderSelectionResult> {
    const registrations = this.registry.listByType(context.requiredProviderType);
    const rejected: ProviderSelectionRejection[] = [];
    const health: ProviderHealthStatus[] = [];
    const ordered = this.orderRegistrations(registrations, context);

    for (const registration of ordered) {
      const reasons = await this.getRejectionReasons(registration, context);
      health.push({
        providerId: registration.id,
        available: reasons.length === 0,
        reasons
      });

      if (reasons.length > 0) {
        rejected.push({
          providerId: registration.id,
          reasons
        });
        continue;
      }

      return {
        selectedProvider: registration.provider,
        selectedProviderId: registration.id,
        selectedRegistration: registration,
        rejected,
        health,
        explanation: serializeExplanation(
          `Selected provider '${registration.id}' for '${context.requiredProviderType}'.`
        )
      };
    }

    return {
      selectedProvider: null,
      selectedProviderId: null,
      selectedRegistration: null,
      rejected,
      health,
      explanation: serializeExplanation(
        `No provider selected for '${context.requiredProviderType}'.`
      )
    };
  }

  private orderRegistrations(
    registrations: readonly ProviderRegistration[],
    context: ProviderSelectionContext
  ): ProviderRegistration[] {
    const preferred = context.preferredProviderId
      ? registrations.find(
          (registration) => registration.id === context.preferredProviderId
        )
      : undefined;
    const remaining = registrations.filter(
      (registration) => registration.id !== preferred?.id
    );
    const modeOrder = this.getModeOrder(context);

    remaining.sort(
      (left, right) =>
        getRegistrationRank(left, modeOrder) - getRegistrationRank(right, modeOrder)
    );

    return preferred ? [preferred, ...remaining] : remaining;
  }

  private getModeOrder(
    context: ProviderSelectionContext
  ): Array<ProviderMode | "mock"> {
    const fallbackRule = context.fallbackRules?.find(
      (rule) => rule.type === context.requiredProviderType
    );

    if (fallbackRule) {
      return filterMockFallback(fallbackRule.order, context.allowMockFallback);
    }

    const preferredModes = context.preferredModes?.[context.requiredProviderType];

    if (preferredModes) {
      return filterMockFallback(preferredModes, context.allowMockFallback);
    }

    if (context.projectMode === "local") {
      return filterMockFallback(["local", "mock", "api"], context.allowMockFallback);
    }

    if (context.projectMode === "api") {
      return filterMockFallback(["api", "mock", "local"], context.allowMockFallback);
    }

    return filterMockFallback(["local", "api", "mock"], context.allowMockFallback);
  }

  private async getRejectionReasons(
    registration: ProviderRegistration,
    context: ProviderSelectionContext
  ): Promise<string[]> {
    const reasons: string[] = [];
    const isExplicitPreferred = registration.id === context.preferredProviderId;

    if (!registration.enabled && !context.allowDisabledDiagnostics) {
      reasons.push("Provider is disabled.");
    }

    if (registration.provider.type !== context.requiredProviderType) {
      reasons.push(
        `Provider type '${registration.provider.type}' does not match '${context.requiredProviderType}'.`
      );
    }

    if (
      !isExplicitPreferred &&
      isMockRegistration(registration) &&
      context.allowMockFallback !== true
    ) {
      reasons.push("Mock fallback is disabled.");
    }

    if (isApiNonMockRegistration(registration)) {
      if (registration.secretRefs.length === 0) {
        reasons.push("API provider has no secret reference.");
      }

      for (const secretRef of registration.secretRefs) {
        if (!context.secretStore?.hasSecret(secretRef)) {
          reasons.push(`Missing required secret reference '${secretRef.id}'.`);
        }
      }
    }

    if (
      !this.capabilityMatcher.matches(
        registration.provider,
        context.requiredCapabilityIds
      )
    ) {
      reasons.push("Provider is missing required capabilities.");
    }

    const available = await registration.provider.isAvailable({
      projectId: "provider-selection",
      jobId: `select-${context.requiredProviderType}`,
      secrets: buildAvailabilitySecrets(registration, context.secretStore)
    });

    if (!available) {
      reasons.push("Provider reported unavailable.");
    }

    return reasons.map((reason) => serializeExplanation(reason));
  }
}

function filterMockFallback(
  order: readonly (ProviderMode | "mock")[],
  allowMockFallback: boolean | undefined
): Array<ProviderMode | "mock"> {
  return order.filter((mode) => mode !== "mock" || allowMockFallback === true);
}

function getRegistrationRank(
  registration: ProviderRegistration,
  modeOrder: readonly (ProviderMode | "mock")[]
): number {
  const key = isMockRegistration(registration) ? "mock" : registration.provider.mode;
  const index = modeOrder.indexOf(key);

  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function isMockRegistration(registration: ProviderRegistration): boolean {
  return registration.config?.provider === "mock";
}

function isApiNonMockRegistration(registration: ProviderRegistration): boolean {
  return registration.provider.mode === "api" && !isMockRegistration(registration);
}

function buildAvailabilitySecrets(
  registration: ProviderRegistration,
  secretStore: ProviderSecretStore | undefined
): Record<string, string | undefined> {
  return Object.fromEntries(
    registration.secretRefs.map((secretRef) => [
      secretRef.id,
      secretStore?.getSecret(secretRef)
    ])
  );
}

function serializeExplanation(value: string): string {
  return String(serializeSecretSafe(value));
}
