import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { ConversationService } from "./conversation.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const webchatRoomId = "room-webchat";
const telegramRoomId = "room-telegram";
const lineRoomId = "room-line";
const facebookRoomId = "room-facebook";
const instagramRoomId = "room-instagram";
const webchatAccountId = "00000000-0000-4000-8000-000000000020";
const telegramAccountId = "00000000-0000-4000-8000-000000000021";
const lineAccountId = "00000000-0000-4000-8000-000000000022";
const facebookAccountId = "00000000-0000-4000-8000-000000000023";
const instagramAccountId = "00000000-0000-4000-8000-000000000024";
const demoAgentUserId = "00000000-0000-4000-8000-000000000011";
const supervisorUserId = "00000000-0000-4000-8000-000000000012";
const otherTenantUserId = "00000000-0000-4000-8000-000000009998";

function buildService() {
  const users = [
    { id: demoAgentUserId, email: "may@example.local", name: "May" },
    { id: supervisorUserId, email: "ton@example.local", name: "Ton" },
    { id: otherTenantUserId, email: "outsider@example.local", name: "Outsider" }
  ];
  const rooms = [
    room(webchatRoomId, "webchat", "Main Website", webchatAccountId, 2),
    room(telegramRoomId, "telegram", "Bot 007237", telegramAccountId, 2),
    room(lineRoomId, "line", "LINE OA Main", lineAccountId, 1),
    room(facebookRoomId, "facebook", "Page หลัก", facebookAccountId, 1),
    room(instagramRoomId, "instagram", "IG ร้านค้า", instagramAccountId, 1)
  ];
  const conversations: Array<Record<string, any>> = [
    conversation("conv-web-need-human", webchatRoomId, "webchat", "Main Website", "Need Human Visitor", "need_human", "open", "ขอคุยกับแอดมิน"),
    conversation("conv-web-closed", webchatRoomId, "webchat", "Main Website", "Closed Visitor", "human", "closed", "ปิดเคสแล้ว"),
    conversation("conv-web-spam", webchatRoomId, "webchat", "Main Website", "Spam Visitor", "off", "spam", "spam message"),
    conversation("conv-telegram-need-human", telegramRoomId, "telegram", "Bot 007237", "Krit Market", "need_human", "open", "shared pricing question"),
    conversation("conv-telegram-closed", telegramRoomId, "telegram", "Bot 007237", "Closed Telegram", "human", "closed", "ปิดเคส Telegram แล้ว"),
    conversation("conv-telegram-spam", telegramRoomId, "telegram", "Bot 007237", "Spam Telegram", "off", "spam", "spam Telegram แล้ว"),
    conversation("conv-line-need-human", lineRoomId, "line", "LINE OA Main", "LINE Visitor", "need_human", "open", "ข้อความจาก LINE"),
    conversation("conv-facebook-need-human", facebookRoomId, "facebook", "Page หลัก", "Facebook Visitor", "need_human", "open", "ข้อความจาก Facebook"),
    conversation("conv-instagram-need-human", instagramRoomId, "instagram", "IG ร้านค้า", "Instagram Visitor", "need_human", "open", "ข้อความจาก Instagram")
  ];
  const messages = [
    message("msg-web-in", "conv-web-need-human", "user", "ถามจาก webchat", "webchat-msg-1"),
    message("msg-line-in", "conv-line-need-human", "user", "ถามจาก LINE", "line-msg-1")
  ];
  const notes: Array<Record<string, any>> = [];
  const tasks: Array<Record<string, any>> = [];
  const assignments: Array<Record<string, any>> = [];
  const statusHistory: Array<Record<string, any>> = [];
  const auditLogs: Array<Record<string, any>> = [];
  const knowledgeBases: Array<Record<string, any>> = [
    { id: "kb-default", tenantId, name: "Default KB", status: "active" },
    { id: "kb-other-tenant", tenantId: "00000000-0000-4000-8000-000000009999", name: "Other KB", status: "active" }
  ];
  const roomKnowledgeBaseLinks: Array<Record<string, any>> = [
    { id: "room-kb-1", tenantId, roomId: webchatRoomId, knowledgeBaseId: "kb-default", createdAt: new Date("2026-05-21T04:00:00.000Z") }
  ];

  const prisma = {
    room: {
      findMany: vi.fn(async () => rooms),
      findFirst: vi.fn(async ({ where }) => {
        const found = rooms.find((item) => item.id === where.id && item.tenantId === where.tenantId);
        return found ? withRoomKnowledgeBases(found, roomKnowledgeBaseLinks) : null;
      }),
      update: vi.fn(async ({ where, data }) => {
        const index = rooms.findIndex((item) => item.id === where.id);
        const saved = { ...rooms[index], ...stripUndefined(data), updatedAt: new Date("2026-05-21T04:08:00.000Z") };
        rooms[index] = saved;
        return saved;
      })
    },
    conversation: {
      findMany: vi.fn(async ({ where, skip, take }) => conversations.filter((item) => {
        if (where.tenantId && item.tenantId !== where.tenantId) return false;
        if (where.roomId && item.roomId !== where.roomId) return false;
        const roomFilter = where.room?.is;
        if (roomFilter?.platform && item.room.platform !== roomFilter.platform) return false;
        if (roomFilter?.channelAccountId && item.room.channelAccountId !== roomFilter.channelAccountId) return false;
        if (where.aiState && item.aiState !== where.aiState) return false;
        if (where.assignedUserId !== undefined && item.assignedUserId !== where.assignedUserId) return false;
        if (typeof where.status === "string" && item.status !== where.status) return false;
        if (where.status?.notIn?.includes(item.status)) return false;
        if (where.priority && item.priority !== where.priority) return false;
        if (where.unread !== undefined && item.unread !== where.unread) return false;
        if (where.unreplied !== undefined && item.unreplied !== where.unreplied) return false;
        if (where.slaStatus && item.slaStatus !== where.slaStatus) return false;
        if (where.followUpAt?.not === null && item.followUpAt === null) return false;
        if (Array.isArray(where.AND)) {
          return where.AND.every((clause: any) => {
            if (clause.OR?.[0]?.contact) {
              const search = clause.OR[0].contact.displayName.contains.toLowerCase();
              return [
                item.contact.displayName,
                item.contact.email ?? "",
                item.contact.phone ?? "",
                item.contactIdentity.displayName ?? "",
                item.contactIdentity.externalUserId ?? ""
              ].some((value) => value.toLowerCase().includes(search)) ||
                item.messages.some((msg: Record<string, any>) => msg.text.toLowerCase().includes(search));
            }
            if (clause.OR?.some((entry: any) => entry.slaStatus === "warning")) return item.slaStatus === "warning";
            if (clause.OR?.some((entry: any) => entry.slaStatus === "breached")) return item.slaStatus === "breached" || Boolean(item.slaBreachedAt);
            return true;
          });
        }
        return true;
      }).slice(skip ?? 0, take === undefined ? undefined : (skip ?? 0) + take)),
      findFirst: vi.fn(async ({ where }) => conversations.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null),
      update: vi.fn(async ({ where, data }) => {
        const index = conversations.findIndex((item) => item.id === where.id);
        const current = conversations[index];
        const assignedUser = data.assignedUserId === undefined
          ? current.assignedUser
          : users.find((item) => item.id === data.assignedUserId) ?? null;
        const saved = { ...current, ...data, assignedUser };
        conversations[index] = saved;
        return saved;
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        const targets = conversations.filter((item) => item.id === where.id && item.tenantId === where.tenantId);
        targets.forEach((current) => {
          const index = conversations.findIndex((item) => item.id === current.id);
          const assignedUser = data.assignedUserId === undefined
            ? current.assignedUser
            : users.find((item) => item.id === data.assignedUserId) ?? null;
          conversations[index] = { ...current, ...stripUndefined(data), assignedUser, updatedAt: new Date("2026-05-21T04:05:00.000Z") };
        });
        return { count: targets.length };
      })
    },
    teamMembership: {
      findFirst: vi.fn(async ({ where }) => {
        const user = users.find((item) => item.id === where.userId && item.id !== otherTenantUserId);
        return user && where.tenantId === tenantId ? { id: `membership-${user.id}`, tenantId, userId: user.id, role: "agent", user } : null;
      })
    },
    assignment: {
      updateMany: vi.fn(async ({ where, data }) => {
        assignments
          .filter((item) => item.conversationId === where.conversationId && item.status === where.status)
          .forEach((item) => Object.assign(item, data));
        return { count: assignments.length };
      }),
      create: vi.fn(async ({ data }) => {
        const saved = { id: `assignment-${assignments.length + 1}`, createdAt: new Date("2026-05-21T04:02:00.000Z"), updatedAt: new Date("2026-05-21T04:02:00.000Z"), ...data };
        assignments.push(saved);
        return saved;
      })
    },
    internalNote: {
      findMany: vi.fn(async ({ where }) => notes.filter((item) => item.tenantId === where.tenantId && item.conversationId === where.conversationId)),
      create: vi.fn(async ({ data }) => {
        const saved = {
          id: `note-${notes.length + 1}`,
          pinned: false,
          createdAt: new Date("2026-05-21T04:02:00.000Z"),
          updatedAt: new Date("2026-05-21T04:02:00.000Z"),
          ...data
        };
        notes.push(saved);
        return saved;
      })
    },
    task: {
      findMany: vi.fn(async ({ where }) => tasks.filter((item) => item.tenantId === where.tenantId && item.conversationId === where.conversationId)),
      findFirst: vi.fn(async ({ where }) => tasks.find((item) => item.tenantId === where.tenantId && item.id === where.id) ?? null),
      create: vi.fn(async ({ data }) => {
        const saved = {
          id: `task-${tasks.length + 1}`,
          status: "open",
          completedAt: null,
          createdAt: new Date("2026-05-21T04:03:00.000Z"),
          updatedAt: new Date("2026-05-21T04:03:00.000Z"),
          ...data
        };
        tasks.push(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }) => {
        const index = tasks.findIndex((item) => item.id === where.id);
        const saved = { ...tasks[index], ...data, updatedAt: new Date("2026-05-21T04:04:00.000Z") };
        tasks[index] = saved;
        return saved;
      })
    },
    conversationStatusHistory: {
      create: vi.fn(async ({ data }) => {
        const saved = { id: `status-history-${statusHistory.length + 1}`, createdAt: new Date("2026-05-21T04:06:00.000Z"), ...data };
        statusHistory.unshift(saved);
        return saved;
      }),
      findMany: vi.fn(async ({ where }) =>
        statusHistory.filter((item) => item.tenantId === where.tenantId && item.conversationId === where.conversationId)
      )
    },
    auditLog: {
      findMany: vi.fn(async ({ where }) =>
        auditLogs.filter((item) => item.tenantId === where.tenantId && item.conversationId === where.conversationId)
      )
    },
    knowledgeBase: {
      findMany: vi.fn(async ({ where }) => {
        const ids = where.id?.in as string[] | undefined;
        return knowledgeBases.filter((item) => item.tenantId === where.tenantId && (!ids || ids.includes(item.id)));
      })
    },
    roomKnowledgeBase: {
      deleteMany: vi.fn(async ({ where }) => {
        const before = roomKnowledgeBaseLinks.length;
        for (let index = roomKnowledgeBaseLinks.length - 1; index >= 0; index -= 1) {
          const item = roomKnowledgeBaseLinks[index];
          if (item.tenantId === where.tenantId && item.roomId === where.roomId) roomKnowledgeBaseLinks.splice(index, 1);
        }
        return { count: before - roomKnowledgeBaseLinks.length };
      }),
      create: vi.fn(async ({ data }) => {
        const saved = { id: `room-kb-${roomKnowledgeBaseLinks.length + 1}`, createdAt: new Date("2026-05-21T04:08:00.000Z"), ...data };
        roomKnowledgeBaseLinks.push(saved);
        return saved;
      })
    },
    message: {
      findMany: vi.fn(async ({ where }) => messages.filter((item) => item.conversationId === where.conversationId)),
      create: vi.fn(async ({ data }) => {
        const saved = message("msg-agent-1", data.conversationId, data.senderType, data.text, data.platformMessageId, data.channelAccountId);
        messages.push(saved);
        return saved;
      })
    },
    $transaction: vi.fn(async (callback) => callback(prisma))
  };

  const audit = {
    record: vi.fn(async (input) => {
      const metadata = input.metadataJson ?? input.metadata ?? null;
      const saved = {
        id: `audit-${auditLogs.length + 1}`,
        tenantId: input.tenantId,
        conversationId: input.conversationId ?? (input.entityType === "conversation" ? input.entityId : null),
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        beforeJson: input.beforeJson ?? null,
        afterJson: input.afterJson ?? null,
        metadata,
        metadataJson: metadata,
        createdAt: new Date("2026-05-21T04:07:00.000Z")
      };
      auditLogs.unshift(saved);
      return saved;
    })
  };
  const outboundQueue = { enqueueOutbound: vi.fn(async () => null), enqueueAi: vi.fn(async () => null) };
  const realtime = { conversationUpdated: vi.fn() };
  const service = new ConversationService(prisma as never, audit as never, outboundQueue as never, realtime as never);
  return { service, prisma, audit, outboundQueue, notes, tasks, assignments, conversations, users, auditLogs, statusHistory, roomKnowledgeBaseLinks };
}

describe("ConversationService core API", () => {
  it("fixtures deterministic seeded demo users under the demo tenant", async () => {
    const { prisma, users } = buildService();

    expect(users.map((item) => item.id)).toContain(demoAgentUserId);
    expect(users.map((item) => item.id)).toContain(supervisorUserId);
    await expect(prisma.teamMembership.findFirst({
      where: { tenantId, userId: demoAgentUserId },
      include: { user: true }
    })).resolves.toMatchObject({
      tenantId,
      userId: demoAgentUserId,
      user: { id: demoAgentUserId, name: "May" }
    });
  });

  it("returns five platform/account rooms without merging channels", async () => {
    const { service } = buildService();

    const rooms = await service.listRooms(tenantId);

    expect(rooms).toHaveLength(5);
    expect(rooms.map((item) => `${item.platform}/${item.accountName}`)).toEqual([
      "webchat/Main Website",
      "telegram/Bot 007237",
      "line/LINE OA Main",
      "facebook/Page หลัก",
      "instagram/IG ร้านค้า"
    ]);
    expect(rooms.map((item) => item.channelAccountId)).toEqual([
      webchatAccountId,
      telegramAccountId,
      lineAccountId,
      facebookAccountId,
      instagramAccountId
    ]);
  });

  it("does not return Telegram conversations in the Webchat room", async () => {
    const { service } = buildService();

    const conversations = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "all", tab: "human" });

    expect(conversations.map((item) => item.id)).toEqual(["conv-web-need-human"]);
    expect(conversations.every((item) => item.roomId === webchatRoomId)).toBe(true);
    expect(conversations.some((item) => item.platform === "telegram")).toBe(false);
  });

  it("does not return Webchat conversations in the Telegram room", async () => {
    const { service } = buildService();

    const conversations = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "all", tab: "human" });

    expect(conversations.map((item) => item.id)).toEqual(["conv-telegram-need-human"]);
    expect(conversations.every((item) => item.roomId === telegramRoomId)).toBe(true);
    expect(conversations.some((item) => item.platform === "webchat")).toBe(false);
  });

  it("does not return other platform conversations in LINE, Facebook, or Instagram rooms", async () => {
    const { service } = buildService();

    const line = await service.listConversations({ tenantId, roomId: lineRoomId, filter: "all", tab: "human" });
    const facebook = await service.listConversations({ tenantId, roomId: facebookRoomId, filter: "all", tab: "human" });
    const instagram = await service.listConversations({ tenantId, roomId: instagramRoomId, filter: "all", tab: "human" });

    expect(line.map((item) => item.id)).toEqual(["conv-line-need-human"]);
    expect(facebook.map((item) => item.id)).toEqual(["conv-facebook-need-human"]);
    expect(instagram.map((item) => item.id)).toEqual(["conv-instagram-need-human"]);
    expect(line.some((item) => item.platform === "telegram" || item.platform === "webchat")).toBe(false);
    expect(facebook.some((item) => item.platform === "instagram" || item.platform === "webchat")).toBe(false);
    expect(instagram.some((item) => item.platform === "facebook" || item.platform === "webchat")).toBe(false);
  });

  it("keeps search constrained to the requested room", async () => {
    const { service } = buildService();

    const webchatSearch = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "all", tab: "human", search: "Krit" });
    const telegramSearch = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "all", tab: "human", search: "Krit" });

    expect(webchatSearch).toEqual([]);
    expect(telegramSearch.map((item) => item.id)).toEqual(["conv-telegram-need-human"]);
    expect(telegramSearch.every((item) => item.roomId === telegramRoomId)).toBe(true);
  });

  it("keeps need_human and closed filters constrained to the requested room", async () => {
    const { service } = buildService();

    const webchatNeedHuman = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "need_human", tab: "human" });
    const telegramNeedHuman = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "need_human", tab: "human" });
    const webchatClosed = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "closed", tab: "human" });
    const telegramClosed = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "closed", tab: "human" });

    expect(webchatNeedHuman.map((item) => item.id)).toEqual(["conv-web-need-human"]);
    expect(telegramNeedHuman.map((item) => item.id)).toEqual(["conv-telegram-need-human"]);
    expect(webchatClosed.map((item) => item.id)).toEqual(["conv-web-closed"]);
    expect(telegramClosed.map((item) => item.id)).toEqual(["conv-telegram-closed"]);
    expect([...webchatNeedHuman, ...webchatClosed].every((item) => item.roomId === webchatRoomId)).toBe(true);
    expect([...telegramNeedHuman, ...telegramClosed].every((item) => item.roomId === telegramRoomId)).toBe(true);
  });

  it("keeps spam filters constrained to the requested room", async () => {
    const { service } = buildService();

    const webchatSpam = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "spam", tab: "human" });
    const telegramSpam = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "spam", tab: "human" });

    expect(webchatSpam.map((item) => item.id)).toEqual(["conv-web-spam"]);
    expect(telegramSpam.map((item) => item.id)).toEqual(["conv-telegram-spam"]);
    expect(webchatSpam.every((item) => item.roomId === webchatRoomId)).toBe(true);
    expect(telegramSpam.every((item) => item.roomId === telegramRoomId)).toBe(true);
  });

  it("keeps unread and unreplied filters constrained to the requested room", async () => {
    const { service } = buildService();

    const lineUnread = await service.listConversations({ tenantId, roomId: lineRoomId, filter: "unread", tab: "human" });
    const telegramUnreplied = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "unreplied", tab: "human" });

    expect(lineUnread.map((item) => item.id)).toEqual(["conv-line-need-human"]);
    expect(telegramUnreplied.map((item) => item.id)).toEqual(["conv-telegram-need-human"]);
    expect(lineUnread.every((item) => item.roomId === lineRoomId)).toBe(true);
    expect(telegramUnreplied.every((item) => item.roomId === telegramRoomId)).toBe(true);
  });

  it("applies API conversation list query filters without dropping platform account room context", async () => {
    const { service } = buildService();

    const conversations = await service.listConversations({
      tenantId,
      roomId: telegramRoomId,
      filter: "all",
      tab: "human",
      search: "pricing",
      platform: "telegram",
      channelAccountId: telegramAccountId,
      status: "open",
      priority: "medium",
      unread: true,
      slaStatus: "ok",
      sort: "updated_desc",
      limit: 10,
      offset: 0
    });

    expect(conversations.map((item) => item.id)).toEqual(["conv-telegram-need-human"]);
    expect(conversations[0]).toMatchObject({
      id: "conv-telegram-need-human",
      platform: "telegram",
      channelAccountId: telegramAccountId,
      roomId: telegramRoomId,
      status: "open",
      priority: "medium"
    });
    expect(JSON.stringify(conversations)).not.toMatch(/accessToken|accessTokenCiphertext|webhookSecret|botToken|apiKey|Bearer/i);
  });

  it("does not merge same-keyword conversations across platform account room boundaries", async () => {
    const { service } = buildService();

    const webchat = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "all", tab: "human", search: "shared pricing question" });
    const telegram = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "all", tab: "human", search: "shared pricing question" });

    expect(webchat).toEqual([]);
    expect(telegram.map((item) => `${item.platform}/${item.channelAccountId}/${item.roomId}/${item.id}`)).toEqual([
      `telegram/${telegramAccountId}/${telegramRoomId}/conv-telegram-need-human`
    ]);
  });

  it("returns an empty API result for impossible filters without synthesizing mock data", async () => {
    const { service } = buildService();

    const conversations = await service.listConversations({
      tenantId,
      roomId: webchatRoomId,
      filter: "all",
      tab: "human",
      search: "definitely-impossible-sprint31"
    });

    expect(conversations).toEqual([]);
  });

  it("paginates API conversation list results when a limit is supplied", async () => {
    const { service } = buildService();

    const first = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "closed", tab: "human", limit: 1, offset: 0 });
    const second = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "closed", tab: "human", limit: 1, offset: 1 });

    expect(first.map((item) => item.id)).toEqual(["conv-telegram-closed"]);
    expect(second).toEqual([]);
  });

  it("rejects conversation list queries outside the tenant scope", async () => {
    const { service } = buildService();

    await expect(service.listConversations({
      tenantId: "00000000-0000-4000-8000-000000009999",
      roomId: webchatRoomId,
      filter: "all",
      tab: "human"
    })).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns only messages for the requested conversation", async () => {
    const { service } = buildService();

    const messages = await service.getMessages(tenantId, "conv-web-need-human");

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      conversationId: "conv-web-need-human",
      direction: "inbound",
      senderType: "customer",
      deliveryStatus: "received"
    });
  });

  it("creates tenant-scoped manual replies with mock-only outbound audit logs", async () => {
    const { service, outboundQueue, audit, auditLogs } = buildService();

    const saved = await service.sendAgentMessage(tenantId, "conv-web-need-human", "00000000-0000-4000-8000-000000000010", {
      text: "แอดมินรับเรื่องแล้วครับ",
      senderType: "agent"
    });

    expect(saved).toMatchObject({
      conversationId: "conv-web-need-human",
      direction: "outbound",
      senderType: "agent",
      deliveryStatus: "queued_mock"
    });
    expect(outboundQueue.enqueueOutbound).not.toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "conversation.message_created",
      tenantId,
      conversationId: "conv-web-need-human",
      metadata: expect.objectContaining({
        messageId: "msg-agent-1",
        platform: "webchat",
        channelAccountId: webchatAccountId,
        roomId: webchatRoomId
      })
    }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "outbound.mock_queued",
      tenantId,
      conversationId: "conv-web-need-human",
      entityType: "outbound_message",
      entityId: "msg-agent-1",
      metadata: expect.objectContaining({
        status: "queued_mock",
        platform: "webchat",
        channelAccountId: webchatAccountId,
        roomId: webchatRoomId,
        externalCalls: 0
      })
    }));
    expect(JSON.stringify(auditLogs)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer/i);
  });

  it.each([
    ["telegram", "conv-telegram-need-human"],
    ["line", "conv-line-need-human"],
    ["facebook", "conv-facebook-need-human"],
    ["instagram", "conv-instagram-need-human"]
  ])("preserves platform/account/room context for %s manual reply audit logs", async (platform, conversationId) => {
    const { service, outboundQueue, audit } = buildService();

    const saved = await service.sendAgentMessage(tenantId, conversationId, "00000000-0000-4000-8000-000000000010", {
      text: "แอดมินรับเรื่องแล้วครับ",
      senderType: "agent"
    });

    expect(saved).toMatchObject({
      conversationId,
      direction: "outbound",
      senderType: "agent",
      deliveryStatus: "queued_mock"
    });
    expect(outboundQueue.enqueueOutbound).not.toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "outbound.mock_queued",
      metadata: expect.objectContaining({
        status: "queued_mock",
        platform
      })
    }));
  });

  it("creates and lists persisted internal notes for a conversation", async () => {
    const { service, audit } = buildService();

    const created = await service.createNote(tenantId, "conv-web-need-human", "00000000-0000-4000-8000-000000000011", {
      body: "Follow pricing context",
      visibility: "team"
    });
    const notes = await service.getNotes(tenantId, "conv-web-need-human");

    expect(created).toMatchObject({
      conversationId: "conv-web-need-human",
      contactId: "conv-web-need-human-contact",
      body: "Follow pricing context",
      visibility: "team",
      createdBy: "00000000-0000-4000-8000-000000000011"
    });
    expect(notes.map((note) => note.id)).toEqual([created.id]);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "note.created", tenantId, conversationId: "conv-web-need-human" }));
  });

  it("creates and completes persisted workflow tasks", async () => {
    const { service, audit } = buildService();

    const created = await service.createTask(tenantId, "conv-web-need-human", "00000000-0000-4000-8000-000000000011", {
      title: "Send pricing follow-up",
      assigneeUserId: "00000000-0000-4000-8000-000000000011"
    });
    const completed = await service.completeTask(tenantId, created.id, "00000000-0000-4000-8000-000000000011");

    expect(created).toMatchObject({
      conversationId: "conv-web-need-human",
      contactId: "conv-web-need-human-contact",
      title: "Send pricing follow-up",
      status: "open"
    });
    expect(completed.status).toBe("done");
    expect(completed.completedAt).toBeTruthy();
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "task.created", tenantId, conversationId: "conv-web-need-human" }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "task.completed", tenantId, conversationId: "conv-web-need-human" }));
  });

  it("persists assignment, takeover, and follow-up state with scoped action audit metadata", async () => {
    const { service, assignments, audit, auditLogs } = buildService();
    const actor = demoAgentUserId;

    const assigned = await service.assign(tenantId, "conv-web-need-human", actor, { userId: actor });
    const takeover = await service.takeover(tenantId, "conv-web-need-human", actor);
    const followUp = await service.followUp(tenantId, "conv-web-need-human", actor, { followUpAt: "2026-05-22T04:00:00.000Z" });

    expect(assigned.assignedUserId).toBe(actor);
    expect(takeover.aiState).toBe("human");
    expect(followUp.followUpAt?.toISOString()).toBe("2026-05-22T04:00:00.000Z");
    expect(assignments.some((assignment) => assignment.conversationId === "conv-web-need-human" && assignment.status === "active")).toBe(true);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "conversation.assigned", tenantId, conversationId: "conv-web-need-human" }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "conversation.takeover", tenantId, conversationId: "conv-web-need-human" }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "conversation.follow_up_set", tenantId, conversationId: "conv-web-need-human" }));
    expectScopedActionAuditMetadata(auditLogs.find((log) => log.action === "conversation.takeover"), "conversation.takeover", "conv-web-need-human", "webchat", webchatAccountId, webchatRoomId, actor);
    expectScopedActionAuditMetadata(auditLogs.find((log) => log.action === "conversation.follow_up_set"), "conversation.follow_up_set", "conv-web-need-human", "webchat", webchatAccountId, webchatRoomId, actor);
    expect(auditLogs.find((log) => log.action === "conversation.takeover")?.metadataJson).toEqual(expect.objectContaining({
      fromAiState: "human",
      toAiState: "human",
      fromAssignedUserId: actor,
      toAssignedUserId: actor
    }));
    expect(auditLogs.find((log) => log.action === "conversation.follow_up_set")?.metadataJson).toEqual(expect.objectContaining({
      fromStatus: "open",
      toStatus: "pending",
      fromFollowUpAt: null,
      toFollowUpAt: "2026-05-22T04:00:00.000Z"
    }));
  });

  it("returns a conversation to AI through a tenant-scoped persisted action", async () => {
    const { service, conversations, assignments, audit } = buildService();

    await service.assign(tenantId, "conv-web-need-human", supervisorUserId, { userId: demoAgentUserId });
    const returned = await service.returnToAi(tenantId, "conv-web-need-human", supervisorUserId);

    expect(returned).toMatchObject({ aiState: "ai_active", assignedUserId: null });
    expect(conversations.find((item) => item.id === "conv-web-need-human")).toMatchObject({ aiState: "ai_active", assignedUserId: null });
    expect(assignments.every((assignment) => assignment.status !== "active")).toBe(true);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "conversation.returned_to_ai",
      tenantId,
      conversationId: "conv-web-need-human",
      metadata: expect.objectContaining({
        actionType: "conversation.returned_to_ai",
        tenantId,
        conversationId: "conv-web-need-human",
        platform: "webchat",
        channelAccountId: webchatAccountId,
        roomId: webchatRoomId,
        actorUserId: supervisorUserId,
        fromAssignedUserId: demoAgentUserId,
        toAssignedUserId: null,
        externalCalls: 0
      })
    }));
  });

  it("updates status to closed and spam, then reopens to open with history and audit logs", async () => {
    const { service, conversations, statusHistory, audit, auditLogs } = buildService();
    const actor = demoAgentUserId;

    const closed = await service.updateStatus(tenantId, "conv-web-need-human", actor, { status: "closed" });
    const spam = await service.updateStatus(tenantId, "conv-telegram-need-human", actor, { status: "spam" });
    const reopened = await service.updateStatus(tenantId, "conv-telegram-need-human", actor, { status: "open" });

    expect(closed.status).toBe("closed");
    expect(spam.status).toBe("spam");
    expect(reopened.status).toBe("open");
    expect(conversations.find((item) => item.id === "conv-web-need-human")?.status).toBe("closed");
    expect(statusHistory.map((item) => item.toStatus)).toEqual(["open", "spam", "closed"]);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "conversation.status_updated", tenantId }));
    expectScopedActionAuditMetadata(auditLogs.find((log) => log.action === "conversation.status_updated" && log.conversationId === "conv-web-need-human"), "conversation.status_updated", "conv-web-need-human", "webchat", webchatAccountId, webchatRoomId, actor);
    expect(auditLogs.find((log) => log.action === "conversation.status_updated" && log.conversationId === "conv-web-need-human")?.metadataJson).toEqual(expect.objectContaining({
      fromStatus: "open",
      toStatus: "closed"
    }));
  });

  it("preserves room and platform separation after status changes", async () => {
    const { service } = buildService();

    await service.updateStatus(tenantId, "conv-telegram-need-human", supervisorUserId, { status: "closed" });
    const webchat = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "closed", tab: "human" });
    const telegram = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "closed", tab: "human" });

    expect(webchat.map((item) => item.id)).toEqual(["conv-web-closed"]);
    expect(telegram.map((item) => item.id)).toEqual(["conv-telegram-need-human", "conv-telegram-closed"]);
    expect(webchat.every((item) => item.roomId === webchatRoomId)).toBe(true);
    expect(telegram.every((item) => item.roomId === telegramRoomId)).toBe(true);
  });

  it("updates priority, read state, and SLA fields with audit logs", async () => {
    const { service, audit, auditLogs } = buildService();

    const priority = await service.updatePriority(tenantId, "conv-web-need-human", supervisorUserId, { priority: "urgent" });
    const readState = await service.updateReadState(tenantId, "conv-web-need-human", supervisorUserId, { unread: false, unreplied: false });
    const sla = await service.updateSla(tenantId, "conv-web-need-human", supervisorUserId, {
      slaDueAt: "2026-05-21T04:30:00.000Z",
      firstResponseDueAt: "2026-05-21T04:30:00.000Z",
      resolutionDueAt: "2026-05-21T08:00:00.000Z",
      slaStatus: "warning"
    });

    expect(priority.priority).toBe("urgent");
    expect(readState.unread).toBe(false);
    expect(readState.unreplied).toBe(false);
    expect(sla.slaDueAt?.toISOString()).toBe("2026-05-21T04:30:00.000Z");
    expect(sla.slaStatus).toBe("warning");
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "conversation.priority_updated", tenantId }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "conversation.read_state_updated", tenantId }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "conversation.sla_updated", tenantId }));
    expectScopedActionAuditMetadata(auditLogs.find((log) => log.action === "conversation.priority_updated"), "conversation.priority_updated", "conv-web-need-human", "webchat", webchatAccountId, webchatRoomId, supervisorUserId);
    expectScopedActionAuditMetadata(auditLogs.find((log) => log.action === "conversation.read_state_updated"), "conversation.read_state_updated", "conv-web-need-human", "webchat", webchatAccountId, webchatRoomId, supervisorUserId);
    expect(auditLogs.find((log) => log.action === "conversation.priority_updated")?.metadataJson).toEqual(expect.objectContaining({
      fromPriority: "normal",
      toPriority: "urgent"
    }));
    expect(auditLogs.find((log) => log.action === "conversation.read_state_updated")?.metadataJson).toEqual(expect.objectContaining({
      fromUnread: true,
      toUnread: false,
      fromUnreplied: true,
      toUnreplied: false
    }));
  });

  it("creates safe action audit metadata with platform account room context and no secret fields", async () => {
    const { service, auditLogs } = buildService();

    await service.updatePriority(tenantId, "conv-telegram-need-human", supervisorUserId, { priority: "high" });
    await service.updateReadState(tenantId, "conv-telegram-need-human", supervisorUserId, { unread: false });
    await service.updateStatus(tenantId, "conv-telegram-need-human", supervisorUserId, { status: "pending" });

    const logs = auditLogs.filter((log) => log.conversationId === "conv-telegram-need-human");
    expect(logs.map((log) => log.action)).toEqual([
      "conversation.status_updated",
      "conversation.read_state_updated",
      "conversation.priority_updated"
    ]);
    for (const log of logs) {
      expect(log.metadataJson).toEqual(expect.objectContaining({
        actionType: log.action,
        tenantId,
        conversationId: "conv-telegram-need-human",
        platform: "telegram",
        channelAccountId: telegramAccountId,
        roomId: telegramRoomId,
        actorUserId: supervisorUserId,
        externalCalls: 0
      }));
    }
    expect(JSON.stringify(logs)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|password|Bearer/i);
  });

  it("gets and updates room AI policy with tenant-scoped knowledge base links", async () => {
    const { service, audit, roomKnowledgeBaseLinks } = buildService();

    const before = await service.getAiPolicy(tenantId, webchatRoomId);
    const updated = await service.updateAiPolicy(tenantId, webchatRoomId, supervisorUserId, {
      aiMode: "human_first",
      autoReplyThreshold: 0.8,
      draftThreshold: 0.55,
      requireCitationsForAutoReply: true,
      handoffOnHighRisk: true,
      knowledgeBaseIds: ["kb-default"]
    });

    expect(before).toMatchObject({ roomId: webchatRoomId, aiMode: "suggest", knowledgeBaseIds: ["kb-default"] });
    expect(updated).toMatchObject({
      roomId: webchatRoomId,
      aiMode: "human_first",
      autoReplyThreshold: 0.8,
      draftThreshold: 0.55,
      knowledgeBaseIds: ["kb-default"]
    });
    expect(roomKnowledgeBaseLinks.map((item) => item.knowledgeBaseId)).toEqual(["kb-default"]);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "room.ai_policy_updated", tenantId, entityId: webchatRoomId }));
  });

  it("returns readable 404s for unknown room AI policy resources", async () => {
    const { service } = buildService();

    await expect(service.getAiPolicy(tenantId, "missing-room")).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Room not found"
    });
    await expect(service.updateAiPolicy(tenantId, webchatRoomId, supervisorUserId, {
      knowledgeBaseIds: ["kb-other-tenant"]
    })).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Knowledge base not found"
    });
  });

  it("accepts normal priority API payloads and maps them to persisted normal priority", async () => {
    const { service } = buildService();

    const updated = await service.updatePriority(tenantId, "conv-web-need-human", supervisorUserId, { priority: "normal" });

    expect(updated.priority).toBe("normal");
  });

  it("returns a readable 400 for invalid priority payloads", async () => {
    const { service } = buildService();

    await expect(service.updatePriority(tenantId, "conv-web-need-human", supervisorUserId, { priority: "bad" } as never)).rejects.toMatchObject({
      constructor: BadRequestException,
      message: "Invalid conversation priority. Allowed values: low, normal, high, urgent"
    });
  });

  it("returns readable 404 for unknown Sprint 16 conversation mutations", async () => {
    const { service } = buildService();

    await expect(service.updatePriority(tenantId, "missing-conversation", supervisorUserId, { priority: "high" })).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Conversation not found"
    });
  });

  it("returns tenant-scoped audit logs for a conversation", async () => {
    const { service, auditLogs } = buildService();
    auditLogs.push({
      id: "audit-other-tenant",
      tenantId: "00000000-0000-4000-8000-000000009999",
      conversationId: "conv-web-need-human",
      actorUserId: null,
      action: "conversation.status_updated",
      beforeJson: null,
      afterJson: null,
      metadataJson: null,
      metadata: null,
      createdAt: new Date("2026-05-21T04:00:00.000Z")
    });

    await service.updateStatus(tenantId, "conv-web-need-human", supervisorUserId, { status: "closed" });
    const logs = await service.getAuditLogs(tenantId, "conv-web-need-human");

    expect(logs.map((log) => log.tenantId)).toEqual([tenantId]);
    expect(logs.some((log) => log.action === "conversation.status_updated")).toBe(true);
    expect(logs[0]).toEqual(expect.objectContaining({
      platform: "webchat",
      channelAccountId: webchatAccountId,
      roomId: webchatRoomId
    }));
    expect(logs[0]?.metadataJson).toEqual(expect.objectContaining({
      platform: "webchat",
      channelAccountId: webchatAccountId,
      roomId: webchatRoomId
    }));
    expect(JSON.stringify(logs)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer/i);
  });

  it("returns tenant-scoped status history with platform account room context", async () => {
    const { service } = buildService();

    await service.updateStatus(tenantId, "conv-web-need-human", supervisorUserId, { status: "closed" });
    const history = await service.getStatusHistory(tenantId, "conv-web-need-human");

    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(expect.objectContaining({
      tenantId,
      conversationId: "conv-web-need-human",
      platform: "webchat",
      channelAccountId: webchatAccountId,
      roomId: webchatRoomId,
      fromStatus: "open",
      toStatus: "closed"
    }));
    expect(history[0]?.metadataJson).toEqual(expect.objectContaining({
      platform: "webchat",
      channelAccountId: webchatAccountId,
      roomId: webchatRoomId
    }));
  });

  it("assigns a conversation to the seeded demo user and persists assignedUserId", async () => {
    const { service, conversations, assignments } = buildService();

    const assigned = await service.assign(tenantId, "conv-telegram-need-human", supervisorUserId, { userId: demoAgentUserId });

    expect(assigned.assignedUserId).toBe(demoAgentUserId);
    expect(conversations.find((item) => item.id === "conv-telegram-need-human")?.assignedUserId).toBe(demoAgentUserId);
    expect(assignments.at(-1)).toMatchObject({
      tenantId,
      conversationId: "conv-telegram-need-human",
      userId: demoAgentUserId,
      assignedByUserId: supervisorUserId,
      status: "active"
    });
  });

  it("reflects the assigned agent in room conversation listings", async () => {
    const { service } = buildService();

    await service.assign(tenantId, "conv-web-need-human", supervisorUserId, { userId: demoAgentUserId });
    const conversations = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "all", tab: "human" });

    expect(conversations).toHaveLength(1);
    expect(conversations[0]).toMatchObject({
      id: "conv-web-need-human",
      assignedAgent: "May"
    });
  });

  it("returns a readable error for an unknown assignment user", async () => {
    const { service } = buildService();

    await expect(service.assign(tenantId, "conv-web-need-human", supervisorUserId, {
      userId: "00000000-0000-4000-8000-000000009999"
    })).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Assigned user not found"
    });
  });

  it("returns a readable 404 when the user exists outside the tenant", async () => {
    const { service } = buildService();

    await expect(service.assign(tenantId, "conv-web-need-human", supervisorUserId, {
      userId: otherTenantUserId
    })).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Assigned user not found"
    });
  });

  it("returns a readable error for a missing assignment userId", async () => {
    const { service } = buildService();

    await expect(service.assign(tenantId, "conv-web-need-human", supervisorUserId, {} as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns a readable error for an unknown assignment conversation", async () => {
    const { service } = buildService();

    await expect(service.assign(tenantId, "conv-missing", supervisorUserId, { userId: demoAgentUserId })).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Conversation not found"
    });
  });

  it("keeps room separation after assignment changes", async () => {
    const { service } = buildService();

    await service.assign(tenantId, "conv-telegram-need-human", supervisorUserId, { userId: demoAgentUserId });
    const webchat = await service.listConversations({ tenantId, roomId: webchatRoomId, filter: "all", tab: "human" });
    const telegram = await service.listConversations({ tenantId, roomId: telegramRoomId, filter: "all", tab: "human" });

    expect(webchat.map((item) => item.id)).toEqual(["conv-web-need-human"]);
    expect(telegram.map((item) => item.id)).toEqual(["conv-telegram-need-human"]);
    expect(webchat.every((item) => item.roomId === webchatRoomId)).toBe(true);
    expect(telegram.every((item) => item.roomId === telegramRoomId)).toBe(true);
  });

  it("takeover assigns the safe demo user when no explicit user is supplied", async () => {
    const { service, conversations, assignments } = buildService();

    const takeover = await service.takeover(tenantId, "conv-web-need-human", undefined);

    expect(takeover).toMatchObject({ aiState: "human", assignedUserId: demoAgentUserId });
    expect(conversations.find((item) => item.id === "conv-web-need-human")?.assignedUserId).toBe(demoAgentUserId);
    expect(assignments.at(-1)).toMatchObject({
      tenantId,
      conversationId: "conv-web-need-human",
      userId: demoAgentUserId,
      assignedByUserId: undefined,
      status: "active"
    });
  });

  it("takeover returns a readable error when the required user is missing", async () => {
    const { service } = buildService();

    await expect(service.takeover(tenantId, "conv-web-need-human", "00000000-0000-4000-8000-000000009999")).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Takeover user not found"
    });
  });
});

describe("ConversationService webhook persistence", () => {
  it.each([
    ["telegram", telegramAccountId, telegramRoomId, "tg-user-1", "tg-msg-001", "telegram test message"],
    ["line", lineAccountId, lineRoomId, "line-user-1", "line-msg-001", "line test message"],
    ["facebook", facebookAccountId, facebookRoomId, "fb-user-1", "fb-msg-001", "facebook test message"],
    ["instagram", instagramAccountId, instagramRoomId, "ig-user-1", "ig-msg-001", "instagram test message"]
  ] as const)("persists %s webhook inbound messages in the correct room", async (platform, channelAccountId, roomId, externalUserId, platformMessageId, text) => {
    const { service, store, outboundQueue } = buildIngestService();

    const result = await service.ingest(normalizedInbound(platform, channelAccountId, externalUserId, platformMessageId, text));

    expect(result.duplicate).toBe(false);
    expect(result.conversation.roomId).toBe(roomId);
    expect(result.message).toMatchObject({
      conversationId: result.conversation.id,
      channelAccountId,
      platformMessageId,
      senderType: "user",
      text
    });
    expect(store.messages).toHaveLength(1);
    expect(store.conversations).toHaveLength(1);
    expect(store.conversations[0]?.roomId).toBe(roomId);
    expect(outboundQueue.enqueueAi).toHaveBeenCalledWith(result.conversation.id, result.message.id);
  });

  it("does not create duplicate messages for the same platformMessageId on the same account", async () => {
    const { service, store } = buildIngestService();
    const inbound = normalizedInbound("telegram", telegramAccountId, "tg-user-1", "tg-msg-duplicate", "first delivery");

    const first = await service.ingest(inbound);
    const second = await service.ingest({ ...inbound, text: "redelivery" });

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.message.id).toBe(first.message.id);
    expect(store.messages).toHaveLength(1);
  });

  it("allows the same platformMessageId on different channel accounts without merging conversations", async () => {
    const { service, store } = buildIngestService();

    const telegram = await service.ingest(normalizedInbound("telegram", telegramAccountId, "shared-user", "same-platform-message", "telegram copy"));
    const line = await service.ingest(normalizedInbound("line", lineAccountId, "shared-user", "same-platform-message", "line copy"));

    expect(telegram.duplicate).toBe(false);
    expect(line.duplicate).toBe(false);
    expect(telegram.conversation.roomId).toBe(telegramRoomId);
    expect(line.conversation.roomId).toBe(lineRoomId);
    expect(telegram.conversation.id).not.toBe(line.conversation.id);
    expect(store.messages).toHaveLength(2);
  });
});

function buildIngestService() {
  const store: {
    accounts: Array<Record<string, any>>;
    rooms: Array<Record<string, any>>;
    contacts: Array<Record<string, any>>;
    identities: Array<Record<string, any>>;
    conversations: Array<Record<string, any>>;
    messages: Array<Record<string, any>>;
    auditLogs: Array<Record<string, any>>;
  } = {
    accounts: [
      account("webchat", webchatAccountId, "Main Website"),
      account("telegram", telegramAccountId, "Bot 007237"),
      account("line", lineAccountId, "LINE OA Main"),
      account("facebook", facebookAccountId, "Page หลัก"),
      account("instagram", instagramAccountId, "IG ร้านค้า")
    ],
    rooms: [
      room(webchatRoomId, "webchat", "Main Website", webchatAccountId, 0),
      room(telegramRoomId, "telegram", "Bot 007237", telegramAccountId, 0),
      room(lineRoomId, "line", "LINE OA Main", lineAccountId, 0),
      room(facebookRoomId, "facebook", "Page หลัก", facebookAccountId, 0),
      room(instagramRoomId, "instagram", "IG ร้านค้า", instagramAccountId, 0)
    ],
    contacts: [],
    identities: [],
    conversations: [],
    messages: [],
    auditLogs: []
  };

  const tx = {
    channelAccount: {
      findUniqueOrThrow: vi.fn(async ({ where }) => {
        const found = store.accounts.find((item) => item.id === where.id);
        if (!found) throw new Error("ChannelAccount not found");
        return found;
      })
    },
    room: {
      upsert: vi.fn(async ({ where, create, update }) => {
        const key = where.tenantId_platform_channelAccountId;
        const found = store.rooms.find((item) =>
          item.tenantId === key.tenantId &&
          item.platform === key.platform &&
          item.channelAccountId === key.channelAccountId
        );
        if (found) return Object.assign(found, update);
        const saved = { id: `room-${create.platform}-${store.rooms.length}`, createdAt: new Date(), updatedAt: new Date(), ...create };
        store.rooms.push(saved);
        return saved;
      })
    },
    contactIdentity: {
      findUnique: vi.fn(async ({ where }) => {
        const key = where.tenantId_platform_channelAccountId_externalUserId;
        return store.identities.find((item) =>
          item.tenantId === key.tenantId &&
          item.platform === key.platform &&
          item.channelAccountId === key.channelAccountId &&
          item.externalUserId === key.externalUserId
        ) ?? null;
      }),
      create: vi.fn(async ({ data }) => {
        const saved = { id: `identity-${store.identities.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        store.identities.push(saved);
        return saved;
      })
    },
    contact: {
      create: vi.fn(async ({ data }) => {
        const saved = { id: `contact-${store.contacts.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        store.contacts.push(saved);
        return saved;
      })
    },
    conversation: {
      findFirst: vi.fn(async ({ where }) =>
        store.conversations.find((item) =>
          item.tenantId === where.tenantId &&
          item.roomId === where.roomId &&
          item.contactIdentityId === where.contactIdentityId &&
          !where.status?.notIn?.includes(item.status)
        ) ?? null
      ),
      create: vi.fn(async ({ data }) => {
        const saved = {
          id: `conversation-${store.conversations.length + 1}`,
          priority: "normal",
          assignedUserId: null,
          unread: true,
          unreplied: true,
          followUpAt: null,
          lastMessageAt: new Date("2026-05-21T04:00:00.000Z"),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data
        };
        store.conversations.push(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }) => {
        const index = store.conversations.findIndex((item) => item.id === where.id);
        const saved = { ...store.conversations[index], ...data, updatedAt: new Date() };
        store.conversations[index] = saved;
        return saved;
      })
    },
    message: {
      findUnique: vi.fn(async ({ where }) => {
        const key = where.channelAccountId_platformMessageId;
        return store.messages.find((item) =>
          item.channelAccountId === key.channelAccountId &&
          item.platformMessageId === key.platformMessageId
        ) ?? null;
      }),
      create: vi.fn(async ({ data }) => {
        const saved = {
          id: `message-${store.messages.length + 1}`,
          createdAt: new Date("2026-05-21T04:01:00.000Z"),
          ...data,
          attachments: []
        };
        store.messages.push(saved);
        return saved;
      })
    },
    auditLog: {
      create: vi.fn(async ({ data }) => {
        const saved = { id: `audit-${store.auditLogs.length + 1}`, createdAt: new Date(), ...data };
        store.auditLogs.push(saved);
        return saved;
      })
    }
  };

  const prisma = { $transaction: vi.fn(async (callback) => callback(tx)) };
  const audit = { record: vi.fn(async () => null) };
  const outboundQueue = { enqueueOutbound: vi.fn(async () => null), enqueueAi: vi.fn(async () => null) };
  const realtime = { conversationUpdated: vi.fn() };
  const service = new ConversationService(prisma as never, audit as never, outboundQueue as never, realtime as never);
  return { service, store, tx, outboundQueue, realtime };
}

function room(id: string, platform: string, displayName: string, channelAccountId: string, count: number) {
  return {
    id,
    tenantId,
    platform,
    channelAccountId,
    name: displayName,
    aiMode: "suggest",
    autoReplyThreshold: 0.85,
    draftThreshold: 0.6,
    requireCitationsForAutoReply: true,
    handoffOnHighRisk: true,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z"),
    channelAccount: { id: channelAccountId, displayName },
    _count: { conversations: count },
    knowledgeBases: []
  };
}

function withRoomKnowledgeBases(room: Record<string, any>, links: Array<Record<string, any>>) {
  return {
    ...room,
    knowledgeBases: links
      .filter((item) => item.tenantId === room.tenantId && item.roomId === room.id)
      .map((item) => ({ knowledgeBaseId: item.knowledgeBaseId }))
  };
}

function account(platform: string, id: string, displayName: string) {
  return {
    id,
    tenantId,
    platform,
    displayName,
    externalAccountId: `${platform}-external`,
    accountKey: platform === "webchat" ? "demo-webchat" : null,
    accessTokenCiphertext: null,
    webhookSecret: null,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function normalizedInbound(
  platform: "telegram" | "line" | "facebook" | "instagram",
  channelAccountId: string,
  externalUserId: string,
  platformMessageId: string,
  text: string
) {
  return {
    tenantId,
    platform,
    channelAccountId,
    externalUserId,
    externalConversationId: externalUserId,
    externalMessageId: platformMessageId,
    direction: "inbound" as const,
    senderType: "customer" as const,
    platformMessageId,
    messageType: "text" as const,
    text,
    attachments: [],
    timestamp: "2026-05-21T04:00:00.000Z",
    rawPayload: { platformMessageId }
  };
}

function conversation(id: string, roomId: string, platform: string, accountName: string, displayName: string, aiState: string, status: string, text: string) {
  const createdAt = new Date("2026-05-21T04:00:00.000Z");
  const channelAccountId = accountIdForPlatform(platform);
  return {
    id,
    tenantId,
    roomId,
    contactId: `${id}-contact`,
    contactIdentityId: `${id}-identity`,
    status,
    priority: "normal",
    assignedUserId: null,
    aiState,
    unread: true,
    unreplied: true,
    followUpAt: null,
    slaDueAt: null,
    slaBreachedAt: null,
    slaStatus: "ok",
    firstResponseDueAt: null,
    resolutionDueAt: null,
    lastMessageAt: createdAt,
    createdAt,
    updatedAt: createdAt,
    contact: { displayName, email: null, phone: null, identities: [], tags: [] },
    contactIdentity: { displayName, externalUserId: `${id}-external` },
    assignedUser: null,
    room: { id: roomId, platform, channelAccount: { displayName: accountName, id: channelAccountId }, channelAccountId },
    messages: [{ text, createdAt }]
  };
}

function message(id: string, conversationId: string, senderType: string, text: string, platformMessageId: string, channelAccountId = webchatAccountId) {
  return {
    id,
    tenantId,
    conversationId,
    channelAccountId,
    platformMessageId,
    senderType,
    messageType: "text",
    text,
    rawPayload: null,
    createdAt: new Date("2026-05-21T04:01:00.000Z"),
    attachments: [],
    agentUser: null
  };
}

function expectScopedActionAuditMetadata(
  log: Record<string, any> | undefined,
  action: string,
  conversationId: string,
  platform: string,
  channelAccountId: string,
  roomId: string,
  actorUserId: string | null | undefined
) {
  expect(log?.metadataJson).toEqual(expect.objectContaining({
    actionType: action,
    tenantId,
    conversationId,
    platform,
    channelAccountId,
    roomId,
    actorUserId: actorUserId ?? null,
    externalCalls: 0
  }));
  expect(JSON.stringify(log)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|password|Bearer/i);
}

function stripUndefined<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function accountIdForPlatform(platform: string) {
  if (platform === "telegram") return telegramAccountId;
  if (platform === "line") return lineAccountId;
  if (platform === "facebook") return facebookAccountId;
  if (platform === "instagram") return instagramAccountId;
  return webchatAccountId;
}
