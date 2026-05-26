import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { BroadcastSuppressionReason } from "@ai-omni/shared";
import { Platform, Prisma } from "@prisma/client";
import { AuditService } from "./audit.service.js";
import { PrismaService } from "./prisma.service.js";

export type OutboundIntent = "support" | "marketing" | "automation";

export type OutboundConsentState = {
  optOut: boolean;
  optedOut?: boolean;
  doNotContact: boolean;
  marketingConsent?: boolean | null;
  consentStatus?: string | null;
  suppressedReason?: string;
  updatedAt?: Date;
};

export type OutboundConsentContext = {
  tenantId: string;
  contactId: string;
  customerId: string;
  conversationId: string | null;
  platform: Platform;
  channelAccountId: string | null;
  roomId: string | null;
  consent: OutboundConsentState;
};

export type OutboundConsentDecision = {
  blocked: boolean;
  reason: BroadcastSuppressionReason | null;
};

@Injectable()
export class OutboundConsentService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  async getContext(input: {
    tenantId: string;
    contactId: string;
    contactIdentityId?: string | null;
    platform: Platform;
    channelAccountId?: string | null;
    conversationId?: string | null;
  }): Promise<OutboundConsentContext> {
    const contact = await this.prisma.contact.findFirst({
      where: { tenantId: input.tenantId, id: input.contactId },
      select: { id: true }
    });
    if (!contact) throw new NotFoundException("Contact not found");

    const conversation = input.conversationId
      ? await this.prisma.conversation.findFirst({
          where: { tenantId: input.tenantId, id: input.conversationId },
          include: { room: true, contactIdentity: true }
        })
      : await this.prisma.conversation.findFirst({
          where: {
            tenantId: input.tenantId,
            OR: [
              { contactId: input.contactId },
              input.contactIdentityId ? { contactIdentityId: input.contactIdentityId } : { id: "__none__" }
            ],
            room: {
              platform: input.platform,
              ...(input.channelAccountId ? { channelAccountId: input.channelAccountId } : {})
            }
          },
          include: { room: true, contactIdentity: true },
          orderBy: { lastMessageAt: "desc" }
        });

    if (conversation && conversation.contactId !== input.contactId && conversation.contactIdentity.contactId !== input.contactId) {
      throw new NotFoundException("Conversation not found");
    }

    return {
      tenantId: input.tenantId,
      contactId: input.contactId,
      customerId: input.contactId,
      conversationId: conversation?.id ?? null,
      platform: conversation?.room.platform ?? input.platform,
      channelAccountId: conversation?.room.channelAccountId ?? input.channelAccountId ?? null,
      roomId: conversation?.roomId ?? null,
      consent: await this.getConsent(input.tenantId, input.contactId)
    };
  }

  async getConversationContext(input: {
    tenantId: string;
    conversationId: string;
    contactId: string;
    platform: Platform;
    channelAccountId: string;
    roomId: string;
  }): Promise<OutboundConsentContext> {
    return {
      tenantId: input.tenantId,
      contactId: input.contactId,
      customerId: input.contactId,
      conversationId: input.conversationId,
      platform: input.platform,
      channelAccountId: input.channelAccountId,
      roomId: input.roomId,
      consent: await this.getConsent(input.tenantId, input.contactId)
    };
  }

  decide(consent: OutboundConsentState, intent: OutboundIntent): OutboundConsentDecision {
    if (consent.doNotContact) return { blocked: true, reason: "do_not_contact" };
    if ((intent === "marketing" || intent === "automation") && (consent.optOut || consent.optedOut)) {
      return { blocked: true, reason: "marketing_opt_out" };
    }
    if ((intent === "marketing" || intent === "automation") && consent.marketingConsent === false) {
      return { blocked: true, reason: "consent_missing" };
    }
    if ((intent === "marketing" || intent === "automation") && isRevokedConsentStatus(consent.consentStatus)) {
      return { blocked: true, reason: "consent_revoked" };
    }
    return { blocked: false, reason: null };
  }

  async recordBlocked(input: {
    action: string;
    intent: OutboundIntent;
    actorUserId?: string | null;
    entityType: string;
    entityId?: string | null;
    context: OutboundConsentContext;
    reason: BroadcastSuppressionReason;
    metadata?: Prisma.InputJsonObject;
  }) {
    return this.audit.record({
      tenantId: input.context.tenantId,
      actorUserId: input.actorUserId ?? null,
      conversationId: input.context.conversationId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? input.context.conversationId ?? input.context.contactId,
      metadata: {
        actionType: input.action,
        blocked: true,
        blockedReason: input.reason,
        intent: input.intent,
        tenantId: input.context.tenantId,
        customerId: input.context.customerId,
        contactId: input.context.contactId,
        conversationId: input.context.conversationId,
        platform: input.context.platform,
        channelAccountId: input.context.channelAccountId,
        roomId: input.context.roomId,
        consent: consentSnapshot(input.context.consent),
        externalCalls: 0,
        ...(input.metadata ?? {})
      }
    });
  }

  private async getConsent(tenantId: string, contactId: string): Promise<OutboundConsentState> {
    const latest = await this.prisma.auditLog.findFirst({
      where: {
        tenantId,
        entityType: "contact",
        entityId: contactId,
        action: { in: ["contact.broadcast_consent_updated", "customer360.consent_updated"] }
      },
      orderBy: { createdAt: "desc" }
    });
    if (!latest) return { optOut: false, doNotContact: false };

    const after = readObject(latest.afterJson);
    const metadata = readObject(latest.metadataJson ?? latest.metadata);
    const next = readObject(metadata.next);
    const optOut = Boolean(after.optOut ?? after.optedOut ?? next.optOut ?? next.optedOut);
    const optedOut = Boolean(after.optedOut ?? next.optedOut ?? optOut);
    const doNotContact = Boolean(after.doNotContact ?? next.doNotContact);
    const marketingConsent = booleanOrNull(after.marketingConsent ?? next.marketingConsent);
    const consentStatus = stringOrNull(after.consentStatus ?? next.consentStatus);
    const suppressedReason = typeof after.suppressedReason === "string"
      ? after.suppressedReason
      : typeof next.suppressedReason === "string"
        ? next.suppressedReason
        : undefined;
    return {
      optOut,
      optedOut,
      doNotContact,
      marketingConsent,
      consentStatus,
      suppressedReason: doNotContact ? "do_not_contact" : optOut ? suppressedReason ?? "customer_requested" : undefined,
      updatedAt: latest.createdAt
    };
  }
}

export function consentSnapshot(consent: OutboundConsentState): Prisma.InputJsonObject {
  return {
    optOut: Boolean(consent.optOut),
    optedOut: Boolean(consent.optedOut ?? consent.optOut),
    doNotContact: Boolean(consent.doNotContact),
    marketingConsent: consent.marketingConsent ?? null,
    consentStatus: consent.consentStatus ?? null,
    suppressedReason: consent.doNotContact ? "do_not_contact" : consent.optOut ? consent.suppressedReason ?? "customer_requested" : null,
    externalCalls: 0
  };
}

function isRevokedConsentStatus(value: string | null | undefined) {
  return ["revoked", "withdrawn", "denied", "unsubscribed"].includes(String(value ?? "").trim().toLowerCase());
}

function booleanOrNull(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
