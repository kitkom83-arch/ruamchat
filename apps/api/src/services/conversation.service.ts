import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  AgentMessageRequest,
  AssignConversationRequest,
  CoreConversationTab,
  ConversationFilter,
  CreateInternalNoteRequest,
  CreateTaskRequest,
  FollowUpConversationRequest,
  NormalizedInboundMessage,
  RoomAiPolicyPatch,
  SendMessageRequest,
  UpdateConversationPriorityRequest,
  UpdateConversationReadStateRequest,
  UpdateConversationSlaRequest,
  UpdateConversationStatusRequest,
  UpdateTaskRequest
} from "@ai-omni/shared";
import { ConversationPriority, ConversationSlaStatus, ConversationStatus, Platform, Prisma, SenderType } from "@prisma/client";
import crypto from "node:crypto";
import { AuditService } from "./audit.service.js";
import { OutboundQueueService } from "./outbound-queue.service.js";
import { PrismaService } from "./prisma.service.js";
import { RealtimeGateway } from "./realtime.gateway.js";

const demoTakeoverUserId = "00000000-0000-4000-8000-000000000011";

@Injectable()
export class ConversationService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(AuditService)
    private readonly audit: AuditService,
    @Inject(OutboundQueueService)
    private readonly outboundQueue: OutboundQueueService,
    @Inject(RealtimeGateway)
    private readonly realtime: RealtimeGateway
  ) {}

  async listRooms(tenantId: string) {
    const rooms = await this.prisma.room.findMany({
      where: { tenantId },
      include: {
        channelAccount: true,
        _count: {
          select: {
            conversations: {
              where: { status: { notIn: ["closed", "spam"] } }
            }
          }
        }
      },
      orderBy: [{ platform: "asc" }, { name: "asc" }]
    });

    return rooms.map((room) => ({
      id: room.id,
      platform: room.platform,
      platformLabel: platformLabel(room.platform),
      accountName: room.channelAccount.displayName,
      roomName: room.name,
      accent: platformAccent(room.platform),
      conversationCount: room._count.conversations
    }));
  }

  async listConversations(input: {
    tenantId: string;
    roomId: string;
    filter: ConversationFilter;
    userId?: string;
    tab?: CoreConversationTab;
    agentId?: string;
    search?: string;
  }) {
    const where: Prisma.ConversationWhereInput = {
      tenantId: input.tenantId,
      roomId: input.roomId
    };
    const andFilters: Prisma.ConversationWhereInput[] = [];

    if (input.filter === "my" || input.filter === "my_inbox") where.assignedUserId = input.agentId ?? input.userId ?? "__none__";
    if (input.filter === "unassigned") where.assignedUserId = null;
    if (input.filter === "ai_active") where.aiState = "ai_active";
    if (input.filter === "need_human") where.aiState = "need_human";
    if (input.filter === "unread") where.unread = true;
    if (input.filter === "unreplied") where.unreplied = true;
    if (input.filter === "follow_up") where.followUpAt = { not: null };
    if (input.filter === "sla_warning") {
      const now = new Date();
      andFilters.push({
        OR: [
          { slaStatus: "warning" },
          { slaDueAt: { gt: now, lte: new Date(now.getTime() + 15 * 60 * 1000) } }
        ]
      });
    }
    if (input.filter === "sla_breached") {
      andFilters.push({
        OR: [
          { slaStatus: "breached" },
          { slaBreachedAt: { not: null } },
          { slaDueAt: { lte: new Date() } }
        ]
      });
    }
    if (input.filter === "closed") where.status = "closed";
    if (input.filter === "spam") where.status = "spam";
    if (!["closed", "spam"].includes(input.filter)) where.status = { notIn: ["closed", "spam"] };
    if (input.agentId && !["my", "my_inbox"].includes(input.filter)) where.assignedUserId = input.agentId;
    if (input.tab === "bot") where.aiState = "ai_active";
    if (input.search?.trim()) {
      const search = input.search.trim();
      andFilters.push({
        OR: [
          { contact: { displayName: { contains: search, mode: "insensitive" } } },
          { messages: { some: { text: { contains: search, mode: "insensitive" } } } }
        ]
      });
    }
    if (andFilters.length > 0) where.AND = andFilters;

    const conversations = await this.prisma.conversation.findMany({
      where,
      include: {
        contact: { include: { identities: true, tags: { include: { tag: true } } } },
        contactIdentity: true,
        assignedUser: true,
        room: { include: { channelAccount: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 }
      },
      orderBy: { lastMessageAt: "desc" }
    });

    return conversations.map((conversation) => {
      const lastMessage = conversation.messages[0];
      const lastMessageAt = conversation.lastMessageAt.toISOString();
      const aiStatus = mapAiStatus(conversation.aiState, conversation.status);
      return {
        id: conversation.id,
        roomId: conversation.roomId,
        tab: aiStatus === "AI Active" ? "bot" : "human",
        platform: conversation.room.platform,
        platformLabel: platformLabel(conversation.room.platform),
        channelAccountId: conversation.room.channelAccountId,
        accountName: conversation.room.channelAccount.displayName,
        customerName: conversation.contactIdentity.displayName ?? conversation.contact.displayName,
        customerEmail: conversation.contact.email ?? "-",
        customerPhone: conversation.contact.phone ?? "-",
        lastMessage: lastMessage?.text ?? "-",
        lastMessageAt,
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
    });
  }

  async getMessages(tenantId: string, conversationId: string) {
    await this.ensureConversation(tenantId, conversationId);
    const messages = await this.prisma.message.findMany({
      where: { tenantId, conversationId },
      include: { attachments: true, agentUser: true },
      orderBy: { createdAt: "asc" }
    });
    return messages.map((message) => this.mapMessage(message));
  }

  async getNotes(tenantId: string, conversationId: string) {
    const conversation = await this.ensureConversation(tenantId, conversationId);
    const notes = await this.prisma.internalNote.findMany({
      where: { tenantId, conversationId },
      orderBy: { createdAt: "desc" }
    });
    return notes.map((note) => this.mapInternalNote(note, conversation.contactId));
  }

  async createNote(tenantId: string, conversationId: string, actorUserId: string | undefined, request: CreateInternalNoteRequest) {
    const conversation = await this.ensureConversation(tenantId, conversationId);
    const note = await this.prisma.internalNote.create({
      data: {
        tenantId,
        conversationId,
        contactId: conversation.contactId,
        authorUserId: actorUserId,
        body: request.body,
        visibility: request.visibility ?? "team"
      }
    });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "note.created",
      entityType: "conversation",
      entityId: conversationId,
      metadata: { noteId: note.id }
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return this.mapInternalNote(note, conversation.contactId);
  }

  async getTasks(tenantId: string, conversationId: string) {
    await this.ensureConversation(tenantId, conversationId);
    const tasks = await this.prisma.task.findMany({
      where: { tenantId, conversationId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    });
    return tasks.map(mapTask);
  }

  async createTask(tenantId: string, conversationId: string, actorUserId: string | undefined, request: CreateTaskRequest) {
    const conversation = await this.ensureConversation(tenantId, conversationId);
    const task = await this.prisma.task.create({
      data: {
        tenantId,
        conversationId,
        contactId: conversation.contactId,
        title: request.title,
        assigneeUserId: request.assigneeUserId ?? null,
        createdByUserId: actorUserId,
        dueAt: request.dueAt ? new Date(request.dueAt) : null
      }
    });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "task.created",
      entityType: "conversation",
      entityId: conversationId,
      metadata: { taskId: task.id }
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return mapTask(task);
  }

  async ingest(message: NormalizedInboundMessage) {
    const result = await this.prisma.$transaction(async (tx) => {
      const channelAccount = await tx.channelAccount.findUniqueOrThrow({ where: { id: message.channelAccountId } });

      const room = await tx.room.upsert({
        where: {
          tenantId_platform_channelAccountId: {
            tenantId: message.tenantId,
            platform: message.platform,
            channelAccountId: message.channelAccountId
          }
        },
        update: {},
        create: {
          tenantId: message.tenantId,
          platform: message.platform,
          channelAccountId: message.channelAccountId,
          name: channelAccount.displayName,
          aiMode: "suggest"
        }
      });

      const existingIdentity = await tx.contactIdentity.findUnique({
        where: {
          tenantId_platform_channelAccountId_externalUserId: {
            tenantId: message.tenantId,
            platform: message.platform,
            channelAccountId: message.channelAccountId,
            externalUserId: message.externalUserId
          }
        }
      });

      const identity = existingIdentity ?? await this.createContactAndIdentity(tx, message);

      let conversation = await tx.conversation.findFirst({
        where: {
          tenantId: message.tenantId,
          roomId: room.id,
          contactIdentityId: identity.id,
          status: { notIn: ["closed", "spam"] }
        },
        orderBy: { lastMessageAt: "desc" }
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            tenantId: message.tenantId,
            roomId: room.id,
            contactId: identity.contactId,
            contactIdentityId: identity.id,
            externalConversationId: message.externalConversationId,
            status: "open",
            aiState: "idle"
          }
        });
      }

      const existingMessage = await tx.message.findUnique({
        where: {
          channelAccountId_platformMessageId: {
            channelAccountId: message.channelAccountId,
            platformMessageId: message.platformMessageId
          }
        }
      });

      if (existingMessage) {
        return { conversation, message: existingMessage, duplicate: true };
      }

      const savedMessage = await tx.message.create({
        data: {
          tenantId: message.tenantId,
          conversationId: conversation.id,
          channelAccountId: message.channelAccountId,
          platformMessageId: message.platformMessageId,
          senderType: "user",
          messageType: message.messageType,
          text: message.text,
          rawPayload: message.rawPayload as Prisma.InputJsonValue,
          attachments: {
            create: message.attachments.map((attachment) => ({
              type: attachment.type,
              url: attachment.url,
              storageKey: attachment.storageKey,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes
            }))
          }
        }
      });

      const aiState = room.aiMode === "off" || room.aiMode === "human_first" ? "need_human" : "ai_active";
      const updatedConversation = await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(message.timestamp),
          unread: true,
          unreplied: true,
          aiState
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: message.tenantId,
          conversationId: conversation.id,
          action: "message.ingested",
          entityType: "conversation",
          entityId: conversation.id,
          metadata: {
            platform: message.platform,
            channelAccountId: message.channelAccountId,
            platformMessageId: message.platformMessageId
          },
          metadataJson: {
            platform: message.platform,
            channelAccountId: message.channelAccountId,
            platformMessageId: message.platformMessageId
          }
        }
      });

      return { conversation: updatedConversation, message: savedMessage, duplicate: false };
    });

    if (!result.duplicate) {
      await this.outboundQueue.enqueueAi(result.conversation.id, result.message.id);
      this.realtime.conversationUpdated(message.tenantId, { conversationId: result.conversation.id });
    }

    return result;
  }

  async sendAgentMessage(tenantId: string, conversationId: string, actorUserId: string | undefined, request: SendMessageRequest | AgentMessageRequest) {
    const conversation = await this.ensureConversation(tenantId, conversationId);
    const text = request.text.trim();
    if (!text) throw new BadRequestException("Message text is required");
    const message = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId,
        channelAccountId: conversation.room.channelAccountId,
        platformMessageId: `internal-${crypto.randomUUID()}`,
        senderType: "agent",
        agentUserId: actorUserId,
        messageType: "attachments" in request ? request.attachments[0]?.type ?? "text" : "text",
        text,
        attachments: {
          create: ("attachments" in request ? request.attachments : []).map((attachment) => ({
            type: attachment.type,
            url: attachment.url,
            storageKey: attachment.storageKey,
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            sizeBytes: attachment.sizeBytes
          }))
        }
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { unread: false, unreplied: false, aiState: "human", lastMessageAt: new Date() }
    });

    const outboundContext = {
      messageId: message.id,
      status: "queued_mock",
      platform: conversation.room.platform,
      channelAccountId: conversation.room.channelAccountId,
      roomId: conversation.roomId,
      conversationId,
      externalConversationId: conversation.externalConversationId,
      externalUserId: conversation.contactIdentity.externalUserId,
      externalCalls: 0
    };
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.message_created",
      entityType: "conversation",
      entityId: conversationId,
      metadata: {
        messageId: message.id,
        senderType: "agent",
        platform: conversation.room.platform,
        channelAccountId: conversation.room.channelAccountId,
        roomId: conversation.roomId
      }
    });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "outbound.mock_queued",
      entityType: "outbound_message",
      entityId: message.id,
      metadata: outboundContext
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return { ...this.mapMessage(message), deliveryStatus: "queued_mock" as const };
  }

  async assign(tenantId: string, conversationId: string, actorUserId: string | undefined, request: AssignConversationRequest) {
    const before = await this.ensureConversation(tenantId, conversationId);
    if (request.userId === undefined) throw new BadRequestException("Missing userId");
    if (request.userId) await this.ensureTenantUser(tenantId, request.userId, "Assigned user not found");
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.assignment.updateMany({
        where: { tenantId, conversationId, status: "active" },
        data: { status: request.userId ? "transferred" : "released" }
      });
      const conversation = await tx.conversation.update({
        where: { id: conversationId },
        data: { assignedUserId: request.userId ?? null, aiState: request.userId ? "human" : undefined }
      });
      await tx.assignment.create({
        data: {
          tenantId,
          conversationId,
          userId: request.userId ?? null,
          assignedByUserId: actorUserId,
          status: request.userId ? "active" : "released"
        }
      });
      return conversation;
    });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.assigned",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.assigned", actorUserId, {
        fromAssignedUserId: before.assignedUserId,
        toAssignedUserId: request.userId ?? null
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async takeover(tenantId: string, conversationId: string, actorUserId: string | undefined) {
    const before = await this.ensureConversation(tenantId, conversationId);
    const takeoverUserId = actorUserId ?? demoTakeoverUserId;
    await this.ensureTenantUser(tenantId, takeoverUserId, "Takeover user not found");
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.assignment.updateMany({
        where: { tenantId, conversationId, status: "active" },
        data: { status: "transferred" }
      });
      const conversation = await tx.conversation.update({
        where: { id: conversationId },
        data: { aiState: "human", assignedUserId: takeoverUserId }
      });
      await tx.assignment.create({
        data: { tenantId, conversationId, userId: takeoverUserId, assignedByUserId: actorUserId, status: "active" }
      });
      return conversation;
    });
    await this.audit.record({
      tenantId,
      actorUserId: actorUserId ?? takeoverUserId,
      conversationId,
      action: "conversation.takeover",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.takeover", actorUserId ?? takeoverUserId, {
        fromAiState: before.aiState,
        toAiState: "human",
        fromAssignedUserId: before.assignedUserId,
        toAssignedUserId: takeoverUserId
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async returnToAi(tenantId: string, conversationId: string, actorUserId: string | undefined) {
    const before = await this.ensureConversation(tenantId, conversationId);
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.assignment.updateMany({
        where: { tenantId, conversationId, status: "active" },
        data: { status: "released" }
      });
      return tx.conversation.update({
        where: { id: conversationId },
        data: { aiState: "ai_active", assignedUserId: null }
      });
    });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.returned_to_ai",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.returned_to_ai", actorUserId, {
        fromAiState: before.aiState,
        toAiState: "ai_active",
        fromAssignedUserId: before.assignedUserId,
        toAssignedUserId: null
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async followUp(tenantId: string, conversationId: string, actorUserId: string | undefined, request: FollowUpConversationRequest) {
    const before = await this.ensureConversation(tenantId, conversationId);
    const followUpAt = request.followUpAt ? new Date(request.followUpAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.conversation.updateMany({
      where: { id: conversationId, tenantId },
      data: { followUpAt, status: "pending" }
    });
    const updated = await this.ensureConversation(tenantId, conversationId);
    await this.recordStatusHistory(tenantId, conversationId, actorUserId, before.status, "pending", {
      followUpAt: followUpAt.toISOString()
    });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.follow_up_set",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.follow_up_set", actorUserId, {
        fromStatus: before.status,
        toStatus: "pending",
        fromFollowUpAt: before.followUpAt?.toISOString() ?? null,
        toFollowUpAt: followUpAt.toISOString()
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async updateTask(tenantId: string, taskId: string, actorUserId: string | undefined, request: UpdateTaskRequest) {
    const task = await this.prisma.task.findFirst({ where: { tenantId, id: taskId } });
    if (!task) throw new NotFoundException("Task not found");
    const status = request.status;
    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: request.title,
        status,
        assigneeUserId: request.assigneeUserId === undefined ? undefined : request.assigneeUserId,
        dueAt: request.dueAt === undefined ? undefined : request.dueAt ? new Date(request.dueAt) : null,
        completedAt: status === "done" ? new Date() : status === "open" ? null : undefined
      }
    });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId: task.conversationId,
      action: status === "done" ? "task.completed" : "task.updated",
      entityType: "conversation",
      entityId: task.conversationId,
      metadata: { taskId, status }
    });
    this.realtime.conversationUpdated(tenantId, { conversationId: task.conversationId });
    return mapTask(updated);
  }

  async completeTask(tenantId: string, taskId: string, actorUserId: string | undefined) {
    return this.updateTask(tenantId, taskId, actorUserId, { status: "done" });
  }

  async close(tenantId: string, conversationId: string, actorUserId: string | undefined) {
    const before = await this.ensureConversation(tenantId, conversationId);
    await this.prisma.conversation.updateMany({
      where: { id: conversationId, tenantId },
      data: { status: "closed", aiState: "idle", unread: false, unreplied: false }
    });
    const updated = await this.ensureConversation(tenantId, conversationId);
    await this.recordStatusHistory(tenantId, conversationId, actorUserId, before.status, "closed", { source: "close_endpoint" });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.closed",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.closed", actorUserId, {
        fromStatus: before.status,
        toStatus: "closed"
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async updateStatus(tenantId: string, conversationId: string, actorUserId: string | undefined, request: UpdateConversationStatusRequest) {
    const before = await this.ensureConversation(tenantId, conversationId);
    const status = request.status;
    await this.prisma.conversation.updateMany({
      where: { id: conversationId, tenantId },
      data: {
        status,
        followUpAt: status === "open" || status === "closed" || status === "spam" ? null : undefined,
        aiState: status === "closed" || status === "spam" ? "idle" : undefined,
        unread: status === "closed" || status === "spam" ? false : undefined,
        unreplied: status === "closed" || status === "spam" ? false : undefined
      }
    });
    const updated = await this.ensureConversation(tenantId, conversationId);
    await this.recordStatusHistory(tenantId, conversationId, actorUserId, before.status, status, { source: "status_endpoint" });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.status_updated",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.status_updated", actorUserId, {
        fromStatus: before.status,
        toStatus: status
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async updatePriority(tenantId: string, conversationId: string, actorUserId: string | undefined, request: UpdateConversationPriorityRequest) {
    const before = await this.ensureConversation(tenantId, conversationId);
    const priority = normalizePrismaPriority(request.priority);
    await this.prisma.conversation.updateMany({
      where: { id: conversationId, tenantId },
      data: { priority }
    });
    const updated = await this.ensureConversation(tenantId, conversationId);
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.priority_updated",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.priority_updated", actorUserId, {
        fromPriority: before.priority,
        toPriority: priority
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async updateReadState(tenantId: string, conversationId: string, actorUserId: string | undefined, request: UpdateConversationReadStateRequest) {
    const before = await this.ensureConversation(tenantId, conversationId);
    await this.prisma.conversation.updateMany({
      where: { id: conversationId, tenantId },
      data: {
        unread: request.unread,
        unreplied: request.unreplied
      }
    });
    const updated = await this.ensureConversation(tenantId, conversationId);
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.read_state_updated",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.read_state_updated", actorUserId, {
        fromUnread: before.unread,
        toUnread: updated.unread,
        fromUnreplied: before.unreplied,
        toUnreplied: updated.unreplied
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async updateSla(tenantId: string, conversationId: string, actorUserId: string | undefined, request: UpdateConversationSlaRequest) {
    const before = await this.ensureConversation(tenantId, conversationId);
    const slaStatus = request.slaStatus as ConversationSlaStatus | undefined;
    await this.prisma.conversation.updateMany({
      where: { id: conversationId, tenantId },
      data: {
        slaDueAt: request.slaDueAt === undefined ? undefined : request.slaDueAt ? new Date(request.slaDueAt) : null,
        slaBreachedAt: request.slaBreachedAt === undefined
          ? slaStatus === "breached"
            ? before.slaBreachedAt ?? new Date()
            : slaStatus
              ? null
              : undefined
          : request.slaBreachedAt
            ? new Date(request.slaBreachedAt)
            : null,
        slaStatus,
        firstResponseDueAt: request.firstResponseDueAt === undefined ? undefined : request.firstResponseDueAt ? new Date(request.firstResponseDueAt) : null,
        resolutionDueAt: request.resolutionDueAt === undefined ? undefined : request.resolutionDueAt ? new Date(request.resolutionDueAt) : null
      }
    });
    const updated = await this.ensureConversation(tenantId, conversationId);
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId,
      action: "conversation.sla_updated",
      entityType: "conversation",
      entityId: conversationId,
      beforeJson: workflowSnapshot(before),
      afterJson: workflowSnapshot(updated),
      metadata: conversationAuditMetadata(before, "conversation.sla_updated", actorUserId, {
        fromSlaDueAt: before.slaDueAt?.toISOString() ?? null,
        toSlaDueAt: updated.slaDueAt?.toISOString() ?? null,
        fromSlaStatus: deriveSlaStatus(before),
        toSlaStatus: deriveSlaStatus(updated)
      })
    });
    this.realtime.conversationUpdated(tenantId, { conversationId });
    return updated;
  }

  async getAuditLogs(tenantId: string, conversationId: string) {
    const conversation = await this.ensureConversation(tenantId, conversationId);
    const logs = await this.prisma.auditLog.findMany({
      where: { tenantId, conversationId },
      orderBy: { createdAt: "desc" }
    });
    return logs.map((log) => {
      const metadataJson = withConversationContext(log.metadataJson ?? log.metadata ?? null, conversation);
      return {
        id: log.id,
        tenantId: log.tenantId,
        conversationId: log.conversationId,
        platform: conversation.room.platform,
        channelAccountId: conversation.room.channelAccountId,
        roomId: conversation.roomId,
        actorUserId: log.actorUserId,
        action: log.action,
        beforeJson: sanitizeAuditValue(log.beforeJson),
        afterJson: sanitizeAuditValue(log.afterJson),
        metadataJson,
        createdAt: log.createdAt.toISOString()
      };
    });
  }

  async getStatusHistory(tenantId: string, conversationId: string) {
    const conversation = await this.ensureConversation(tenantId, conversationId);
    const history = await this.prisma.conversationStatusHistory.findMany({
      where: { tenantId, conversationId },
      orderBy: { createdAt: "desc" }
    });
    return history.map((item) => ({
      id: item.id,
      tenantId: item.tenantId,
      conversationId: item.conversationId,
      platform: conversation.room.platform,
      channelAccountId: conversation.room.channelAccountId,
      roomId: conversation.roomId,
      actorUserId: item.actorUserId,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
      metadataJson: withConversationContext(item.metadataJson ?? null, conversation),
      createdAt: item.createdAt.toISOString()
    }));
  }

  async getAiPolicy(tenantId: string, roomId: string) {
    const room = await this.ensureRoom(tenantId, roomId);
    return mapRoomAiPolicy(room);
  }

  async updateAiPolicy(tenantId: string, roomId: string, actorUserId: string | undefined, patch: RoomAiPolicyPatch) {
    await this.ensureRoom(tenantId, roomId);
    if (patch.knowledgeBaseIds !== undefined) {
      const requestedIds = Array.from(new Set(patch.knowledgeBaseIds));
      const found = requestedIds.length === 0
        ? []
        : await this.prisma.knowledgeBase.findMany({
          where: {
            tenantId,
            id: { in: requestedIds }
          },
          select: { id: true }
        });
      if (found.length !== requestedIds.length) throw new NotFoundException("Knowledge base not found");
    }

    const aiMode = patch.aiMode ?? patch.mode;
    await this.prisma.$transaction(async (tx) => {
      await tx.room.update({
        where: { id: roomId },
        data: {
          aiMode,
          autoReplyThreshold: patch.autoReplyThreshold,
          draftThreshold: patch.draftThreshold,
          requireCitationsForAutoReply: patch.requireCitationsForAutoReply,
          handoffOnHighRisk: patch.handoffOnHighRisk
        }
      });

      if (patch.knowledgeBaseIds !== undefined) {
        await tx.roomKnowledgeBase.deleteMany({ where: { tenantId, roomId } });
        for (const knowledgeBaseId of Array.from(new Set(patch.knowledgeBaseIds))) {
          await tx.roomKnowledgeBase.create({
            data: {
              tenantId,
              roomId,
              knowledgeBaseId
            }
          });
        }
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId,
      action: "room.ai_policy_updated",
      entityType: "room",
      entityId: roomId,
      metadata: patch
    });
    return this.getAiPolicy(tenantId, roomId);
  }

  private async ensureRoom(tenantId: string, roomId: string) {
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, tenantId },
      include: {
        knowledgeBases: {
          select: { knowledgeBaseId: true }
        }
      }
    });
    if (!room) throw new NotFoundException("Room not found");
    return room;
  }

  async ensureConversation(tenantId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: {
        room: { include: { channelAccount: true } },
        contact: { include: { identities: true, tags: { include: { tag: true } } } },
        contactIdentity: true
      }
    });
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    return conversation;
  }

  private async ensureTenantUser(tenantId: string, userId: string, message: string) {
    const membership = await this.prisma.teamMembership.findFirst({
      where: { tenantId, userId },
      include: { user: true }
    });
    if (!membership) throw new NotFoundException(message);
    return membership.user;
  }

  private async recordStatusHistory(
    tenantId: string,
    conversationId: string,
    actorUserId: string | undefined,
    fromStatus: ConversationStatus,
    toStatus: ConversationStatus,
    metadataJson: Prisma.InputJsonValue
  ) {
    if (fromStatus === toStatus) return null;
    return this.prisma.conversationStatusHistory.create({
      data: {
        tenantId,
        conversationId,
        actorUserId,
        fromStatus,
        toStatus,
        metadataJson
      }
    });
  }

  private async createContactAndIdentity(tx: Prisma.TransactionClient, message: NormalizedInboundMessage) {
    const displayName = `${message.platform}:${message.externalUserId}`;
    const contact = await tx.contact.create({
      data: {
        tenantId: message.tenantId,
        displayName
      }
    });

    return tx.contactIdentity.create({
      data: {
        tenantId: message.tenantId,
        contactId: contact.id,
        platform: message.platform,
        channelAccountId: message.channelAccountId,
        externalUserId: message.externalUserId,
        displayName
      }
    });
  }

  private mapMessage(message: {
    id: string;
    conversationId: string;
    senderType: SenderType;
    text: string | null;
    createdAt: Date;
    platformMessageId: string;
  }) {
    const direction = message.senderType === "user" ? "inbound" : "outbound";
    return {
      id: message.id,
      conversationId: message.conversationId,
      direction,
      senderType: mapSenderType(message.senderType),
      text: message.text ?? "",
      createdAt: message.createdAt.toISOString(),
      platformMessageId: message.platformMessageId,
      deliveryStatus: direction === "outbound" ? "sent_mock" : "received"
    };
  }

  private mapInternalNote(note: {
    id: string;
    conversationId: string;
    contactId: string | null;
    authorUserId: string | null;
    body: string;
    visibility: string;
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
  }, fallbackContactId: string) {
    return {
      id: note.id,
      conversationId: note.conversationId,
      contactId: note.contactId ?? fallbackContactId,
      body: note.body,
      visibility: note.visibility === "supervisor" ? "supervisor" as const : "team" as const,
      createdBy: note.authorUserId ?? "system",
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      pinned: note.pinned
    };
  }
}

function mapTask(task: {
  id: string;
  conversationId: string;
  contactId: string;
  title: string;
  status: string;
  assigneeUserId: string | null;
  createdByUserId: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    conversationId: task.conversationId,
    contactId: task.contactId,
    title: task.title,
    status: task.status === "done" || task.status === "cancelled" ? task.status : "open",
    assigneeUserId: task.assigneeUserId,
    createdByUserId: task.createdByUserId,
    dueAt: task.dueAt?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
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

function platformAccent(platform: Platform) {
  const accents: Record<Platform, string> = {
    webchat: "#0d9488",
    telegram: "#2563eb",
    line: "#16a34a",
    facebook: "#1d4ed8",
    instagram: "#db2777"
  };
  return accents[platform];
}

function mapAiStatus(aiState: string, status: ConversationStatus) {
  if (status === "closed") return "Closed";
  if (aiState === "ai_active") return "AI Active";
  if (aiState === "need_human") return "Need Human";
  if (aiState === "human") return "Human Taken";
  if (aiState === "off") return "AI Off";
  return "Suggest";
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
  slaStatus?: ConversationSlaStatus | null;
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
  slaStatus?: ConversationSlaStatus | null;
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

function workflowSnapshot(conversation: {
  status: ConversationStatus;
  priority: ConversationPriority;
  unread: boolean;
  unreplied: boolean;
  followUpAt?: Date | null;
  slaDueAt?: Date | null;
  slaBreachedAt?: Date | null;
  slaStatus?: ConversationSlaStatus | null;
  firstResponseDueAt?: Date | null;
  resolutionDueAt?: Date | null;
}) {
  return {
    status: conversation.status,
    priority: conversation.priority,
    unread: conversation.unread,
    unreplied: conversation.unreplied,
    followUpAt: conversation.followUpAt?.toISOString() ?? null,
    slaDueAt: conversation.slaDueAt?.toISOString() ?? null,
    slaBreachedAt: conversation.slaBreachedAt?.toISOString() ?? null,
    slaStatus: deriveSlaStatus(conversation),
    firstResponseDueAt: conversation.firstResponseDueAt?.toISOString() ?? null,
    resolutionDueAt: conversation.resolutionDueAt?.toISOString() ?? null
  };
}

function conversationAuditMetadata(
  conversation: {
    id: string;
    tenantId: string;
    roomId: string;
    room: { platform: Platform; channelAccountId: string };
  },
  actionType: string,
  actorUserId: string | undefined,
  changes: Prisma.InputJsonObject = {}
) {
  return {
    actionType,
    conversationId: conversation.id,
    tenantId: conversation.tenantId,
    platform: conversation.room.platform,
    channelAccountId: conversation.room.channelAccountId,
    roomId: conversation.roomId,
    actorUserId: actorUserId ?? null,
    externalCalls: 0,
    ...changes
  };
}

function withConversationContext(
  metadata: unknown,
  conversation: {
    id: string;
    tenantId: string;
    roomId: string;
    room: { platform: Platform; channelAccountId: string };
  }
) {
  const safeMetadata = sanitizeAuditValue(metadata);
  const base = safeMetadata && typeof safeMetadata === "object" && !Array.isArray(safeMetadata)
    ? safeMetadata as Record<string, unknown>
    : {};
  return {
    ...base,
    conversationId: conversation.id,
    tenantId: conversation.tenantId,
    platform: conversation.room.platform,
    channelAccountId: conversation.room.channelAccountId,
    roomId: conversation.roomId
  };
}

const forbiddenAuditKeys = new Set([
  "accessToken",
  "accessTokenCiphertext",
  "webhookSecret",
  "appSecret",
  "botToken",
  "verifyToken",
  "apiKey",
  "password"
]);

function sanitizeAuditValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(sanitizeAuditValue);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !forbiddenAuditKeys.has(key))
        .map(([key, child]) => [key, sanitizeAuditValue(child)])
    );
  }
  if (typeof value === "string" && looksRawSecret(value)) return "[redacted]";
  return value;
}

function looksRawSecret(value: string) {
  return /sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(value);
}

function mapRoomAiPolicy(room: {
  id: string;
  aiMode: string;
  autoReplyThreshold: number;
  draftThreshold: number;
  requireCitationsForAutoReply: boolean;
  handoffOnHighRisk: boolean;
  updatedAt: Date;
  knowledgeBases?: Array<{ knowledgeBaseId: string }>;
}) {
  return {
    roomId: room.id,
    aiMode: normalizeAiMode(room.aiMode),
    autoReplyThreshold: room.autoReplyThreshold,
    draftThreshold: room.draftThreshold,
    requireCitationsForAutoReply: room.requireCitationsForAutoReply,
    handoffOnHighRisk: room.handoffOnHighRisk,
    knowledgeBaseIds: room.knowledgeBases?.map((item) => item.knowledgeBaseId) ?? [],
    updatedAt: room.updatedAt.toISOString()
  };
}

function normalizeAiMode(mode: string) {
  if (["off", "suggest", "auto_faq", "auto_sales", "ai_agent", "human_first"].includes(mode)) return mode;
  return "suggest";
}

function normalizePrismaPriority(priority: UpdateConversationPriorityRequest["priority"]): ConversationPriority {
  if (!["low", "normal", "medium", "high", "urgent"].includes(priority)) {
    throw new BadRequestException("Invalid conversation priority. Allowed values: low, normal, high, urgent");
  }
  return priority === "medium" ? "normal" : priority;
}

function mapSenderType(senderType: SenderType) {
  if (senderType === "user") return "customer";
  return senderType;
}

function formatApiTime(date: Date) {
  return new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(date);
}
