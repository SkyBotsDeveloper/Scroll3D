import type {
  AnyProvider,
  ProviderConnectionCheck,
  ProviderConnectionChecker,
  ProviderConnectionContext,
  ProviderSecretRef,
  ProviderSecretStore
} from "./types";
import { redactSecrets, serializeSecretSafe } from "./secrets";

export interface ProviderConnectionAware {
  checkConnection(
    context?: ProviderConnectionContext
  ): Promise<ProviderConnectionCheck> | ProviderConnectionCheck;
}

export class DefaultProviderConnectionChecker implements ProviderConnectionChecker {
  async checkProvider(
    provider: AnyProvider,
    context: ProviderConnectionContext = {}
  ): Promise<ProviderConnectionCheck> {
    const startedAt = Date.now();

    if (isConnectionAware(provider)) {
      return serializeConnectionCheck(
        await provider.checkConnection(resolveConnectionContext(context))
      );
    }

    if (isMockProvider(provider)) {
      return createConnectionCheck(provider, "mock", "Mock provider is available.", {
        startedAt
      });
    }

    if (context.allowNetwork !== true && provider.mode === "api") {
      return createConnectionCheck(
        provider,
        "configured",
        "Provider is configured, but external network checks are disabled by default.",
        {
          startedAt,
          warnings: ["No external network call was made."]
        }
      );
    }

    try {
      const available = await provider.isAvailable();

      return createConnectionCheck(
        provider,
        available ? "connected" : "unavailable",
        available ? "Provider reports available." : "Provider reports unavailable.",
        { startedAt }
      );
    } catch (error) {
      return createConnectionCheck(
        provider,
        "unavailable",
        error instanceof Error ? error.message : "Provider check failed.",
        { startedAt }
      );
    }
  }

  async checkAll(
    providers: AnyProvider[],
    context: ProviderConnectionContext = {}
  ): Promise<ProviderConnectionCheck[]> {
    const checks: ProviderConnectionCheck[] = [];

    for (const provider of providers) {
      checks.push(await this.checkProvider(provider, context));
    }

    return checks;
  }
}

export function createProviderConnectionChecker(): ProviderConnectionChecker {
  return new DefaultProviderConnectionChecker();
}

export function hasSecret(
  ref: ProviderSecretRef | undefined,
  secrets: ProviderConnectionContext["secrets"]
): boolean {
  if (!ref) {
    return false;
  }

  if (!secrets) {
    return false;
  }

  if (isSecretStore(secrets)) {
    return secrets.hasSecret(ref);
  }

  return Boolean(secrets[ref.id]);
}

export function serializeConnectionCheck(
  check: ProviderConnectionCheck,
  secrets?: ProviderConnectionContext["secrets"]
): ProviderConnectionCheck {
  return redactSecrets(
    serializeSecretSafe(check, isSecretStore(secrets) ? secrets : undefined)
  ) as ProviderConnectionCheck;
}

export function createConnectionCheck(
  provider: AnyProvider,
  status: ProviderConnectionCheck["status"],
  message: string,
  options: {
    startedAt?: number;
    warnings?: string[];
    metadata?: Record<string, unknown>;
  } = {}
): ProviderConnectionCheck {
  const completedAt = Date.now();

  return {
    providerId: provider.id,
    status,
    message,
    checkedAt: new Date(completedAt).toISOString(),
    latencyMs: completedAt - (options.startedAt ?? completedAt),
    capabilities: provider.capabilities,
    warnings: options.warnings ?? [],
    metadata: options.metadata ?? {}
  };
}

function resolveConnectionContext(
  context: ProviderConnectionContext
): ProviderConnectionContext {
  return {
    timeoutMs: context.timeoutMs ?? 750,
    allowNetwork: context.allowNetwork ?? false,
    allowLocalhost: context.allowLocalhost ?? true,
    ...(context.secrets ? { secrets: context.secrets } : {}),
    ...(context.logger ? { logger: context.logger } : {})
  };
}

function isConnectionAware(
  provider: AnyProvider
): provider is AnyProvider & ProviderConnectionAware {
  return "checkConnection" in provider;
}

function isMockProvider(provider: AnyProvider): boolean {
  return (
    provider.id.startsWith("mock-") ||
    provider.name.toLowerCase().includes("mock") ||
    provider.capabilities.some((capability) => capability.id.startsWith("mock-"))
  );
}

function isSecretStore(value: unknown): value is ProviderSecretStore {
  return Boolean(
    value &&
    typeof value === "object" &&
    "hasSecret" in value &&
    typeof value.hasSecret === "function"
  );
}
