import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateContactRequest,
  LinkContactIdentityRequest,
  SetPrimaryIdentityRequest,
  UpdateBroadcastConsentRequest,
  UpdateContactRequest,
  UnlinkContactIdentityRequest
} from "@ai-omni/shared";
import { ConversationPriority, ConversationStatus, Platform, Prisma } from "@prisma/client";
import { AuditService } from "./audit.service.js";
import { PrismaService } from "./prisma.service.js";

@Injectable()
export class CustomerService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  async listContacts(tenantId: string) {
    const contacts = await this.prisma.contact.findMany({
      where: { tenantId },
      include: {
        identities: { include: { channelAccount: true } },
        tags: { include: { tag: true } },
        tasks: { orderBy: { createdAt: "desc" }, take: 5 }
      },
      orderBy: [{ updatedAt: "desc" }, { displayName: "asc" }]
    });
    const notesByContactId = await this.getNotesByContactId(tenantId, contacts.map((contact) => contact.id));
    const consentByContactId = await this.getBroadcastConsentByContactIds(tenantId, contacts.map((contact) => contact.id));
    return contacts.map((contact) => mapContact(contact, notesByContactId.get(contact.id) ?? [], contact.tasks, consentByContactId.get(contact.id)));
  }

  async getContact(tenantId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { tenantId, id: contactId },
      include: {
        identities: { include: { channelAccount: true } },
        tags: { include: { tag: true } },
        tasks: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    });
    if (!contact) throw new NotFoundException("Contact not found");
    const notesByContactId = await this.getNotesByContactId(tenantId, [contact.id]);
    const consentByContactId = await this.getBroadcastConsentByContactIds(tenantId, [contact.id]);
    return mapContact(contact, notesByContactId.get(contact.id) ?? [], contact.tasks, consentByContactId.get(contact.id));
  }

  async getContactIdentities(tenantId: string, contactId: string) {
    await this.ensureContact(tenantId, contactId);
    const identities = await this.prisma.contactIdentity.findMany({
      where: { tenantId, contactId },
      include: { channelAccount: true },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }]
    });
    return identities.map((identity) => mapIdentity(identity));
  }

  async getContactConversations(tenantId: string, contactId: string) {
    await this.ensureContact(tenantId, contactId);
    const identities = await this.prisma.contactIdentity.findMany({
      where: { tenantId, contactId },
      select: { id: true }
    });
    const identityIds = identities.map((identity) => identity.id);
    const conversations = await this.prisma.conversation.findMany({
      where: {
        tenantId,
        OR: [
          { contactId },
          identityIds.length > 0 ? { contactIdentityId: { in: identityIds } } : { id: "__none__" }
        ]
      },
      include: {
        contact: { include: { identities: true, tags: { include: { tag: true } } } },
        contactIdentity: true,
        assignedUser: true,
        room: { include: { channelAccount: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 }
      },
      orderBy: { lastMessageAt: "desc" }
    });
    return conversations.map(mapConversationCard);
  }

  async getCustomer360(tenantId: string, conversationId: string) {
    const selected = await this.prisma.conversation.findFirst({
      where: { tenantId, id: conversationId },
      include: {
        assignedUser: true,
        room: { include: { channelAccount: true } },
        contactIdentity: {
          include: {
            channelAccount: true,
            contact: {
              include: {
                identities: { include: { channelAccount: true } },
                tags: { include: { tag: true } }
              }
            }
          }
        },
        contact: {
          include: {
            identities: { include: { channelAccount: true } },
            tags: { include: { tag: true } }
          }
        }
      }
    });
    if (!selected) throw new NotFoundException("Conversation not found");

    const contact = selected.contactIdentity.contact ?? selected.contact;
    const identityIds = contact.identities.map((identity) => identity.id);
    const recentConversations = await this.prisma.conversation.findMany({
      where: {
        tenantId,
        OR: [
          { contactId: contact.id },
          identityIds.length > 0 ? { contactIdentityId: { in: identityIds } } : { id: "__none__" }
        ]
      },
      include: {
        contact: { include: { identities: true, tags: { include: { tag: true } } } },
        contactIdentity: true,
        assignedUser: true,
        room: { include: { channelAccount: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 }
      },
      orderBy: { lastMessageAt: "desc" },
      take: 8
    });
    const conversationIds = recentConversations.map((conversation) => conversation.id);
    const notes = conversationIds.length > 0
      ? await this.prisma.internalNote.findMany({
          where: { tenantId, conversationId: { in: conversationIds } },
          orderBy: { createdAt: "desc" },
          take: 8
        })
      : [];
    const tasks = conversationIds.length > 0
      ? await this.prisma.task.findMany({
          where: { tenantId, conversationId: { in: conversationIds } },
          orderBy: { createdAt: "desc" },
          take: 8
        })
      : [];

    const consentByContactId = await this.getBroadcastConsentByContactIds(tenantId, [contact.id]);
    const broadcastConsent = consentByContactId.get(contact.id);
    const broadcastHistorySummary = await this.getBroadcastHistorySummary(tenantId, contact.id, identityIds, selected, broadcastConsent);
    const mappedIdentities = contact.identities.map((identity) => mapIdentity(identity));
    const mappedNotes = notes.map((note) => ({
      id: note.id,
      contactId: contact.id,
      body: note.body,
      createdBy: note.authorUserId ?? "system",
      createdAt: note.createdAt.toISOString()
    }));
    const conversationById = new Map(recentConversations.map((conversation) => [conversation.id, conversation]));
    const mappedTasks = tasks.map((task) => mapCustomer360Task(task, conversationById.get(task.conversationId)));
    const mappedContact = {
      id: contact.id,
      displayName: contact.displayName || selected.contactIdentity.displayName || "-",
      phone: contact.phone ?? undefined,
      email: contact.email ?? undefined,
      leadStatus: contact.leadStatus as ReturnType<typeof mapLeadStatus>,
      ownerAgent: selected.assignedUser?.name ?? contact.ownerUserId ?? undefined,
      tags: contact.tags.map((item) => item.tag.name),
      customFields: {},
      identities: mappedIdentities,
      notes: mappedNotes,
      tasks: mappedTasks,
      optOutBroadcast: Boolean(broadcastConsent?.optOut),
      suppressedReason: broadcastConsent?.suppressedReason,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    };

    return {
      selectedConversationId: selected.id,
      contact: mappedContact,
      owner: selected.assignedUser?.name ?? contact.ownerUserId ?? null,
      priority: mapPriority(selected.priority),
      status: mapStatus(selected.status, selected.followUpAt),
      ...mapSlaFields(selected),
      identities: mappedIdentities,
      recentConversations: recentConversations.map(mapConversationCard),
      notes: mappedNotes,
      tasks: mappedTasks,
      broadcastHistorySummary,
      source: {
        platform: selected.room.platform,
        channelAccountId: selected.room.channelAccountId,
        accountName: selected.room.channelAccount.displayName,
        externalUserId: selected.contactIdentity.externalUserId,
        displayName: selected.contactIdentity.displayName ?? selected.contact.displayName ?? "-"
      }
    };
  }

  async createContact(tenantId: string, request: CreateContactRequest, actorUserId?: string) {
    const contact = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.contact.create({
        data: {
          tenantId,
          displayName: request.displayName,
          email: request.email,
          phone: request.phone,
          leadStatus: request.leadStatus ?? "new",
          ownerUserId: request.ownerUserId
        }
      });
      await this.replaceTags(tx, tenantId, saved.id, request.tags ?? []);
      if (request.identity) {
        await this.linkIdentityTx(tx, tenantId, saved.id, request.identity);
      }
      return saved;
    });
    await this.recordContactAudit({
      tenantId,
      actorUserId,
      contactId: contact.id,
      action: "contact.created",
      metadata: {
        contactId: contact.id,
        displayName: request.displayName,
        leadStatus: request.leadStatus ?? "new",
        tags: request.tags ?? [],
        identity: request.identity ? safeIdentityRequest(request.identity) : null,
        externalCalls: 0
      }
    });
    return this.getContact(tenantId, contact.id);
  }

  async updateContact(tenantId: string, contactId: string, request: UpdateContactRequest, actorUserId?: string) {
    const before = await this.getContact(tenantId, contactId);
    await this.prisma.$transaction(async (tx) => {
      await tx.contact.update({
        where: { id: contactId },
        data: {
          displayName: request.displayName,
          email: request.email === undefined ? undefined : request.email,
          phone: request.phone === undefined ? undefined : request.phone,
          leadStatus: request.leadStatus,
          ownerUserId: request.ownerUserId === undefined ? undefined : request.ownerUserId
        }
      });
      if (request.tags) await this.replaceTags(tx, tenantId, contactId, request.tags);
    });
    const after = await this.getContact(tenantId, contactId);
    await this.recordContactAudit({
      tenantId,
      actorUserId,
      contactId,
      action: "contact.updated",
      beforeJson: contactAuditSnapshot(before),
      afterJson: contactAuditSnapshot(after),
      metadata: {
        contactId,
        changedFields: Object.keys(request),
        externalCalls: 0
      }
    });
    return after;
  }

  async linkIdentity(tenantId: string, contactId: string, request: LinkContactIdentityRequest, actorUserId?: string) {
    await this.ensureContact(tenantId, contactId);
    const beforeIdentity = await this.findIdentityForLinkRequest(tenantId, request);
    const beforeContactId = beforeIdentity?.contactId ?? null;
    await this.prisma.$transaction(async (tx) => {
      await this.linkIdentityTx(tx, tenantId, contactId, request);
    });
    const linkedIdentity = await this.findIdentityForLinkRequest(tenantId, request);
    if (linkedIdentity) {
      await this.recordContactAudit({
        tenantId,
        actorUserId,
        contactId,
        identityId: linkedIdentity.id,
        action: "contact.identity_linked",
        beforeJson: beforeIdentity ? identityAuditSnapshot(beforeIdentity) : null,
        afterJson: identityAuditSnapshot(linkedIdentity),
        metadata: {
          contactId,
          identityId: linkedIdentity.id,
          previousContactId: beforeContactId,
          platform: linkedIdentity.platform,
          channelAccountId: linkedIdentity.channelAccountId,
          externalUserId: linkedIdentity.externalUserId,
          externalCalls: 0
        }
      });
    }
    return this.getContact(tenantId, contactId);
  }

  async unlinkIdentity(tenantId: string, contactId: string, request: UnlinkContactIdentityRequest, actorUserId?: string) {
    await this.ensureContact(tenantId, contactId);
    const beforeIdentity = await this.prisma.contactIdentity.findFirst({
      where: { id: request.identityId, tenantId, contactId },
      include: { channelAccount: true }
    });
    await this.prisma.$transaction(async (tx) => {
      const identity = await tx.contactIdentity.findFirst({
        where: { id: request.identityId, tenantId, contactId },
        include: { channelAccount: true }
      });
      if (!identity) throw new NotFoundException("Contact identity not found");
      const remaining = await tx.contactIdentity.findMany({ where: { tenantId, contactId, id: { not: identity.id } } });
      if (remaining.length === 0) throw new BadRequestException("Cannot unlink the last identity from a contact");

      const standalone = await tx.contact.create({
        data: {
          tenantId,
          displayName: identity.displayName ?? `${identity.platform}:${identity.externalUserId}`,
          leadStatus: "new"
        }
      });
      await tx.contactIdentity.update({
        where: { id: identity.id },
        data: { contactId: standalone.id, isPrimary: true }
      });
      await tx.conversation.updateMany({
        where: { tenantId, contactIdentityId: identity.id },
        data: { contactId: standalone.id }
      });
      if (identity.isPrimary && remaining[0]) {
        await tx.contactIdentity.update({
          where: { id: remaining[0].id },
          data: { isPrimary: true }
        });
      }
    });
    const afterIdentity = await this.prisma.contactIdentity.findFirst({
      where: { id: request.identityId, tenantId },
      include: { channelAccount: true }
    });
    if (beforeIdentity && afterIdentity) {
      await this.recordContactAudit({
        tenantId,
        actorUserId,
        contactId,
        identityId: beforeIdentity.id,
        action: "contact.identity_unlinked",
        beforeJson: identityAuditSnapshot(beforeIdentity),
        afterJson: identityAuditSnapshot(afterIdentity),
        metadata: {
          contactId,
          identityId: beforeIdentity.id,
          newContactId: afterIdentity.contactId,
          platform: beforeIdentity.platform,
          channelAccountId: beforeIdentity.channelAccountId,
          externalUserId: beforeIdentity.externalUserId,
          externalCalls: 0
        }
      });
    }
    return this.getContact(tenantId, contactId);
  }

  async setPrimaryIdentity(tenantId: string, contactId: string, request: SetPrimaryIdentityRequest, actorUserId?: string) {
    await this.ensureContact(tenantId, contactId);
    const identity = await this.prisma.contactIdentity.findFirst({ where: { id: request.identityId, tenantId, contactId } });
    if (!identity) throw new NotFoundException("Contact identity not found");
    const beforeIdentities = await this.prisma.contactIdentity.findMany({
      where: { tenantId, contactId },
      include: { channelAccount: true }
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.contactIdentity.updateMany({ where: { tenantId, contactId }, data: { isPrimary: false } });
      await tx.contactIdentity.update({ where: { id: request.identityId }, data: { isPrimary: true } });
    });
    const afterIdentity = await this.prisma.contactIdentity.findFirst({
      where: { id: request.identityId, tenantId, contactId },
      include: { channelAccount: true }
    });
    if (afterIdentity) {
      await this.recordContactAudit({
        tenantId,
        actorUserId,
        contactId,
        identityId: request.identityId,
        action: "contact.primary_identity_set",
        beforeJson: { identities: beforeIdentities.map(identityAuditSnapshot) },
        afterJson: identityAuditSnapshot(afterIdentity),
        metadata: {
          contactId,
          identityId: request.identityId,
          platform: afterIdentity.platform,
          channelAccountId: afterIdentity.channelAccountId,
          externalUserId: afterIdentity.externalUserId,
          externalCalls: 0
        }
      });
    }
    return this.getContact(tenantId, contactId);
  }

  async updateBroadcastConsent(tenantId: string, contactId: string, request: UpdateBroadcastConsentRequest, actorUserId?: string) {
    await this.ensureContact(tenantId, contactId);
    let selectedConversation: Awaited<ReturnType<CustomerService["findConversationForBroadcastConsent"]>> | null = null;
    if (request.conversationId) {
      selectedConversation = await this.findConversationForBroadcastConsent(tenantId, contactId, request.conversationId);
    }
    const before = (await this.getBroadcastConsentByContactIds(tenantId, [contactId])).get(contactId) ?? { optOut: false };
    const after = {
      optOut: request.optOut,
      suppressedReason: request.optOut ? "customer_requested" : undefined
    };

    await this.recordContactAudit({
      tenantId,
      actorUserId,
      contactId,
      identityId: selectedConversation?.contactIdentityId,
      action: "contact.broadcast_consent_updated",
      beforeJson: broadcastConsentSnapshot(before),
      afterJson: broadcastConsentSnapshot(after),
      metadata: {
        contactId,
        customerId: contactId,
        identityId: selectedConversation?.contactIdentityId ?? null,
        conversationId: selectedConversation?.id ?? request.conversationId ?? null,
        platform: selectedConversation?.room.platform ?? null,
        channelAccountId: selectedConversation?.room.channelAccountId ?? null,
        roomId: selectedConversation?.roomId ?? null,
        previous: broadcastConsentSnapshot(before),
        next: broadcastConsentSnapshot(after),
        externalCalls: 0
      }
    });

    return this.getContact(tenantId, contactId);
  }

  private async findConversationForBroadcastConsent(tenantId: string, contactId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { tenantId, id: conversationId },
      include: {
        room: true,
        contactIdentity: true
      }
    });
    if (!conversation) throw new NotFoundException("Conversation not found");
    if (conversation.contactId !== contactId && conversation.contactIdentity.contactId !== contactId) {
      throw new BadRequestException("Conversation does not belong to contact");
    }
    return conversation;
  }

  private async getBroadcastConsentByContactIds(tenantId: string, contactIds: string[]) {
    const result = new Map<string, BroadcastConsent>();
    if (contactIds.length === 0) return result;
    const logs = await this.prisma.auditLog.findMany({
      where: {
        tenantId,
        entityType: "contact",
        entityId: { in: contactIds },
        action: "contact.broadcast_consent_updated"
      },
      orderBy: { createdAt: "desc" }
    });
    for (const log of logs) {
      if (!log.entityId || result.has(log.entityId)) continue;
      const after = readObject(log.afterJson);
      const metadata = readObject(log.metadataJson ?? log.metadata);
      const next = readObject(metadata.next);
      const optOut = Boolean(after.optOut ?? next.optOut);
      const suppressedReason = typeof after.suppressedReason === "string"
        ? after.suppressedReason
        : typeof next.suppressedReason === "string"
          ? next.suppressedReason
          : undefined;
      result.set(log.entityId, {
        optOut,
        suppressedReason: optOut ? suppressedReason ?? "customer_requested" : undefined,
        updatedAt: log.createdAt
      });
    }
    return result;
  }

  private async getBroadcastHistorySummary(
    tenantId: string,
    contactId: string,
    identityIds: string[],
    selected: { id: string; roomId: string; contactIdentityId: string; room: { platform: Platform; channelAccountId: string } },
    consent?: BroadcastConsent
  ) {
    const logs = await this.prisma.broadcastSendLog.findMany({
      where: {
        tenantId,
        OR: [
          { contactId },
          identityIds.length > 0 ? { contactIdentityId: { in: identityIds } } : { id: "__none__" }
        ]
      },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }) as BroadcastHistoryLogRecord[];
    const roomKeys = logs
      .filter((log) => log.channelAccountId)
      .map((log) => ({ platform: log.platform, channelAccountId: log.channelAccountId as string }));
    const rooms = roomKeys.length > 0
      ? await this.prisma.room.findMany({
          where: {
            tenantId,
            OR: roomKeys.map((room) => ({
              platform: room.platform,
              channelAccountId: room.channelAccountId
            }))
          },
          select: { id: true, platform: true, channelAccountId: true }
        })
      : [];
    const roomByPlatformAccount = new Map(rooms.map((room) => [`${room.platform}:${room.channelAccountId}`, room.id]));
    const rows = logs.map((log) => {
      const roomId = log.channelAccountId
        ? roomByPlatformAccount.get(`${log.platform}:${log.channelAccountId}`) ?? null
        : null;
      const inSelectedRoom = roomId === selected.roomId || (
        log.platform === selected.room.platform &&
        log.channelAccountId === selected.room.channelAccountId
      );
      return {
        id: log.id,
        contactId: log.contactId,
        customerId: log.contactId,
        identityId: log.contactIdentityId,
        campaignId: log.campaignId,
        campaignName: log.campaign?.name ?? null,
        campaignStatus: safeCampaignStatus(log.campaign?.status),
        platform: log.platform,
        channelAccountId: log.channelAccountId,
        roomId,
        conversationId: inSelectedRoom ? selected.id : null,
        status: safeBroadcastLogStatus(log.status),
        reason: log.reason,
        sentAt: log.status === "sent_mock" ? log.createdAt.toISOString() : null,
        queuedAt: log.status === "queued_mock" ? log.createdAt.toISOString() : null,
        mockOnly: true,
        safe: true,
        externalCalls: 0 as const
      };
    });
    const last = rows[0] ?? null;
    return {
      contactId,
      customerId: contactId,
      identityId: selected.contactIdentityId,
      platform: selected.room.platform,
      channelAccountId: selected.room.channelAccountId,
      roomId: selected.roomId,
      conversationId: selected.id,
      lastCampaignId: last?.campaignId ?? null,
      lastCampaignName: last?.campaignName ?? null,
      sentMockCount: rows.filter((row) => row.status === "sent_mock").length,
      optOut: Boolean(consent?.optOut),
      suppressedReason: consent?.suppressedReason,
      externalCalls: 0 as const,
      rows
    };
  }

  private async findIdentityForLinkRequest(tenantId: string, request: LinkContactIdentityRequest) {
    if (request.identityId) {
      return this.prisma.contactIdentity.findFirst({
        where: { tenantId, id: request.identityId },
        include: { channelAccount: true }
      });
    }
    if (!request.platform || !request.channelAccountId || !request.externalUserId) return null;
    return this.prisma.contactIdentity.findUnique({
      where: {
        tenantId_platform_channelAccountId_externalUserId: {
          tenantId,
          platform: request.platform as Platform,
          channelAccountId: request.channelAccountId,
          externalUserId: request.externalUserId
        }
      },
      include: { channelAccount: true }
    });
  }

  private async recordContactAudit(input: {
    tenantId: string;
    actorUserId?: string;
    contactId: string;
    identityId?: string;
    action: string;
    beforeJson?: Prisma.InputJsonValue | null;
    afterJson?: Prisma.InputJsonValue | null;
    metadata: Prisma.InputJsonValue;
  }) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        tenantId: input.tenantId,
        OR: [
          { contactId: input.contactId },
          input.identityId ? { contactIdentityId: input.identityId } : { id: "__none__" }
        ]
      },
      include: { room: true },
      orderBy: { lastMessageAt: "desc" },
      take: 12
    });
    const auditTargets = conversations.length > 0 ? conversations : [null];
    await Promise.all(auditTargets.map((conversation) => {
      const context = conversation
        ? {
            conversationId: conversation.id,
            platform: conversation.room.platform,
            channelAccountId: conversation.room.channelAccountId,
            roomId: conversation.roomId
          }
        : {};
      return this.audit.record({
        tenantId: input.tenantId,
        actorUserId: input.actorUserId,
        conversationId: conversation?.id ?? null,
        action: input.action,
        entityType: "contact",
        entityId: input.contactId,
        beforeJson: input.beforeJson ?? undefined,
        afterJson: input.afterJson ?? undefined,
        metadata: {
          ...(input.metadata as Record<string, unknown>),
          tenantId: input.tenantId,
          actionType: input.action,
          ...context
        }
      });
    }));
  }

  private async ensureContact(tenantId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({ where: { tenantId, id: contactId } });
    if (!contact) throw new NotFoundException("Contact not found");
    return contact;
  }

  private async getNotesByContactId(tenantId: string, contactIds: string[]) {
    const notesByContactId = new Map<string, Array<{
      id: string;
      contactId: string | null;
      body: string;
      authorUserId: string | null;
      createdAt: Date;
    }>>();
    if (contactIds.length === 0) return notesByContactId;
    const notes = await this.prisma.internalNote.findMany({
      where: { tenantId, contactId: { in: contactIds } },
      orderBy: { createdAt: "desc" },
      take: Math.max(50, contactIds.length * 5)
    });
    for (const note of notes) {
      if (!note.contactId) continue;
      const current = notesByContactId.get(note.contactId) ?? [];
      if (current.length < 5) current.push(note);
      notesByContactId.set(note.contactId, current);
    }
    return notesByContactId;
  }

  private async linkIdentityTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    contactId: string,
    request: LinkContactIdentityRequest | NonNullable<CreateContactRequest["identity"]>
  ) {
    const existingIdentity = "identityId" in request && request.identityId
      ? await tx.contactIdentity.findFirst({ where: { tenantId, id: request.identityId } })
      : await tx.contactIdentity.findUnique({
          where: {
            tenantId_platform_channelAccountId_externalUserId: {
              tenantId,
              platform: request.platform as Platform,
              channelAccountId: request.channelAccountId as string,
              externalUserId: request.externalUserId as string
            }
          }
        });

    if ("identityId" in request && request.identityId && !existingIdentity) {
      throw new NotFoundException("Contact identity not found");
    }

    const contactIdentityCount = await tx.contactIdentity.count({ where: { tenantId, contactId } });
    const shouldBePrimary = request.isPrimary || contactIdentityCount === 0;
    if (shouldBePrimary) {
      await tx.contactIdentity.updateMany({ where: { tenantId, contactId }, data: { isPrimary: false } });
    }

    if (existingIdentity) {
      const updated = await tx.contactIdentity.update({
        where: { id: existingIdentity.id },
        data: {
          contactId,
          displayName: request.displayName ?? existingIdentity.displayName,
          profileUrl: request.profileUrl ?? existingIdentity.profileUrl,
          isPrimary: shouldBePrimary
        }
      });
      await tx.conversation.updateMany({
        where: { tenantId, contactIdentityId: updated.id },
        data: { contactId }
      });
      return updated;
    }

    if (!request.platform || !request.channelAccountId || !request.externalUserId) {
      throw new BadRequestException("Missing identity fields");
    }
    const account = await tx.channelAccount.findFirst({
      where: { tenantId, id: request.channelAccountId, platform: request.platform }
    });
    if (!account) throw new NotFoundException("Channel account not found");

    return tx.contactIdentity.create({
      data: {
        tenantId,
        contactId,
        platform: request.platform,
        channelAccountId: request.channelAccountId,
        externalUserId: request.externalUserId,
        displayName: request.displayName ?? `${request.platform}:${request.externalUserId}`,
        profileUrl: request.profileUrl,
        isPrimary: shouldBePrimary
      }
    });
  }

  private async replaceTags(tx: Prisma.TransactionClient, tenantId: string, contactId: string, tags: string[]) {
    await tx.contactTag.deleteMany({ where: { contactId } });
    for (const name of Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)))) {
      const tag = await tx.tag.upsert({
        where: { tenantId_name: { tenantId, name } },
        update: {},
        create: { tenantId, name }
      });
      await tx.contactTag.create({ data: { contactId, tagId: tag.id } });
    }
  }
}

function mapIdentity(identity: {
  id: string;
  contactId: string;
  platform: Platform;
  channelAccountId: string;
  externalUserId: string;
  displayName: string | null;
  profileUrl: string | null;
  isPrimary: boolean;
  updatedAt: Date;
  channelAccount: { displayName: string };
}) {
  return {
    id: identity.id,
    contactId: identity.contactId,
    platform: identity.platform,
    channelAccountId: identity.channelAccountId,
    accountName: identity.channelAccount.displayName,
    externalUserId: identity.externalUserId,
    displayName: identity.displayName ?? `${identity.platform}:${identity.externalUserId}`,
    avatarUrl: identity.profileUrl ?? undefined,
    isPrimary: identity.isPrimary,
    lastSeenAt: identity.updatedAt.toISOString()
  };
}

function safeIdentityRequest(identity: {
  identityId?: string;
  platform?: Platform | string;
  channelAccountId?: string;
  externalUserId?: string;
  displayName?: string;
  profileUrl?: string;
  isPrimary?: boolean;
}) {
  const result: Record<string, Prisma.InputJsonValue | null> = {
    isPrimary: Boolean(identity.isPrimary),
    externalCalls: 0
  };
  if (identity.identityId) result.identityId = identity.identityId;
  if (identity.platform) result.platform = identity.platform;
  if (identity.channelAccountId) result.channelAccountId = identity.channelAccountId;
  if (identity.externalUserId) result.externalUserId = identity.externalUserId;
  if (identity.displayName) result.displayName = identity.displayName;
  if (identity.profileUrl) result.profileUrl = identity.profileUrl;
  return result as Prisma.InputJsonObject;
}

function identityAuditSnapshot(identity: {
  id: string;
  contactId: string;
  platform: Platform;
  channelAccountId: string;
  externalUserId: string;
  displayName: string | null;
  profileUrl: string | null;
  isPrimary: boolean;
}) {
  return {
    id: identity.id,
    contactId: identity.contactId,
    platform: identity.platform,
    channelAccountId: identity.channelAccountId,
    externalUserId: identity.externalUserId,
    displayName: identity.displayName,
    profileUrl: identity.profileUrl,
    isPrimary: identity.isPrimary
  };
}

function contactAuditSnapshot(contact: {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  leadStatus: string;
  ownerAgent?: string;
  tags: string[];
  identities: Array<{ id: string; platform: Platform; channelAccountId: string; externalUserId: string; isPrimary: boolean }>;
}) {
  return {
    id: contact.id,
    displayName: contact.displayName,
    email: contact.email ?? null,
    phone: contact.phone ?? null,
    leadStatus: contact.leadStatus,
    ownerAgent: contact.ownerAgent ?? null,
    tags: contact.tags,
    identities: contact.identities.map((identity) => ({
      id: identity.id,
      platform: identity.platform,
      channelAccountId: identity.channelAccountId,
      externalUserId: identity.externalUserId,
      isPrimary: identity.isPrimary
    }))
  };
}

type BroadcastConsent = {
  optOut: boolean;
  suppressedReason?: string;
  updatedAt?: Date;
};

type BroadcastHistoryLogRecord = {
  id: string;
  tenantId: string;
  campaignId: string;
  contactId: string | null;
  contactIdentityId: string | null;
  platform: Platform;
  channelAccountId: string | null;
  status: string;
  reason: string | null;
  payloadJson: Prisma.JsonValue | null;
  createdAt: Date;
  campaign?: {
    id: string;
    name: string;
    status: string;
  } | null;
};

function broadcastConsentSnapshot(consent: BroadcastConsent) {
  return {
    optOut: Boolean(consent.optOut),
    suppressedReason: consent.optOut ? consent.suppressedReason ?? "customer_requested" : null,
    externalCalls: 0
  };
}

function mapContact(contact: {
  id: string;
  displayName: string;
  phone: string | null;
  email: string | null;
  leadStatus: string;
  ownerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  identities: Array<Parameters<typeof mapIdentity>[0]>;
  tags: Array<{ tag: { name: string } }>;
}, notes: Array<{
  id: string;
  contactId: string | null;
  body: string;
  authorUserId: string | null;
  createdAt: Date;
}> = [], tasks: Array<{
  id: string;
  contactId: string;
  title: string;
  status: string;
  dueAt: Date | null;
  assigneeUserId: string | null;
  createdAt: Date;
}> = [], consent?: BroadcastConsent) {
  return {
    id: contact.id,
    displayName: contact.displayName,
    phone: contact.phone ?? undefined,
    email: contact.email ?? undefined,
    leadStatus: mapLeadStatus(contact.leadStatus),
    ownerAgent: contact.ownerUserId ?? undefined,
    tags: contact.tags.map((item) => item.tag.name),
    customFields: {},
    identities: contact.identities.map((identity) => mapIdentity(identity)),
    notes: notes.map((note) => ({
      id: note.id,
      contactId: note.contactId ?? contact.id,
      body: note.body,
      createdBy: note.authorUserId ?? "system",
      createdAt: note.createdAt.toISOString()
    })),
    tasks: tasks.map((task) => ({
      id: task.id,
      contactId: task.contactId,
      title: task.title,
      status: mapTaskStatus(task.status),
      dueAt: task.dueAt?.toISOString(),
      ownerAgent: task.assigneeUserId ?? undefined,
      createdAt: task.createdAt.toISOString()
    })),
    optOutBroadcast: Boolean(consent?.optOut),
    suppressedReason: consent?.suppressedReason,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString()
  };
}

function mapCustomer360Task(task: {
  id: string;
  tenantId: string;
  conversationId: string;
  contactId: string;
  title: string;
  status: string;
  assigneeUserId: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}, conversation?: {
  roomId: string;
  room: { platform: Platform; channelAccountId: string };
}) {
  return {
    id: task.id,
    tenantId: task.tenantId,
    conversationId: task.conversationId,
    contactId: task.contactId,
    platform: conversation?.room.platform,
    channelAccountId: conversation?.room.channelAccountId,
    roomId: conversation?.roomId,
    title: task.title,
    status: mapTaskStatus(task.status),
    assigneeUserId: task.assigneeUserId,
    dueAt: task.dueAt?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    ownerAgent: task.assigneeUserId ?? undefined,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    externalCalls: 0 as const
  };
}

function mapConversationCard(conversation: {
  id: string;
  tenantId: string;
  roomId: string;
  room: { platform: Platform; channelAccountId: string; channelAccount: { displayName: string } };
  contact: { displayName: string; email: string | null; phone: string | null; tags: Array<{ tag: { name: string } }> };
  contactIdentity: { displayName: string | null };
  assignedUser: { name: string } | null;
  messages: Array<{ text: string | null }>;
  lastMessageAt: Date;
  unread: boolean;
  unreplied: boolean;
  aiState: string;
  priority: ConversationPriority;
  status: ConversationStatus;
  followUpAt: Date | null;
  slaDueAt?: Date | null;
  slaBreachedAt?: Date | null;
  slaStatus?: "ok" | "warning" | "breached" | null;
  firstResponseDueAt?: Date | null;
  resolutionDueAt?: Date | null;
}) {
  const aiStatus = mapAiStatus(conversation.aiState, conversation.status);
  return {
    id: conversation.id,
    tenantId: conversation.tenantId,
    roomId: conversation.roomId,
    tab: aiStatus === "AI Active" ? "bot" as const : "human" as const,
    platform: conversation.room.platform,
    platformLabel: platformLabel(conversation.room.platform),
    channelAccountId: conversation.room.channelAccountId,
    accountName: conversation.room.channelAccount.displayName,
    customerName: conversation.contactIdentity.displayName ?? conversation.contact.displayName,
    customerEmail: conversation.contact.email ?? "-",
    customerPhone: conversation.contact.phone ?? "-",
    lastMessage: conversation.messages[0]?.text ?? "-",
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    lastMessageTime: formatApiTime(conversation.lastMessageAt),
    unreadCount: conversation.unread ? 1 : 0,
    assignedAgent: conversation.assignedUser?.name ?? null,
    tags: conversation.contact.tags.map((item) => item.tag.name),
    aiStatus,
    priority: mapPriority(conversation.priority),
    status: mapStatus(conversation.status, conversation.followUpAt),
    unreplied: conversation.unreplied,
    followUpAt: conversation.followUpAt?.toISOString(),
    ...mapSlaFields(conversation)
  };
}

function mapLeadStatus(value: string) {
  if (["new", "interested", "qualified", "quoted", "won", "lost", "follow_up"].includes(value)) {
    return value as "new" | "interested" | "qualified" | "quoted" | "won" | "lost" | "follow_up";
  }
  return "new";
}

function mapTaskStatus(value: string) {
  if (value === "done" || value === "cancelled") return value;
  return "open";
}

function mapPriority(priority: ConversationPriority) {
  return priority === "normal" ? "medium" : priority;
}

function mapStatus(status: ConversationStatus, followUpAt: Date | null) {
  if (followUpAt && status !== "closed" && status !== "spam") return "follow_up";
  return status === "closed" ? "closed" : status;
}

function mapSlaFields(conversation: {
  slaDueAt?: Date | null;
  slaBreachedAt?: Date | null;
  slaStatus?: "ok" | "warning" | "breached" | null;
  firstResponseDueAt?: Date | null;
  resolutionDueAt?: Date | null;
}) {
  return {
    slaDueAt: conversation.slaDueAt?.toISOString() ?? null,
    slaBreachedAt: conversation.slaBreachedAt?.toISOString() ?? null,
    slaStatus: deriveSlaStatus(conversation),
    firstResponseDueAt: conversation.firstResponseDueAt?.toISOString() ?? null,
    resolutionDueAt: conversation.resolutionDueAt?.toISOString() ?? null
  };
}

function deriveSlaStatus(conversation: {
  slaDueAt?: Date | null;
  slaBreachedAt?: Date | null;
  slaStatus?: "ok" | "warning" | "breached" | null;
}) {
  const now = Date.now();
  if (conversation.slaStatus === "breached" || conversation.slaBreachedAt || (conversation.slaDueAt && conversation.slaDueAt.getTime() <= now)) {
    return "breached" as const;
  }
  if (conversation.slaStatus === "warning" || (conversation.slaDueAt && conversation.slaDueAt.getTime() - now <= 15 * 60 * 1000)) {
    return "warning" as const;
  }
  return "ok" as const;
}

function mapAiStatus(aiState: string, status: ConversationStatus) {
  if (status === "closed") return "Closed";
  if (aiState === "ai_active") return "AI Active";
  if (aiState === "need_human") return "Need Human";
  if (aiState === "human") return "Human Taken";
  if (aiState === "off") return "AI Off";
  return "Suggest";
}

function platformLabel(platform: Platform) {
  const labels: Record<Platform, string> = {
    webchat: "Webchat",
    telegram: "Telegram",
    line: "LINE",
    facebook: "Facebook",
    instagram: "Instagram"
  };
  return labels[platform];
}

function formatApiTime(date: Date) {
  return new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function safeCampaignStatus(value: string | undefined | null) {
  const allowed = ["draft", "scheduled", "sending", "sent", "paused", "archived", "cancelled", "failed"] as const;
  return allowed.find((status) => status === value) ?? null;
}

function safeBroadcastLogStatus(value: string) {
  const allowed = ["queued_mock", "sent_mock", "skipped_mock", "failed_mock"] as const;
  return allowed.find((status) => status === value) ?? "skipped_mock";
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
