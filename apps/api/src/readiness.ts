type EnvLike = Record<string, string | undefined>;

type ProviderName = "line" | "telegram" | "facebook" | "instagram";

const providerCredentials: Record<ProviderName, { access: string; webhook: string }> = {
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
  const realOutboundEnabled = providerOutboundMode === "real" && (channelMode === "real" || metaChannelMode === "real");
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
      channelMode,
      metaChannelMode,
      realOutboundEnabled,
      providers: (Object.keys(providerCredentials) as ProviderName[]).map((name) => providerReadiness(name, env, realOutboundEnabled))
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
      check("AI mode safe for pilot", aiMode === "mock")
    ]
  };
}

function providerReadiness(name: ProviderName, env: EnvLike, realOutboundEnabled: boolean) {
  const keys = providerCredentials[name];
  return {
    name,
    credentialConfigured: configured(env[keys.access]),
    webhookConfigured: configured(env[keys.webhook]),
    outboundEnabled: false,
    status: realOutboundEnabled ? "blocked_real_outbound" : "safe_readiness_only"
  };
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
