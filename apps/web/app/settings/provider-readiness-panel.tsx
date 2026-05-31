import React from "react";
import { RadioTower, ShieldCheck } from "lucide-react";
import type { ProviderReadiness, ProviderReadinessProvider } from "@ai-omni/shared";

type ProviderReadinessPanelProps = {
  readiness: ProviderReadiness | null;
  loading: boolean;
  error: string;
};

export function ProviderReadinessPanel({ readiness, loading, error }: ProviderReadinessPanelProps) {
  return e("section", { className: "providerReadinessPanel", "aria-label": "Provider sandbox and webhook readiness" },
    e("div", { className: "providerReadinessHeader" },
      e("div", { className: "channelPanelTop" },
        e(ShieldCheck, { size: 20 }),
        e("div", null,
          e("h2", null, "Provider sandbox readiness"),
          e("p", null, "Safe configuration summary only. No token, secret, payload, or allowlist value is displayed.")
        )
      ),
      readiness ? e("div", { className: "providerReadinessSummary", "aria-label": "Provider readiness summary" },
        e("span", null, `provider mode: ${readiness.mode}`),
        e("span", null, `sandbox mode: ${readiness.sandboxMode}`),
        e("span", null, `realOutboundEnabled=${String(readiness.realOutboundEnabled)}`),
        e("span", null, `externalCalls=${readiness.externalCalls}`),
        e("span", null, `allowlist count=${readiness.allowlistCount}`)
      ) : null
    ),
    error ? e("div", { className: "apiErrorBox compact", role: "alert" }, error) : null,
    loading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider readiness...") : null,
    !loading && !error && !readiness ? e("div", { className: "providerEmptyState" }, "No provider readiness data returned.") : null,
    readiness ? e("div", { className: "providerReadinessGrid" },
      ...readiness.providers.map((provider) => e(ProviderReadinessCard, { key: provider.name, provider }))
    ) : null
  );
}

function ProviderReadinessCard({ provider }: { provider: ProviderReadinessProvider }) {
  return e("article", { className: "providerReadinessCard" },
    e("div", { className: "channelPanelTop" },
      e(RadioTower, { size: 18 }),
      e("div", null,
        e("h3", null, providerLabel(provider.name)),
        e("p", null, provider.status)
      )
    ),
    e("dl", { className: "channelMeta providerReadinessMeta" },
      definition("Credential", formatStatus(provider.credentialStatus)),
      definition("Webhook verification", provider.webhookVerificationConfigured ? "configured" : "not configured"),
      definition("Webhook secret", formatStatus(provider.webhookStatus)),
      definition("Allowlist", `${provider.allowlistCount} entries`),
      definition("Outbound enabled", String(provider.outboundEnabled))
    )
  );
}

function definition(label: string, value: string) {
  return e("div", { key: label },
    e("dt", null, label),
    e("dd", null, value)
  );
}

function providerLabel(provider: ProviderReadinessProvider["name"]) {
  const labels: Record<ProviderReadinessProvider["name"], string> = {
    line: "LINE",
    telegram: "Telegram",
    facebook: "Facebook",
    instagram: "Instagram"
  };
  return labels[provider];
}

function formatStatus(status: ProviderReadinessProvider["credentialStatus"]) {
  return status === "configured" ? "configured" : "not configured";
}

const e = React.createElement;
