import type { ProviderSandboxProvider } from "@ai-omni/shared";
import type { OutboundPlatform, ProviderOutboundGuardInput } from "./outbound-sender.js";

export type OutboundMessageContext = {
  platform: OutboundPlatform;
  tenantId: string;
  channelAccountId: string;
  channelAccountTenantId: string | null;
  externalUserId: string;
  externalConversationId: string | null;
};

const providerPlatforms: Record<Exclude<OutboundPlatform, "webchat">, ProviderSandboxProvider> = {
  line: "line",
  telegram: "telegram",
  facebook: "facebook",
  instagram: "instagram"
};

export function providerForPlatform(platform: OutboundPlatform): ProviderSandboxProvider | null {
  if (platform === "webchat") return null;
  return providerPlatforms[platform];
}

export function recipientIdForPlatform(context: OutboundMessageContext): string {
  if (context.platform === "telegram") {
    return context.externalConversationId ?? context.externalUserId;
  }
  return context.externalUserId;
}

export function buildProviderGuardInput(context: OutboundMessageContext): ProviderOutboundGuardInput | null {
  const provider = providerForPlatform(context.platform);
  if (!provider) return null;

  return {
    provider,
    recipientId: recipientIdForPlatform(context),
    tenantId: context.tenantId,
    channelAccountId: context.channelAccountId,
    channelAccountTenantId: context.channelAccountTenantId
  };
}
