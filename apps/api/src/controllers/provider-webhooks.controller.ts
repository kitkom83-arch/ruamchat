import { BadRequestException, Body, Controller, Get, Headers, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { providerWebhookReviewMetricsFiltersSchema, providerWebhookUnmatchedInboundExportQuerySchema, providerWebhookUnmatchedInboundFiltersSchema, providerWebhookUnmatchedInboundStatusFilterSchema } from "@ai-omni/shared";
import { ProviderWebhookEventsService } from "../services/provider-webhook-events.service.js";

@Controller("provider-webhooks")
export class ProviderWebhooksController {
  constructor(@Inject(ProviderWebhookEventsService) private readonly events: ProviderWebhookEventsService) {}

  @Get("events")
  listEvents(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.events.list(requireTenantId(tenant));
  }

  @Get("review-metrics")
  getReviewMetrics(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown
  ) {
    return this.events.getReviewMetrics(requireTenantId(tenant), parseReviewMetricsFilters(query));
  }

  @Get("unmatched-inbound")
  listUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown
  ): any {
    const filters = parseUnmatchedInboundFilters(query);
    return shouldReturnPagedUnmatchedInbound(query)
      ? this.events.listUnmatchedInboundPage(requireTenantId(tenant), filters)
      : this.events.listUnmatchedInbound(requireTenantId(tenant), filters);
  }

  @Get("unmatched-inbound/export")
  exportUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown
  ) {
    const filters = parseUnmatchedInboundExportQuery(query);
    return this.events.exportUnmatchedInboundQueue(requireTenantId(tenant), filters);
  }

  @Get("unmatched-inbound/:id/diagnostics")
  getUnmatchedInboundDiagnostics(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.getUnmatchedInboundDiagnostics(requireTenantId(tenant), id);
  }

  @Get("unmatched-inbound/:id/history")
  listUnmatchedInboundHistory(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.listUnmatchedInboundHistory(requireTenantId(tenant), id);
  }

  @Get("unmatched-inbound/:id/candidates")
  listUnmatchedInboundCandidates(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.listUnmatchedInboundCandidates(requireTenantId(tenant), id);
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

  @Patch("unmatched-inbound/bulk-review")
  bulkReviewUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.bulkReviewUnmatchedInbound(requireTenantId(tenant), body, userId);
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

function parseUnmatchedInboundFilters(query: unknown) {
  if (typeof query === "string" || query === undefined) {
    const parsedStatus = providerWebhookUnmatchedInboundStatusFilterSchema.safeParse(query);
    if (!parsedStatus.success) throw new BadRequestException("Invalid unmatched inbound status filter");
    return parsedStatus.data ? { status: parsedStatus.data } : {};
  }

  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw new BadRequestException("Invalid unmatched inbound filters");
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookUnmatchedInboundFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid unmatched inbound filters");
  return parsed.data;
}

function parseUnmatchedInboundExportQuery(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookUnmatchedInboundExportQuerySchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid unmatched inbound export query");
  return parsed.data;
}

function parseReviewMetricsFilters(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookReviewMetricsFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid provider webhook review metrics filters");
  return parsed.data;
}

function shouldReturnPagedUnmatchedInbound(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) return false;
  const keys = new Set(Object.keys(query as Record<string, unknown>));
  return keys.has("offset") || keys.has("sortBy") || keys.has("sortOrder") || keys.has("receivedAtFrom") || keys.has("receivedAtTo");
}
