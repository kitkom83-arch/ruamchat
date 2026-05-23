import { BadRequestException, Body, Controller, Get, Headers, Inject, Param, Patch, Query } from "@nestjs/common";
import { conversationFilterSchema, coreConversationTabSchema, platformSchema, roomAiPolicyPatchSchema, slaStatusSchema } from "@ai-omni/shared";
import { ConversationService } from "../services/conversation.service.js";

const queryStatusValues = new Set(["open", "pending", "follow_up", "resolved", "closed", "spam"]);
const queryPriorityValues = new Set(["low", "medium", "high", "urgent"]);
const querySortValues = new Set(["latest_desc", "latest_asc", "updated_desc", "updated_asc"]);

@Controller("rooms")
export class RoomsController {
  constructor(@Inject(ConversationService) private readonly conversations: ConversationService) {}

  @Get()
  async rooms(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.conversations.listRooms(requireTenantId(tenant));
  }

  @Get(":roomId/ai-policy")
  async getPolicy(@Param("roomId") roomId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.conversations.getAiPolicy(requireTenantId(tenant), roomId);
  }

  @Get(":roomId/conversations")
  async roomConversations(
    @Param("roomId") roomId: string,
    @Query("tab") tab = "human",
    @Query("filter") filter = "all",
    @Query("agentId") agentId?: string,
    @Query("search") search?: string,
    @Query("platform") platform?: string,
    @Query("channelAccountId") channelAccountId?: string,
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    @Query("unread") unread?: string,
    @Query("slaStatus") slaStatus?: string,
    @Query("sort") sort?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Headers("x-tenant-id") tenant?: string,
    @Headers("x-user-id") userId?: string
  ) {
    const tenantId = requireTenantId(tenant);
    const parsed = conversationFilterSchema.safeParse(filter);
    if (!parsed.success) {
      throw new BadRequestException("Invalid conversation filter");
    }
    const parsedTab = coreConversationTabSchema.safeParse(tab);
    if (!parsedTab.success) {
      throw new BadRequestException("Invalid conversation tab");
    }
    const parsedPlatform = platform ? platformSchema.safeParse(platform) : null;
    if (parsedPlatform && !parsedPlatform.success) throw new BadRequestException("Invalid platform filter");
    if (status && !queryStatusValues.has(status)) throw new BadRequestException("Invalid conversation status filter");
    if (priority && !queryPriorityValues.has(priority)) throw new BadRequestException("Invalid conversation priority filter");
    if (unread && unread !== "true" && unread !== "false") throw new BadRequestException("Invalid unread filter");
    const parsedSlaStatus = slaStatus ? slaStatusSchema.safeParse(slaStatus) : null;
    if (parsedSlaStatus && !parsedSlaStatus.success) throw new BadRequestException("Invalid SLA status filter");
    if (sort && !querySortValues.has(sort)) throw new BadRequestException("Invalid conversation sort");
    return this.conversations.listConversations({
      tenantId,
      roomId,
      tab: parsedTab.data,
      filter: parsed.data,
      userId,
      agentId,
      search,
      platform: parsedPlatform?.data,
      channelAccountId,
      status: status as "open" | "pending" | "follow_up" | "resolved" | "closed" | "spam" | undefined,
      priority: priority as "low" | "medium" | "high" | "urgent" | undefined,
      unread: unread === undefined ? undefined : unread === "true",
      slaStatus: parsedSlaStatus?.data,
      sort: sort as "latest_desc" | "latest_asc" | "updated_desc" | "updated_asc" | undefined,
      limit: parseLimit(limit),
      offset: parseOffset(offset)
    });
  }

  @Patch(":roomId/ai-policy")
  async updatePolicy(
    @Param("roomId") roomId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    const parsed = roomAiPolicyPatchSchema.parse(body);
    return this.conversations.updateAiPolicy(requireTenantId(tenant), roomId, userId, parsed);
  }
}

function requireTenantId(tenant: string | undefined) {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
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
