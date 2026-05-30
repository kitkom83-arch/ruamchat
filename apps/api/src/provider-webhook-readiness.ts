import crypto from "node:crypto";

export type ProviderWebhookProvider = "line" | "telegram" | "facebook" | "instagram";

export type ProviderWebhookVerificationResult = {
  provider: ProviderWebhookProvider;
  configured: boolean;
  valid: boolean;
  status: "valid" | "not_configured" | "missing_input" | "invalid";
};

export function verifyLineWebhookSignatureReadiness(input: {
  rawBody?: Buffer | string;
  signature?: string;
  channelSecret?: string | null;
}): ProviderWebhookVerificationResult {
  const secret = input.channelSecret?.trim();
  if (!secret) return result("line", false, false, "not_configured");
  if (!input.rawBody || !input.signature) return result("line", true, false, "missing_input");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(toBuffer(input.rawBody))
    .digest("base64");

  return result("line", true, safeEqual(input.signature, expected), safeEqual(input.signature, expected) ? "valid" : "invalid");
}

export function verifyTelegramWebhookSecretReadiness(input: {
  secretToken?: string;
  webhookSecret?: string | null;
}): ProviderWebhookVerificationResult {
  const secret = input.webhookSecret?.trim();
  if (!secret) return result("telegram", false, false, "not_configured");
  if (!input.secretToken) return result("telegram", true, false, "missing_input");

  const valid = safeEqual(input.secretToken, secret);
  return result("telegram", true, valid, valid ? "valid" : "invalid");
}

export function verifyMetaWebhookSignatureReadiness(input: {
  provider: Extract<ProviderWebhookProvider, "facebook" | "instagram">;
  rawBody?: Buffer | string;
  signature?: string;
  appSecret?: string | null;
}): ProviderWebhookVerificationResult {
  const secret = input.appSecret?.trim();
  if (!secret) return result(input.provider, false, false, "not_configured");
  if (!input.rawBody || !input.signature) return result(input.provider, true, false, "missing_input");

  const expected = `sha256=${crypto.createHmac("sha256", secret).update(toBuffer(input.rawBody)).digest("hex")}`;
  const valid = safeEqual(input.signature, expected);
  return result(input.provider, true, valid, valid ? "valid" : "invalid");
}

function result(provider: ProviderWebhookProvider, configured: boolean, valid: boolean, status: ProviderWebhookVerificationResult["status"]) {
  return { provider, configured, valid, status };
}

function toBuffer(value: Buffer | string) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value);
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}
