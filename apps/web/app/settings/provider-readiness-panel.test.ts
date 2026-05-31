import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ProviderReadiness } from "@ai-omni/shared";
import { ProviderReadinessPanel } from "./provider-readiness-panel";

describe("ProviderReadinessPanel", () => {
  it("renders provider readiness status safely without secrets or allowlist values", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: ""
    }));

    expect(html).toContain("Provider sandbox readiness");
    expect(html).toContain("provider mode: disabled");
    expect(html).toContain("sandbox mode: disabled");
    expect(html).toContain("realOutboundEnabled=false");
    expect(html).toContain("externalCalls=0");
    expect(html).toContain("allowlist count=2");
    expect(html).toContain("LINE");
    expect(html).toContain("Telegram");
    expect(html).toContain("Webhook verification");
    expect(html).toContain("configured");
    expect(html).not.toContain("U-raw-provider-test");
    expect(html).not.toContain("raw-line-token");
    expect(html).not.toMatch(/channel secret|webhook secret value|providerRaw|rawPayload|payloadJson|Bearer|sk-/i);
  });

  it("renders an API error state without fake provider rows", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: null,
      loading: false,
      error: "Provider Readiness API error: Failed to fetch"
    }));

    expect(html).toContain("Provider Readiness API error: Failed to fetch");
    expect(html).not.toContain("LINE");
    expect(html).not.toContain("Telegram");
    expect(html).not.toContain("allowlist count=");
  });
});

function providerReadiness(): ProviderReadiness {
  return {
    mode: "disabled",
    outboundEnabledByEnv: false,
    sandboxMode: "disabled",
    sandboxEnabled: false,
    channelMode: "mock",
    metaChannelMode: "mock",
    realOutboundEnabled: false,
    allowlistCount: 2,
    externalCalls: 0,
    allowlist: {
      configured: true,
      entryCount: 2,
      globalEntryCount: 0,
      providers: [
        { name: "line", entryCount: 1 },
        { name: "telegram", entryCount: 1 },
        { name: "facebook", entryCount: 0 },
        { name: "instagram", entryCount: 0 }
      ]
    },
    providers: [
      provider("line", true, true, 1),
      provider("telegram", true, true, 1),
      provider("facebook", false, false, 0),
      provider("instagram", false, false, 0)
    ]
  };
}

function provider(name: ProviderReadiness["providers"][number]["name"], configured: boolean, webhookConfigured: boolean, allowlistCount: number) {
  return {
    name,
    configured,
    credentialStatus: configured ? "configured" as const : "not_configured" as const,
    webhookStatus: webhookConfigured ? "configured" as const : "not_configured" as const,
    allowlistStatus: allowlistCount > 0 ? "configured" as const : "not_configured" as const,
    allowlistEntryCount: allowlistCount,
    allowlistCount,
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false as const,
    status: "disabled_by_default" as const
  };
}
