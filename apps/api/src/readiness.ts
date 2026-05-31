import {
  type ProviderSandboxProvider,
  providerSandboxProviders,
  summarizeProviderSandboxAllowlist
} from "@ai-omni/shared";

type EnvLike = Record<string, string | undefined>;

const providerCredentials: Record<ProviderSandboxProvider, { access: string; webhook: string }> = {
  line: { access: "LINE_CHANNEL_ACCESS_TOKEN", webhook: "LINE_CHANNEL_SECRET" },
  telegram: { access: "TELEGRAM_BOT_TOKEN", webhook: "TELEGRAM_WEBHOOK_SECRET" },
  facebook: { access: "FACEBOOK_PAGE_ACCESS_TOKEN", webhook: "META_APP_SECRET" },
  instagram: { access: "INSTAGRAM_ACCESS_TOKEN", webhook: "META_APP_SECRET" }
};

export function buildReadinessSnapshot(env: EnvLike = process.env) {
  const apiMode = normalized(env.API_MODE, "local");
  const dataMode = normalized(env.DATA_MODE, "not_configured");
  const publicDataMode = normalized(env.NEXT_PUBLIC_DATA_MODE, "not_configured");
  const aiMode = normalized(env.AI_MODE, "mock");
  const channelMode = normalized(env.CHANNEL_MODE, "mock");
  const metaChannelMode = normalized(env.META_CHANNEL_MODE, "mock");
  const providerOutboundMode = normalized(env.PROVIDER_OUTBOUND_MODE, "disabled");
  const providerOutboundModeEnabled = providerOutboundMode === "real" || providerOutboundMode === "sandbox";
  const providerOutboundEnabled = normalized(env.PROVIDER_OUTBOUND_ENABLED, "false") === "true" && providerOutboundModeEnabled;
  const sandboxMode = normalized(env.PROVIDER_SANDBOX_MODE, "disabled");
  const sandboxEnabled = sandboxMode === "enabled";
  const allowlist = summarizeProviderSandboxAllowlist(env);
  const providerChannelEnabled = channelMode === "real" || channelMode === "sandbox" || metaChannelMode === "real" || metaChannelMode === "sandbox";
  const realOutboundEnabled = providerOutboundEnabled && sandboxEnabled && providerChannelEnabled && allowlist.configured;
  const databaseConfigured = configured(env.DATABASE_URL);
  const redisConfigured = configured(env.REDIS_URL);

  return {
    status: "ok" as const,
    service: "api" as const,
    time: new Date().toISOString(),
    externalCalls: 0 as const,
    apiMode: {
      apiMode,
      dataMode,
      publicDataMode,
      apiModeExplicit: configured(env.API_MODE),
      dataModeExplicit: configured(env.DATA_MODE),
      publicDataModeExplicit: configured(env.NEXT_PUBLIC_DATA_MODE),
      apiBaseConfigured: configured(env.NEXT_PUBLIC_API_BASE_URL ?? env.API_PUBLIC_BASE_URL)
    },
    dependencies: {
      databaseConfigured,
      redisConfigured
    },
    providerReadiness: {
      mode: providerOutboundMode,
      outboundEnabledByEnv: providerOutboundEnabled,
      sandboxMode,
      sandboxEnabled,
      channelMode,
      metaChannelMode,
      realOutboundEnabled,
      allowlistCount: allowlist.entryCount,
      externalCalls: 0 as const,
      allowlist: {
        configured: allowlist.configured,
        entryCount: allowlist.entryCount,
        globalEntryCount: allowlist.globalEntryCount,
        providers: allowlist.providers
      },
      providers: providerSandboxProviders.map((name) => providerReadiness(name, env, {
        providerOutboundEnabled,
        sandboxEnabled,
        providerChannelEnabled: providerChannelModeEnabled(name, channelMode, metaChannelMode),
        allowlistConfigured: allowlist.configured
      }))
    },
    monitoring: {
      auditSafetyBaseline: true,
      providerPayloadsExposed: false,
      externalCalls: 0 as const
    },
    checks: [
      check("api mode explicit", configured(env.API_MODE)),
      check("web data mode explicit", configured(env.NEXT_PUBLIC_DATA_MODE)),
      check("web API base configured", configured(env.NEXT_PUBLIC_API_BASE_URL ?? env.API_PUBLIC_BASE_URL)),
      check("database configured", databaseConfigured),
      check("redis configured", redisConfigured),
      check("provider outbound disabled", !realOutboundEnabled),
      check("provider outbound flag disabled by default", !providerOutboundEnabled),
      check("provider sandbox disabled by default", !sandboxEnabled),
      check("AI mode safe for pilot", aiMode === "mock")
    ]
  };
}

function providerReadiness(
  name: ProviderSandboxProvider,
  env: EnvLike,
  gates: { providerOutboundEnabled: boolean; sandboxEnabled: boolean; providerChannelEnabled: boolean; allowlistConfigured: boolean }
) {
  const keys = providerCredentials[name];
  const credentialConfigured = configured(env[keys.access]);
  const webhookConfigured = configured(env[keys.webhook]);
  const allowlist = summarizeProviderSandboxAllowlist(env).providers.find((provider) => provider.name === name);
  const allowlistConfigured = Boolean(allowlist && allowlist.entryCount > 0);
  return {
    name,
    configured: credentialConfigured,
    credentialStatus: credentialConfigured ? "configured" : "not_configured",
    webhookStatus: webhookConfigured ? "configured" : "not_configured",
    allowlistStatus: allowlistConfigured ? "configured" : "not_configured",
    allowlistEntryCount: allowlist?.entryCount ?? 0,
    allowlistCount: allowlist?.entryCount ?? 0,
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false,
    status: providerStatus(gates, allowlistConfigured)
  };
}

function providerStatus(
  gates: { providerOutboundEnabled: boolean; sandboxEnabled: boolean; providerChannelEnabled: boolean; allowlistConfigured: boolean },
  providerAllowlistConfigured: boolean
) {
  if (!gates.providerOutboundEnabled) return "disabled_by_default";
  if (!gates.sandboxEnabled) return "blocked_sandbox_required";
  if (!gates.providerChannelEnabled) return "blocked_channel_mode_required";
  if (!gates.allowlistConfigured || !providerAllowlistConfigured) return "blocked_allowlist_required";
  return "sandbox_ready_recipient_check_required";
}

function providerChannelModeEnabled(name: ProviderSandboxProvider, channelMode: string, metaChannelMode: string) {
  const mode = name === "facebook" || name === "instagram" ? metaChannelMode : channelMode;
  return mode === "real" || mode === "sandbox";
}

function check(name: string, ok: boolean) {
  return { name, ok };
}

function configured(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalized(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
