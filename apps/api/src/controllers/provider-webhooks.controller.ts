import { BadRequestException, Body, Controller, Get, Headers, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { providerWebhookUnmatchedInboundStatusFilterSchema } from "@ai-omni/shared";
import { ProviderWebhookEventsService } from "../services/provider-webhook-events.service.js";

@Controller("provider-webhooks")
export class ProviderWebhooksController {
  constructor(@Inject(ProviderWebhookEventsService) private readonly events: ProviderWebhookEventsService) {}

  @Get("events")
  listEvents(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.events.list(requireTenantId(tenant));
  }

  @Get("unmatched-inbound")
  listUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query("status") status: string | undefined
  ) {
    const parsedStatus = providerWebhookUnmatchedInboundStatusFilterSchema.safeParse(status);
    if (!parsedStatus.success) throw new BadRequestException("Invalid unmatched inbound status filter");
    return this.events.listUnmatchedInbound(requireTenantId(tenant), parsedStatus.data);
  }

  @Patch("unmatched-inbound/:id/review")
  reviewUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.reviewUnmatchedInbound(requireTenantId(tenant), id, body, userId);
  }

  @Post("unmatched-inbound/:id/link-conversation")
  linkUnmatchedInboundToConversation(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.linkUnmatchedInboundToConversation(requireTenantId(tenant), id, body, userId);
  }

  @Post("sandbox-events")
  createSandboxEvent(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.create(requireTenantId(tenant), body, userId);
  }
}

function requireTenantId(tenant: string | undefined) {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
}
