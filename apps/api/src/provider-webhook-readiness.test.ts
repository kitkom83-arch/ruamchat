import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  verifyLineWebhookSignatureReadiness,
  verifyMetaWebhookSignatureReadiness,
  verifyTelegramWebhookSecretReadiness
} from "./provider-webhook-readiness.js";

describe("provider webhook readiness helpers", () => {
  it("accepts a valid fake LINE signature without exposing the secret or signature", () => {
    const rawBody = Buffer.from(JSON.stringify({ events: [{ type: "message" }] }));
    const channelSecret = "fake-line-channel-secret-for-test";
    const signature = crypto.createHmac("sha256", channelSecret).update(rawBody).digest("base64");

    const result = verifyLineWebhookSignatureReadiness({ rawBody, signature, channelSecret });

    expect(result).toMatchObject({ provider: "line", configured: true, valid: true, status: "valid" });
    expect(JSON.stringify(result)).not.toContain(channelSecret);
    expect(JSON.stringify(result)).not.toContain(signature);
  });

  it("rejects an invalid fake LINE signature without exposing inputs", () => {
    const rawBody = Buffer.from("{}");
    const channelSecret = "fake-line-channel-secret-for-test";

    const result = verifyLineWebhookSignatureReadiness({ rawBody, signature: "invalid-signature", channelSecret });

    expect(result).toMatchObject({ provider: "line", configured: true, valid: false, status: "invalid" });
    expect(JSON.stringify(result)).not.toContain(channelSecret);
    expect(JSON.stringify(result)).not.toContain("invalid-signature");
  });

  it("accepts a valid fake Telegram webhook secret without exposing the secret", () => {
    const webhookSecret = "fake-telegram-webhook-secret-for-test";

    const result = verifyTelegramWebhookSecretReadiness({ secretToken: webhookSecret, webhookSecret });

    expect(result).toMatchObject({ provider: "telegram", configured: true, valid: true, status: "valid" });
    expect(JSON.stringify(result)).not.toContain(webhookSecret);
  });

  it("accepts a valid fake Meta signature and rejects an invalid one without exposing secrets", () => {
    const rawBody = Buffer.from(JSON.stringify({ object: "page" }));
    const appSecret = "fake-meta-app-secret-for-test";
    const signature = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;

    const valid = verifyMetaWebhookSignatureReadiness({ provider: "facebook", rawBody, signature, appSecret });
    const invalid = verifyMetaWebhookSignatureReadiness({ provider: "instagram", rawBody, signature: "sha256=invalid", appSecret });

    expect(valid).toMatchObject({ provider: "facebook", configured: true, valid: true, status: "valid" });
    expect(invalid).toMatchObject({ provider: "instagram", configured: true, valid: false, status: "invalid" });
    expect(JSON.stringify({ valid, invalid })).not.toContain(appSecret);
    expect(JSON.stringify({ valid, invalid })).not.toContain(signature);
  });
});
