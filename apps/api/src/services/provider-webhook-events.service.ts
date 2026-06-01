import crypto from "node:crypto";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  providerWebhookSandboxEventRequestSchema,
  type ProviderWebhookEvent,
  type ProviderWebhookSandboxEventRequest
} from "@ai-omni/shared";
import { AuditService } from "./audit.service.js";

const maxStoredEvents = 100;
const events: ProviderWebhookEvent[] = [];
const dedupFirstSeenAtByDigest = new Map<string, string>();

@Injectable()
export class ProviderWebhookEventsService {
  constructor(@Inject(AuditService) private readonly audit: AuditService) {}

  list(tenantId: string) {
    return events.filter((event) => event.tenantId === tenantId);
  }

  async create(tenantId: string, body: unknown, actorUserId?: string) {
    rejectLiveProviderMode();
    const parsed = providerWebhookSandboxEventRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException("Invalid provider webhook sandbox event");
    }

    const input = parsed.data;
    const payload = summarizePayload(input.payload);
    const signature = verifySandboxSignature(input);
    const replay = checkReplayGuardrail(tenantId, input);
    const receivedAt = new Date().toISOString();
    const event: ProviderWebhookEvent = {
      id: `provider-webhook-event-${crypto.randomUUID()}`,
      tenantId,
      provider: input.provider,
      channel: input.channel ?? input.provider,
      eventType: input.eventType,
      mode: input.mode,
      status: signature.signatureStatus === "failed" ? "failed" : input.status,
      receivedAt,
      payloadSummary: payload.summary,
      payloadFieldCount: payload.fieldCount,
      payloadDigest: payload.digest,
      signatureVerified: signature.signatureVerified,
      signatureStatus: signature.signatureStatus,
      signatureAlgorithm: signature.signatureAlgorithm,
      signatureFingerprint: signature.signatureFingerprint,
      signedAt: input.timestamp ?? null,
      replayDetected: replay.replayDetected,
      replayStatus: replay.replayStatus,
      dedupKeyDigest: replay.dedupKeyDigest,
      previousEventSeenAt: replay.previousEventSeenAt,
      externalCalls: 0
    };

    events.unshift(event);
    events.splice(maxStoredEvents);
    void this.recordAudit(event, actorUserId);
    return event;
  }

  private async recordAudit(event: ProviderWebhookEvent, actorUserId?: string) {
    try {
      await this.audit.record({
        tenantId: event.tenantId,
        actorUserId,
        action: "provider_webhook.sandbox_event_received",
        entityType: "provider_webhook_event",
        entityId: event.id,
        metadata: {
          provider: event.provider,
          channel: event.channel,
          eventType: event.eventType,
          mode: event.mode,
          status: event.status,
          payloadSummary: event.payloadSummary,
          payloadFieldCount: event.payloadFieldCount,
          payloadDigest: event.payloadDigest,
          signatureVerified: event.signatureVerified,
          signatureStatus: event.signatureStatus,
          signatureAlgorithm: event.signatureAlgorithm,
          signatureFingerprint: event.signatureFingerprint,
          signedAt: event.signedAt,
          replayDetected: event.replayDetected,
          replayStatus: event.replayStatus,
          dedupKeyDigest: event.dedupKeyDigest,
          previousEventSeenAt: event.previousEventSeenAt,
          externalCalls: 0
        }
      });
    } catch {
      // Sandbox event intake must not fail just because optional audit persistence is unavailable.
    }
  }
}

export function resetProviderWebhookEventStoreForTest() {
  events.splice(0);
  dedupFirstSeenAtByDigest.clear();
}

export function getProviderWebhookGuardrailReadinessSnapshot() {
  const latest = events[0] ?? null;
  return {
    webhookSignatureVerificationConfigured: true,
    webhookSignatureVerificationReady: true,
    replayGuardrailsEnabled: true,
    lastSandboxEventSignatureStatus: latest?.signatureStatus ?? null,
    latestReplayStatus: latest?.replayStatus ?? null,
    replayDetectedCount: events.filter((event) => event.replayDetected).length,
    lastSandboxEventAt: latest?.receivedAt ?? null
  };
}

function rejectLiveProviderMode() {
  const providerOutboundMode = normalized(process.env.PROVIDER_OUTBOUND_MODE, "disabled");
  const channelMode = normalized(process.env.CHANNEL_MODE, "mock");
  const metaChannelMode = normalized(process.env.META_CHANNEL_MODE, "mock");
  if (providerOutboundMode === "real" || channelMode === "real" || metaChannelMode === "real") {
    throw new BadRequestException("Provider webhook sandbox events are disabled while live provider mode is active");
  }
}

function summarizePayload(payload: ProviderWebhookSandboxEventRequest["payload"]) {
  const descriptor = describePayload(payload);
  const fieldCount = countSafePayloadFields(payload);
  const digest = crypto.createHash("sha256").update(JSON.stringify(descriptor)).digest("hex").slice(0, 24);
  const kind = payload === null ? "null" : Array.isArray(payload) ? "array" : typeof payload;
  const summary = kind === "object" || kind === "array"
    ? `Dry-run ${kind} payload accepted with ${fieldCount} safe fields.`
    : `Dry-run ${kind} payload accepted.`;
  return {
    summary,
    fieldCount,
    digest: `sha256:${digest}`
  };
}

function verifySandboxSignature(input: ProviderWebhookSandboxEventRequest) {
  const signature = input.signature?.trim();
  if (!signature) {
    return {
      signatureVerified: false,
      signatureStatus: "missing" as const,
      signatureAlgorithm: "hmac-sha256" as const,
      signatureFingerprint: null
    };
  }

  const expected = crypto
    .createHmac("sha256", sandboxSigningMaterial(input.provider))
    .update(canonicalJson(input.payload ?? null))
    .digest("hex");
  const normalizedSignature = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;
  const verified = safeEqual(normalizedSignature, expected);

  return {
    signatureVerified: verified,
    signatureStatus: verified ? "verified" as const : "failed" as const,
    signatureAlgorithm: "hmac-sha256" as const,
    signatureFingerprint: `sha256:${crypto.createHash("sha256").update(`provider-webhook:${signature}`).digest("hex").slice(0, 16)}`
  };
}

function checkReplayGuardrail(tenantId: string, input: ProviderWebhookSandboxEventRequest) {
  const dedupIdentifier = input.eventId ?? input.deliveryId;
  if (!dedupIdentifier) {
    return {
      replayDetected: false,
      replayStatus: "fresh" as const,
      dedupKeyDigest: null,
      previousEventSeenAt: null
    };
  }

  const channel = input.channel ?? input.provider;
  const dedupKeyDigest = `sha256:${crypto
    .createHash("sha256")
    .update(canonicalJson({ tenantId, provider: input.provider, channel, dedupIdentifier }))
    .digest("hex")
    .slice(0, 24)}`;
  const previousEventSeenAt = dedupFirstSeenAtByDigest.get(dedupKeyDigest) ?? null;
  if (!previousEventSeenAt) {
    dedupFirstSeenAtByDigest.set(dedupKeyDigest, new Date().toISOString());
  }

  return {
    replayDetected: Boolean(previousEventSeenAt),
    replayStatus: previousEventSeenAt ? "duplicate" as const : "fresh" as const,
    dedupKeyDigest,
    previousEventSeenAt
  };
}

function describePayload(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[depth-limit]";
  if (value === null) return "null";
  if (Array.isArray(value)) return value.slice(0, 10).map((item) => describePayload(item, depth + 1));
  if (typeof value !== "object") return typeof value;

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>).slice(0, 50)) {
    if (isUnsafePayloadKey(key)) continue;
    output[key] = describePayload(child, depth + 1);
  }
  return output;
}

function countSafePayloadFields(value: unknown, depth = 0): number {
  if (depth > 6 || value === null || value === undefined) return 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countSafePayloadFields(item, depth + 1), 0);
  if (typeof value !== "object") return 0;

  let count = 0;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (isUnsafePayloadKey(key)) continue;
    count += 1 + countSafePayloadFields(child, depth + 1);
  }
  return count;
}

function isUnsafePayloadKey(key: string) {
  return /token|secret|signature|authorization|cookie|providerraw|rawpayload|payloadjson|allowlist/i.test(key);
}

function sandboxSigningMaterial(provider: ProviderWebhookSandboxEventRequest["provider"]) {
  const providerEnvName = `${provider.toUpperCase()}_SANDBOX_WEBHOOK_SIGNING_KEY`;
  return process.env[providerEnvName]?.trim()
    || process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY?.trim()
    || "local-provider-webhook-sandbox-signing-material";
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function normalized(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
