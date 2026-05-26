import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { CustomerService } from "./customer.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const webchatRoomId = "room-webchat";
const telegramRoomId = "room-telegram";
const webchatAccountId = "00000000-0000-4000-8000-000000000020";
const telegramAccountId = "00000000-0000-4000-8000-000000000021";

describe("CustomerService Customer 360 API", () => {
  it("returns selected contact with identities and related conversations", async () => {
    const { service } = buildService();

    const customer360 = await service.getCustomer360(tenantId, "conv-web");

    expect(customer360.selectedConversationId).toBe("conv-web");
    expect(customer360.contact.id).toBe("contact-web");
    expect(customer360.contact.displayName).toBe("Demo Web Visitor");
    expect(customer360.identities.map((identity) => identity.externalUserId)).toEqual(["web-user"]);
    expect(customer360.recentConversations.map((conversation) => conversation.id)).toEqual(["conv-web"]);
    expect(customer360.source).toMatchObject({
      platform: "webchat",
      channelAccountId: webchatAccountId,
      externalUserId: "web-user"
    });
    expect(customer360.broadcastHistorySummary).toMatchObject({
      contactId: "contact-web",
      customerId: "contact-web",
      identityId: "identity-web",
      platform: "webchat",
      channelAccountId: webchatAccountId,
      roomId: webchatRoomId,
      conversationId: "conv-web",
      lastCampaignName: "Persisted Web Broadcast",
      sentMockCount: 1,
      optOut: false,
      externalCalls: 0
    });
    expect(customer360.broadcastHistorySummary.rows[0]).toMatchObject({
      campaignName: "Persisted Web Broadcast",
      platform: "webchat",
      channelAccountId: webchatAccountId,
      roomId: webchatRoomId,
      conversationId: "conv-web",
      status: "sent_mock",
      externalCalls: 0
    });
    expect(JSON.stringify(customer360.broadcastHistorySummary)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("persists broadcast opt-out state through tenant-scoped contact audit logs", async () => {
    const { service, audit } = buildService();

    const optedOut = await service.updateBroadcastConsent(tenantId, "contact-web", { optOut: true, conversationId: "conv-web" }, "agent-demo");
    const refreshed = await service.getCustomer360(tenantId, "conv-web");

    expect(optedOut.optOutBroadcast).toBe(true);
    expect(refreshed.contact.optOutBroadcast).toBe(true);
    expect(refreshed.broadcastHistorySummary.optOut).toBe(true);
    expect(refreshed.broadcastHistorySummary.suppressedReason).toBe("customer_requested");
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      actorUserId: "agent-demo",
      action: "contact.broadcast_consent_updated",
      entityType: "contact",
      entityId: "contact-web",
      metadata: expect.objectContaining({
        tenantId,
        contactId: "contact-web",
        customerId: "contact-web",
        identityId: "identity-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: webchatAccountId,
        roomId: webchatRoomId,
        externalCalls: 0
      })
    }));
    expect(JSON.stringify(audit.record.mock.calls)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("rejects broadcast consent updates for another tenant or unrelated conversation", async () => {
    const { service } = buildService();

    await expect(service.updateBroadcastConsent("00000000-0000-4000-8000-000000000099", "contact-web", { optOut: true }, "agent-demo")).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.updateBroadcastConsent(tenantId, "contact-web", { optOut: true, conversationId: "conv-telegram" }, "agent-demo")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("lists and reads contacts only for the requested tenant", async () => {
    const { service, store } = buildService();
    store.contacts.push({
      ...contact("contact-other-tenant", "Other Tenant Contact", "won", new Date("2026-05-21T04:00:00.000Z")),
      tenantId: "00000000-0000-4000-8000-000000000099"
    });

    const contacts = await service.listContacts(tenantId);
    const detail = await service.getContact(tenantId, "contact-web");

    expect(contacts.map((item) => item.id)).toEqual(["contact-web", "contact-telegram"]);
    expect(detail.identities[0]?.channelAccountId).toBe(webchatAccountId);
    await expect(service.getContact("00000000-0000-4000-8000-000000000099", "contact-web")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns contact identities and conversations without merging platform rooms", async () => {
    const { service } = buildService();

    await service.linkIdentity(tenantId, "contact-web", { identityId: "identity-telegram", isPrimary: false });
    const identities = await service.getContactIdentities(tenantId, "contact-web");
    const conversations = await service.getContactConversations(tenantId, "contact-web");

    expect(identities.map((identity) => identity.externalUserId).sort()).toEqual(["telegram-user", "web-user"]);
    expect(conversations.map((conversation) => `${conversation.platform}:${conversation.roomId}`).sort()).toEqual([
      `telegram:${telegramRoomId}`,
      `webchat:${webchatRoomId}`
    ]);
    expect(conversations).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "conv-web", roomId: webchatRoomId, channelAccountId: webchatAccountId, accountName: "Main Website" }),
      expect.objectContaining({ id: "conv-telegram", roomId: telegramRoomId, channelAccountId: telegramAccountId, accountName: "Bot 007237" })
    ]));
  });

  it("links identities without moving conversations across rooms", async () => {
    const { service, store, audit } = buildService();

    await service.linkIdentity(tenantId, "contact-web", { identityId: "identity-telegram", isPrimary: false });

    expect(store.conversations.find((conversation) => conversation.id === "conv-web")?.roomId).toBe(webchatRoomId);
    expect(store.conversations.find((conversation) => conversation.id === "conv-telegram")?.roomId).toBe(telegramRoomId);
    expect(store.conversations.find((conversation) => conversation.id === "conv-telegram")?.contactId).toBe("contact-web");

    const customer360 = await service.getCustomer360(tenantId, "conv-web");
    expect(customer360.identities.map((identity) => identity.externalUserId).sort()).toEqual(["telegram-user", "web-user"]);
    expect(customer360.recentConversations.map((conversation) => conversation.id).sort()).toEqual(["conv-telegram", "conv-web"]);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      conversationId: "conv-telegram",
      action: "contact.identity_linked",
      entityType: "contact",
      entityId: "contact-web",
      metadata: expect.objectContaining({
        contactId: "contact-web",
        identityId: "identity-telegram",
        platform: "telegram",
        channelAccountId: telegramAccountId,
        roomId: telegramRoomId,
        externalCalls: 0
      })
    }));
  });

  it("returns Customer 360 tasks with their original platform account room context after identity linking", async () => {
    const { service, store } = buildService();
    const now = new Date("2026-05-21T04:10:00.000Z");
    store.tasks.push(task("task-telegram", "conv-telegram", "contact-telegram", "Follow up telegram buyer", "open", now));

    await service.linkIdentity(tenantId, "contact-web", { identityId: "identity-telegram", isPrimary: false });

    const customer360 = await service.getCustomer360(tenantId, "conv-web");
    const tasksById = new Map(customer360.tasks.map((item) => [item.id, item]));

    expect(tasksById.get("task-web")).toMatchObject({
      tenantId,
      conversationId: "conv-web",
      contactId: "contact-web",
      platform: "webchat",
      channelAccountId: webchatAccountId,
      roomId: webchatRoomId,
      externalCalls: 0
    });
    expect(tasksById.get("task-telegram")).toMatchObject({
      tenantId,
      conversationId: "conv-telegram",
      contactId: "contact-telegram",
      platform: "telegram",
      channelAccountId: telegramAccountId,
      roomId: telegramRoomId,
      externalCalls: 0
    });
    expect(customer360.recentConversations.map((conversation) => `${conversation.id}:${conversation.platform}:${conversation.channelAccountId}:${conversation.roomId}`).sort()).toEqual([
      `conv-telegram:telegram:${telegramAccountId}:${telegramRoomId}`,
      `conv-web:webchat:${webchatAccountId}:${webchatRoomId}`
    ]);
    expect(JSON.stringify(customer360.tasks)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer\s+[a-z0-9._-]+|(^|[^a-z])sk-[a-z0-9_-]{8,}/i);
  });

  it("keeps Webchat and Telegram rooms stable when linking by identity fields", async () => {
    const { service, store } = buildService();

    await service.linkIdentity(tenantId, "contact-telegram", {
      platform: "webchat",
      channelAccountId: webchatAccountId,
      externalUserId: "web-user",
      displayName: "Demo Web Visitor"
    });

    expect(store.conversations.find((conversation) => conversation.id === "conv-web")?.roomId).toBe(webchatRoomId);
    expect(store.conversations.find((conversation) => conversation.id === "conv-telegram")?.roomId).toBe(telegramRoomId);
    expect(store.conversations.find((conversation) => conversation.id === "conv-web")?.contactId).toBe("contact-telegram");
  });

  it("creates contacts with an optional primary identity", async () => {
    const { service } = buildService();

    const contact = await service.createContact(tenantId, {
      displayName: "New Demo Contact",
      leadStatus: "new",
      tags: ["new-contact"],
      identity: {
        platform: "telegram",
        channelAccountId: telegramAccountId,
        externalUserId: "new-telegram-user",
        displayName: "New TG",
        isPrimary: true
      }
    });

    expect(contact.displayName).toBe("New Demo Contact");
    expect(contact.tags).toEqual(["new-contact"]);
    expect(contact.identities[0]).toMatchObject({
      platform: "telegram",
      externalUserId: "new-telegram-user",
      isPrimary: true
    });
  });

  it("unlinks identities into a standalone contact without deleting conversation threads", async () => {
    const { service, store, audit } = buildService();
    await service.linkIdentity(tenantId, "contact-web", { identityId: "identity-telegram" });
    audit.record.mockClear();

    const contact = await service.unlinkIdentity(tenantId, "contact-web", { identityId: "identity-telegram" });

    expect(contact.identities.map((identity) => identity.id)).toEqual(["identity-web"]);
    expect(store.identities.find((identity) => identity.id === "identity-telegram")?.contactId).not.toBe("contact-web");
    expect(store.conversations.find((conversation) => conversation.id === "conv-telegram")?.roomId).toBe(telegramRoomId);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      conversationId: "conv-telegram",
      action: "contact.identity_unlinked",
      entityType: "contact",
      entityId: "contact-web",
      metadata: expect.objectContaining({
        contactId: "contact-web",
        identityId: "identity-telegram",
        platform: "telegram",
        channelAccountId: telegramAccountId,
        roomId: telegramRoomId,
        externalCalls: 0
      })
    }));
  });

  it("sets one primary identity per contact", async () => {
    const { service, audit } = buildService();
    await service.linkIdentity(tenantId, "contact-web", { identityId: "identity-telegram" });
    audit.record.mockClear();

    const contact = await service.setPrimaryIdentity(tenantId, "contact-web", { identityId: "identity-telegram" });

    expect(contact.identities.find((identity) => identity.id === "identity-telegram")?.isPrimary).toBe(true);
    expect(contact.identities.find((identity) => identity.id === "identity-web")?.isPrimary).toBe(false);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      action: "contact.primary_identity_set",
      metadata: expect.objectContaining({
        contactId: "contact-web",
        identityId: "identity-telegram",
        platform: "telegram",
        channelAccountId: telegramAccountId,
        externalCalls: 0
      })
    }));
  });

  it("audits safe contact profile changes without token or secret fields", async () => {
    const { service, audit } = buildService();

    await service.updateContact(tenantId, "contact-web", { leadStatus: "qualified", tags: ["vip"] }, "agent-demo");

    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      actorUserId: "agent-demo",
      conversationId: "conv-web",
      action: "contact.updated",
      entityType: "contact",
      entityId: "contact-web",
      metadata: expect.objectContaining({
        contactId: "contact-web",
        changedFields: ["leadStatus", "tags"],
        platform: "webchat",
        channelAccountId: webchatAccountId,
        roomId: webchatRoomId,
        externalCalls: 0
      })
    }));
    expect(JSON.stringify(audit.record.mock.calls)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("returns readable errors for unknown conversation/contact and unsafe unlink", async () => {
    const { service } = buildService();

    await expect(service.getCustomer360(tenantId, "missing")).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.linkIdentity(tenantId, "missing-contact", { identityId: "identity-web" })).rejects.toThrow("Contact not found");
    await expect(service.unlinkIdentity(tenantId, "contact-web", { identityId: "identity-web" })).rejects.toBeInstanceOf(BadRequestException);
  });
});

function buildService() {
  const now = new Date("2026-05-21T04:00:00.000Z");
  const store = {
    accounts: [
      account(webchatAccountId, "webchat", "Main Website"),
      account(telegramAccountId, "telegram", "Bot 007237")
    ],
    contacts: [
      contact("contact-web", "Demo Web Visitor", "interested", now),
      contact("contact-telegram", "Demo Telegram Buyer", "new", now)
    ],
    identities: [
      identity("identity-web", "contact-web", "webchat", webchatAccountId, "web-user", "Demo Web", true, now),
      identity("identity-telegram", "contact-telegram", "telegram", telegramAccountId, "telegram-user", "Demo TG", true, now)
    ],
    conversations: [
      conversation("conv-web", webchatRoomId, "contact-web", "identity-web", "webchat", webchatAccountId, "webchat hello", now),
      conversation("conv-telegram", telegramRoomId, "contact-telegram", "identity-telegram", "telegram", telegramAccountId, "telegram hello", now)
    ],
    notes: [
      { id: "note-web", tenantId, conversationId: "conv-web", contactId: "contact-web", authorUserId: "agent-demo", body: "Webchat note", createdAt: now }
    ],
    tasks: [
      task("task-web", "conv-web", "contact-web", "Follow up web visitor", "open", now)
    ],
    campaigns: [
      { id: "campaign-web", tenantId, name: "Persisted Web Broadcast", status: "sent", channelPlatform: "webchat", channelAccountId: webchatAccountId, createdAt: now, updatedAt: now }
    ],
    sendLogs: [
      {
        id: "send-log-web",
        tenantId,
        campaignId: "campaign-web",
        contactId: "contact-web",
        contactIdentityId: "identity-web",
        platform: "webchat",
        channelAccountId: webchatAccountId,
        status: "sent_mock",
        reason: "safe mock send only; no external outbound call was made",
        payloadJson: { externalCalls: 0 },
        createdAt: now
      }
    ],
    auditLogs: [] as any[],
    tags: [] as Array<{ id: string; tenantId: string; name: string; color: string; createdAt: Date }>,
    contactTags: [] as Array<{ id: string; contactId: string; tagId: string; createdAt: Date }>
  };

  const prisma = {
    $transaction: vi.fn(async (callback) => callback(prisma)),
    conversation: {
      findFirst: vi.fn(async ({ where }) => store.conversations.find((item) => item.id === where.id && item.tenantId === where.tenantId) ? enrichConversation(store, store.conversations.find((item) => item.id === where.id)!) : null),
      findMany: vi.fn(async ({ where }) => {
        const identityIds = where.OR?.flatMap((clause: any) => [
          ...(clause.contactIdentityId?.in ?? []),
          ...(clause.contactIdentityId ? [clause.contactIdentityId] : [])
        ]) ?? [];
        const contactIds = new Set(where.OR?.map((clause: any) => clause.contactId).filter(Boolean) ?? []);
        return store.conversations
          .filter((item) => item.tenantId === where.tenantId && (contactIds.has(item.contactId) || identityIds.includes(item.contactIdentityId)))
          .map((item) => enrichConversation(store, item));
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        let count = 0;
        for (const item of store.conversations) {
          if (item.tenantId === where.tenantId && item.contactIdentityId === where.contactIdentityId) {
            Object.assign(item, data);
            count += 1;
          }
        }
        return { count };
      })
    },
    internalNote: {
      findMany: vi.fn(async ({ where }) => store.notes.filter((note) =>
        note.tenantId === where.tenantId &&
        (where.conversationId?.in?.includes(note.conversationId) ?? true) &&
        (where.contactId?.in?.includes(note.contactId) ?? true)
      ))
    },
    task: {
      findMany: vi.fn(async ({ where }) => store.tasks.filter((task) => task.tenantId === where.tenantId && where.conversationId.in.includes(task.conversationId)))
    },
    auditLog: {
      findMany: vi.fn(async ({ where }) => store.auditLogs
        .filter((log) =>
          log.tenantId === where.tenantId &&
          (!where.entityType || log.entityType === where.entityType) &&
          (!where.action || log.action === where.action) &&
          (!where.entityId?.in || where.entityId.in.includes(log.entityId))
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    },
    broadcastSendLog: {
      findMany: vi.fn(async ({ where }) => {
        const identityIds = where.OR?.flatMap((clause: any) => clause.contactIdentityId?.in ?? []) ?? [];
        const contactIds = new Set(where.OR?.map((clause: any) => clause.contactId).filter(Boolean) ?? []);
        return store.sendLogs
          .filter((log) => log.tenantId === where.tenantId && (contactIds.has(log.contactId) || identityIds.includes(log.contactIdentityId)))
          .map((log) => ({
            ...log,
            campaign: store.campaigns.find((campaign) => campaign.id === log.campaignId) ?? null
          }));
      })
    },
    room: {
      findMany: vi.fn(async ({ where }) => store.conversations
        .filter((conversation) => conversation.tenantId === where.tenantId && where.OR?.some((item: any) =>
          item.platform === conversation.platform && item.channelAccountId === conversation.channelAccountId
        ))
        .map((conversation) => ({
          id: conversation.roomId,
          platform: conversation.platform,
          channelAccountId: conversation.channelAccountId
        })))
    },
    contact: {
      findMany: vi.fn(async ({ where }) => store.contacts
        .filter((item) => item.tenantId === where.tenantId)
        .map((item) => ({
          ...enrichContact(store, item),
          tasks: store.tasks.filter((task) => task.contactId === item.id && task.tenantId === where.tenantId)
        }))),
      findFirst: vi.fn(async ({ where }) => {
        const found = store.contacts.find((item) => item.id === where.id && item.tenantId === where.tenantId);
        return found ? {
          ...enrichContact(store, found),
          tasks: store.tasks.filter((task) => task.contactId === found.id && task.tenantId === where.tenantId)
        } : null;
      }),
      create: vi.fn(async ({ data }) => {
        const saved = { id: data.id ?? `contact-${store.contacts.length + 1}`, tenantId, phone: null, email: null, ownerUserId: null, createdAt: now, updatedAt: now, ...data };
        store.contacts.push(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }) => {
        const index = store.contacts.findIndex((item) => item.id === where.id);
        store.contacts[index] = { ...store.contacts[index], ...data, updatedAt: now };
        return store.contacts[index];
      })
    },
    contactIdentity: {
      findFirst: vi.fn(async ({ where }) => {
        const found = store.identities.find((item) =>
          item.tenantId === where.tenantId &&
          (!where.id || item.id === where.id) &&
          (!where.contactId || item.contactId === where.contactId)
        );
        return found ? enrichIdentity(store, found) : null;
      }),
      findUnique: vi.fn(async ({ where }) => {
        const key = where.tenantId_platform_channelAccountId_externalUserId;
        const found = store.identities.find((item) =>
          item.tenantId === key.tenantId &&
          item.platform === key.platform &&
          item.channelAccountId === key.channelAccountId &&
          item.externalUserId === key.externalUserId
        );
        return found ? enrichIdentity(store, found) : null;
      }),
      findMany: vi.fn(async ({ where, select }) => store.identities.filter((item) =>
        item.tenantId === where.tenantId &&
        item.contactId === where.contactId &&
        (!where.id?.not || item.id !== where.id.not)
      ).map((item) => select?.id ? { id: item.id } : enrichIdentity(store, item))),
      count: vi.fn(async ({ where }) => store.identities.filter((item) => item.tenantId === where.tenantId && item.contactId === where.contactId).length),
      update: vi.fn(async ({ where, data }) => {
        const index = store.identities.findIndex((item) => item.id === where.id);
        store.identities[index] = { ...store.identities[index], ...data, updatedAt: now };
        return enrichIdentity(store, store.identities[index]);
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        let count = 0;
        for (const item of store.identities) {
          if (item.tenantId === where.tenantId && item.contactId === where.contactId) {
            Object.assign(item, data, { updatedAt: now });
            count += 1;
          }
        }
        return { count };
      }),
      create: vi.fn(async ({ data }) => {
        const saved = { id: `identity-${store.identities.length + 1}`, createdAt: now, updatedAt: now, ...data };
        store.identities.push(saved);
        return enrichIdentity(store, saved);
      })
    },
    channelAccount: {
      findFirst: vi.fn(async ({ where }) => store.accounts.find((item) => item.tenantId === where.tenantId && item.id === where.id && item.platform === where.platform) ?? null)
    },
    contactTag: {
      deleteMany: vi.fn(async ({ where }) => {
        const before = store.contactTags.length;
        store.contactTags = store.contactTags.filter((item) => item.contactId !== where.contactId);
        return { count: before - store.contactTags.length };
      }),
      create: vi.fn(async ({ data }) => {
        const saved = { id: `contact-tag-${store.contactTags.length + 1}`, createdAt: now, ...data };
        store.contactTags.push(saved);
        return saved;
      })
    },
    tag: {
      upsert: vi.fn(async ({ where, create }) => {
        const found = store.tags.find((item) => item.tenantId === where.tenantId_name.tenantId && item.name === where.tenantId_name.name);
        if (found) return found;
        const saved = { id: `tag-${store.tags.length + 1}`, color: "#64748b", createdAt: now, ...create };
        store.tags.push(saved);
        return saved;
      })
    }
  };

  let auditCount = 0;
  const audit = {
    record: vi.fn(async (input) => {
      auditCount += 1;
      const saved = {
        id: `audit-${auditCount}`,
        ...input,
        metadataJson: input.metadata,
        metadata: input.metadata,
        createdAt: now
      };
      store.auditLogs.push(saved);
      return saved;
    })
  };

  return { service: new CustomerService(prisma as never, audit as never), prisma, store, audit };
}

function account(id: string, platform: string, displayName: string) {
  return { id, tenantId, platform, displayName };
}

function contact(id: string, displayName: string, leadStatus: string, now: Date) {
  return { id, tenantId, displayName, phone: "000", email: `${id}@example.local`, leadStatus, ownerUserId: null, createdAt: now, updatedAt: now };
}

function identity(id: string, contactId: string, platform: string, channelAccountId: string, externalUserId: string, displayName: string, isPrimary: boolean, now: Date) {
  return { id, tenantId, contactId, platform, channelAccountId, externalUserId, displayName, profileUrl: null, isPrimary, createdAt: now, updatedAt: now };
}

function conversation(id: string, roomId: string, contactId: string, contactIdentityId: string, platform: string, channelAccountId: string, text: string, now: Date) {
  return {
    id,
    tenantId,
    roomId,
    contactId,
    contactIdentityId,
    platform,
    channelAccountId,
    externalConversationId: id,
    status: "open",
    priority: "normal",
    assignedUserId: null,
    aiState: "need_human",
    unread: true,
    unreplied: true,
    followUpAt: null,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
    text
  };
}

function task(id: string, conversationId: string, contactId: string, title: string, status: string, now: Date) {
  return {
    id,
    tenantId,
    conversationId,
    contactId,
    title,
    status,
    assigneeUserId: null,
    createdByUserId: "agent-demo",
    dueAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now
  };
}

function enrichContact(store: any, source: any) {
  return {
    ...source,
    identities: store.identities.filter((identity: any) => identity.contactId === source.id).map((identity: any) => enrichIdentity(store, identity)),
    tags: store.contactTags
      .filter((item: any) => item.contactId === source.id)
      .map((item: any) => ({ tag: store.tags.find((tag: any) => tag.id === item.tagId)! }))
  };
}

function enrichIdentity(store: any, source: any) {
  return {
    ...source,
    channelAccount: store.accounts.find((account: any) => account.id === source.channelAccountId)!
  };
}

function enrichConversation(store: any, source: any) {
  const contact = enrichContact(store, store.contacts.find((item: any) => item.id === source.contactId)!);
  const contactIdentity = {
    ...store.identities.find((identity: any) => identity.id === source.contactIdentityId)!,
    channelAccount: store.accounts.find((account: any) => account.id === source.channelAccountId)!,
    contact: enrichContact(store, store.contacts.find((item: any) => item.id === store.identities.find((identity: any) => identity.id === source.contactIdentityId)!.contactId)!)
  };
  return {
    ...source,
    assignedUser: null,
    contact,
    contactIdentity,
    room: {
      id: source.roomId,
      platform: source.platform,
      channelAccountId: source.channelAccountId,
      channelAccount: store.accounts.find((account: any) => account.id === source.channelAccountId)!
    },
    messages: [{ text: source.text, createdAt: source.lastMessageAt }]
  };
}
