import { BadRequestException, Body, Controller, Get, Headers, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import {
  agentMessageRequestSchema,
  assignConversationRequestSchema,
  createInternalNoteRequestSchema,
  createTaskRequestSchema,
  followUpConversationRequestSchema,
  platformSchema,
  updateConversationPriorityRequestSchema,
  updateConversationReadStateRequestSchema,
  updateConversationSlaRequestSchema,
  updateConversationStatusRequestSchema,
  updateTaskRequestSchema
} from "@ai-omni/shared";
import { ConversationService } from "../services/conversation.service.js";
import { CustomerService } from "../services/customer.service.js";

@Controller("conversations")
export class ConversationsController {
  constructor(
    @Inject(ConversationService) private readonly conversations: ConversationService,
    @Inject(CustomerService) private readonly customers: CustomerService
  ) {}

  @Get(":conversationId/messages")
  async messages(@Param("conversationId") conversationId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.conversations.getMessages(requireTenantId(tenant), conversationId);
  }

  @Get(":conversationId/customer-360")
  async customer360(@Param("conversationId") conversationId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.customers.getCustomer360(requireTenantId(tenant), conversationId);
  }

  @Get(":conversationId/notes")
  async notes(@Param("conversationId") conversationId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.conversations.getNotes(requireTenantId(tenant), conversationId);
  }

  @Post(":conversationId/notes")
  async createNote(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.conversations.createNote(requireTenantId(tenant), conversationId, userId, createInternalNoteRequestSchema.parse(body));
  }

  @Get(":conversationId/tasks")
  async tasks(@Param("conversationId") conversationId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.conversations.getTasks(requireTenantId(tenant), conversationId);
  }

  @Post(":conversationId/tasks")
  async createTask(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.conversations.createTask(requireTenantId(tenant), conversationId, userId, createTaskRequestSchema.parse(body));
  }

  @Post(":conversationId/messages")
  async send(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    const tenantId = requireTenantId(tenant);
    if (!conversationId?.trim()) throw new BadRequestException("conversationId is required");
    const parsed = agentMessageRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Message text is required");
    return this.conversations.sendAgentMessage(tenantId, conversationId, userId, parsed.data);
  }

  @Post(":conversationId/assign")
  async assign(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    const tenantId = requireTenantId(tenant);
    const parsed = assignConversationRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Missing or invalid userId");
    return this.conversations.assign(tenantId, conversationId, userId, parsed.data);
  }

  @Post(":conversationId/takeover")
  async takeover(
    @Param("conversationId") conversationId: string,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.conversations.takeover(requireTenantId(tenant), conversationId, userId);
  }

  @Post(":conversationId/return-to-ai")
  async returnToAi(
    @Param("conversationId") conversationId: string,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.conversations.returnToAi(requireTenantId(tenant), conversationId, userId);
  }

  @Post(":conversationId/follow-up")
  async followUp(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.conversations.followUp(requireTenantId(tenant), conversationId, userId, followUpConversationRequestSchema.parse(body ?? {}));
  }

  @Post(":conversationId/close")
  async close(
    @Param("conversationId") conversationId: string,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.conversations.close(requireTenantId(tenant), conversationId, userId);
  }

  @Patch(":conversationId/status")
  async updateStatus(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    const tenantId = requireTenantId(tenant);
    const parsed = updateConversationStatusRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid conversation status. Allowed values: open, pending, closed, spam");
    return this.conversations.updateStatus(tenantId, conversationId, userId, parsed.data);
  }

  @Patch(":conversationId/priority")
  async updatePriority(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    const tenantId = requireTenantId(tenant);
    const parsed = updateConversationPriorityRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid conversation priority. Allowed values: low, normal, high, urgent");
    return this.conversations.updatePriority(tenantId, conversationId, userId, parsed.data);
  }

  @Patch(":conversationId/read-state")
  async updateReadState(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    const tenantId = requireTenantId(tenant);
    const parsed = updateConversationReadStateRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Provide unread or unreplied");
    return this.conversations.updateReadState(tenantId, conversationId, userId, parsed.data);
  }

  @Patch(":conversationId/sla")
  async updateSla(
    @Param("conversationId") conversationId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    const tenantId = requireTenantId(tenant);
    const parsed = updateConversationSlaRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid SLA payload");
    return this.conversations.updateSla(tenantId, conversationId, userId, parsed.data);
  }

  @Get(":conversationId/audit-logs")
  async auditLogs(@Param("conversationId") conversationId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.conversations.getAuditLogs(requireTenantId(tenant), conversationId);
  }

  @Get(":conversationId/status-history")
  async statusHistory(@Param("conversationId") conversationId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.conversations.getStatusHistory(requireTenantId(tenant), conversationId);
  }
}

function requireTenantId(tenant: string | undefined) {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
}

@Controller("tasks")
export class TasksController {
  constructor(@Inject(ConversationService) private readonly conversations: ConversationService) {}

  @Get()
  async listTasks(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query("status") status = "all",
    @Query("due") due = "all",
    @Query("assigneeUserId") assigneeUserId?: string,
    @Query("roomId") roomId?: string,
    @Query("platform") platform?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const parsedPlatform = platform ? platformSchema.safeParse(platform) : null;
    if (parsedPlatform && !parsedPlatform.success) throw new BadRequestException("Invalid task platform filter");
    return this.conversations.listTasks({
      tenantId: requireTenantId(tenant),
      status: parseTaskStatus(status),
      due: parseTaskDue(due),
      assigneeUserId: normalizeOptional(assigneeUserId),
      roomId: normalizeOptional(roomId),
      platform: parsedPlatform?.data,
      limit: parseLimit(limit),
      offset: parseOffset(offset)
    });
  }

  @Patch(":taskId")
  async updateTask(
    @Param("taskId") taskId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    const parsed = updateTaskRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid task update payload");
    return this.conversations.updateTask(requireTenantId(tenant), taskId, userId, parsed.data);
  }

  @Patch(":taskId/complete")
  async completeTask(
    @Param("taskId") taskId: string,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.conversations.completeTask(requireTenantId(tenant), taskId, userId);
  }
}

function parseTaskStatus(status: string | undefined) {
  if (!status || status === "all") return undefined;
  if (status === "completed") return "done" as const;
  if (status === "open" || status === "done" || status === "cancelled") return status;
  throw new BadRequestException("Invalid task status filter");
}

function parseTaskDue(due: string | undefined) {
  if (!due || due === "all") return undefined;
  if (due === "due" || due === "overdue" || due === "upcoming") return due;
  throw new BadRequestException("Invalid task due filter");
}

function parseLimit(limit: string | undefined) {
  if (limit === undefined) return undefined;
  const value = Number(limit);
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new BadRequestException("Invalid limit");
  return value;
}

function parseOffset(offset: string | undefined) {
  if (offset === undefined) return undefined;
  const value = Number(offset);
  if (!Number.isInteger(value) || value < 0) throw new BadRequestException("Invalid offset");
  return value;
}

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "all" ? trimmed : undefined;
}
