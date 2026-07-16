import { describe, expect, it } from "vitest";
import {
  buildProviderGuardInput,
  providerForPlatform,
  recipientIdForPlatform,
  type OutboundMessageContext
} from "./outbound-guard.js";

const baseContext: OutboundMessageContext = {
  platform: "line",
  tenantId: "00000000-0000-4000-8000-000000000001",
  channelAccountId: "00000000-0000-4000-8000-000000000022",
  channelAccountTenantId: "00000000-0000-4000-8000-000000000001",
  externalUserId: "U123",
  externalConversationId: null
};

describe("outbound guard mapping", () => {
  it("maps provider platforms to sandbox providers and skips webchat", () => {
    expect(providerForPlatform("line")).toBe("line");
    expect(providerForPlatform("telegram")).toBe("telegram");
    expect(providerForPlatform("facebook")).toBe("facebook");
    expect(providerForPlatform("instagram")).toBe("instagram");
    expect(providerForPlatform("webchat")).toBeNull();
  });

  it("uses external user id for line/facebook/instagram recipients", () => {
    expect(recipientIdForPlatform({ ...baseContext, platform: "line" })).toBe("U123");
    expect(recipientIdForPlatform({ ...baseContext, platform: "facebook" })).toBe("U123");
    expect(recipientIdForPlatform({ ...baseContext, platform: "instagram" })).toBe("U123");
  });

  it("prefers external conversation id for telegram recipients", () => {
    expect(
      recipientIdForPlatform({ ...baseContext, platform: "telegram", externalConversationId: "55201" })
    ).toBe("55201");
    expect(
      recipientIdForPlatform({ ...baseContext, platform: "telegram", externalConversationId: null, externalUserId: "42" })
    ).toBe("42");
  });

  it("builds a complete provider guard input for a real platform", () => {
    const input = buildProviderGuardInput(baseContext);
    expect(input).toEqual({
      provider: "line",
      recipientId: "U123",
      tenantId: baseContext.tenantId,
      channelAccountId: baseContext.channelAccountId,
      channelAccountTenantId: baseContext.channelAccountTenantId
    });
  });

  it("returns null guard input for webchat so it never hits provider push", () => {
    expect(buildProviderGuardInput({ ...baseContext, platform: "webchat" })).toBeNull();
  });
});
