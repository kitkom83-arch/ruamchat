import { BadRequestException, Body, Controller, Get, Headers, Inject, Param, Patch, Query } from "@nestjs/common";
import { conversationFilterSchema, coreConversationTabSchema, roomAiPolicyPatchSchema } from "@ai-omni/shared";
import { ConversationService } from "../services/conversation.service.js";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

@Controller("rooms")
export class RoomsController {
  constructor(@Inject(ConversationService) private readonly conversations: ConversationService) {}

  @Get()
  async rooms(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.conversations.listRooms(tenant);
  }

  @Get(":roomId/ai-policy")
  async getPolicy(@Param("roomId") roomId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.conversations.getAiPolicy(tenant, roomId);
  }

  @Get(":roomId/conversations")
  async roomConversations(
    @Param("roomId") roomId: string,
    @Query("tab") tab = "human",
    @Query("filter") filter = "all",
    @Query("agentId") agentId?: string,
    @Query("search") search?: string,
    @Headers("x-tenant-id") tenant = defaultTenantId,
    @Headers("x-user-id") userId?: string
  ) {
    const parsed = conversationFilterSchema.safeParse(filter);
    if (!parsed.success) {
      throw new BadRequestException("Invalid conversation filter");
    }
    const parsedTab = coreConversationTabSchema.safeParse(tab);
    if (!parsedTab.success) {
      throw new BadRequestException("Invalid conversation tab");
    }
    return this.conversations.listConversations({ tenantId: tenant, roomId, tab: parsedTab.data, filter: parsed.data, userId, agentId, search });
  }

  @Patch(":roomId/ai-policy")
  async updatePolicy(
    @Param("roomId") roomId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId,
    @Headers("x-user-id") userId?: string
  ) {
    const parsed = roomAiPolicyPatchSchema.parse(body);
    return this.conversations.updateAiPolicy(tenant, roomId, userId, parsed);
  }
}
