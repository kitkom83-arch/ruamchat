import { BadRequestException, Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import {
  broadcastAudiencePreviewRequestSchema,
  broadcastApprovalRequestSchema,
  broadcastComplianceFiltersSchema,
  broadcastSendTestRequestSchema,
  broadcastSendLogFiltersSchema,
  createBroadcastCampaignRequestSchema,
  createBroadcastSegmentRequestSchema,
  scheduleBroadcastCampaignRequestSchema,
  updateBroadcastCampaignRequestSchema,
  updateBroadcastSegmentRequestSchema
} from "@ai-omni/shared";
import { BroadcastService } from "../services/broadcast.service.js";

@Controller("broadcasts")
export class BroadcastsController {
  constructor(@Inject(BroadcastService) private readonly broadcasts: BroadcastService) {}

  @Get("campaigns")
  async listCampaigns(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.listCampaigns(requireTenantId(tenant));
  }

  @Post("campaigns")
  async createCampaign(
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.createCampaign(requireTenantId(tenant), userId, createBroadcastCampaignRequestSchema.parse(body));
  }

  @Get("campaigns/:campaignId")
  async getCampaign(@Param("campaignId") campaignId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.getCampaign(requireTenantId(tenant), campaignId);
  }

  @Patch("campaigns/:campaignId")
  async updateCampaign(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.updateCampaign(requireTenantId(tenant), campaignId, updateBroadcastCampaignRequestSchema.parse(body));
  }

  @Delete("campaigns/:campaignId")
  async deleteCampaign(@Param("campaignId") campaignId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.archiveCampaign(requireTenantId(tenant), campaignId);
  }

  @Post("campaigns/:campaignId/duplicate")
  async duplicateCampaign(
    @Param("campaignId") campaignId: string,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.duplicateCampaign(requireTenantId(tenant), campaignId, userId);
  }

  @Post("campaigns/:campaignId/audience-preview")
  async audiencePreview(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.audiencePreview(requireTenantId(tenant), campaignId, broadcastAudiencePreviewRequestSchema.parse(body ?? {}));
  }

  @Get("campaigns/:campaignId/audience-preview")
  async getAudiencePreview(
    @Param("campaignId") campaignId: string,
    @Query() query: Record<string, unknown>,
    @Headers("x-tenant-id") tenant: string | undefined
  ) {
    return this.broadcasts.audiencePreview(requireTenantId(tenant), campaignId, broadcastAudiencePreviewRequestSchema.parse(query));
  }

  @Post("campaigns/:campaignId/dry-run")
  async dryRun(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.dryRun(requireTenantId(tenant), campaignId, broadcastAudiencePreviewRequestSchema.parse(body ?? {}));
  }

  @Post("campaigns/:campaignId/schedule")
  async scheduleCampaign(
    @Param("campaignId") campaignId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.scheduleCampaign(requireTenantId(tenant), campaignId, userId, scheduleBroadcastCampaignRequestSchema.parse(body));
  }

  @Post("campaigns/:campaignId/request-approval")
  async requestApproval(
    @Param("campaignId") campaignId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.requestApproval(requireTenantId(tenant), campaignId, userId, broadcastApprovalRequestSchema.parse(body ?? {}));
  }

  @Post("campaigns/:campaignId/approve")
  async approveCampaign(
    @Param("campaignId") campaignId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.approveCampaign(requireTenantId(tenant), campaignId, userId, broadcastApprovalRequestSchema.parse(body ?? {}));
  }

  @Post("campaigns/:campaignId/reject")
  async rejectCampaign(
    @Param("campaignId") campaignId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.rejectCampaign(requireTenantId(tenant), campaignId, userId, broadcastApprovalRequestSchema.parse(body ?? {}));
  }

  @Post("campaigns/:campaignId/cancel-approval")
  async cancelApproval(
    @Param("campaignId") campaignId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.cancelApproval(requireTenantId(tenant), campaignId, userId, broadcastApprovalRequestSchema.parse(body ?? {}));
  }

  @Post("campaigns/:campaignId/send-test")
  async sendTest(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.sendTest(requireTenantId(tenant), campaignId, broadcastSendTestRequestSchema.parse(body ?? {}));
  }

  @Post("campaigns/:campaignId/send-now")
  async sendNow(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.sendNow(requireTenantId(tenant), campaignId, broadcastAudiencePreviewRequestSchema.parse(body ?? {}));
  }

  @Get("send-logs")
  async listSendLogPage(@Query() query: Record<string, unknown>, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.listSendLogPage(requireTenantId(tenant), broadcastSendLogFiltersSchema.parse(query));
  }

  @Get("campaigns/:campaignId/send-logs")
  async listSendLogs(
    @Param("campaignId") campaignId: string,
    @Query() query: Record<string, unknown>,
    @Headers("x-tenant-id") tenant: string | undefined
  ) {
    if (Object.keys(query).length > 0) {
      return this.broadcasts.listSendLogPage(requireTenantId(tenant), broadcastSendLogFiltersSchema.parse({ ...query, campaignId }));
    }
    return this.broadcasts.listSendLogs(requireTenantId(tenant), campaignId);
  }

  @Get("campaigns/:campaignId/analytics")
  async getCampaignAnalytics(
    @Param("campaignId") campaignId: string,
    @Query() query: Record<string, unknown>,
    @Headers("x-tenant-id") tenant: string | undefined
  ) {
    return this.broadcasts.getCampaignAnalytics(requireTenantId(tenant), campaignId, broadcastSendLogFiltersSchema.parse({ ...query, campaignId }));
  }

  @Get("campaigns/:campaignId/delivery-export")
  async exportCampaignDelivery(
    @Param("campaignId") campaignId: string,
    @Query() query: Record<string, unknown>,
    @Headers("x-tenant-id") tenant: string | undefined
  ) {
    return this.broadcasts.exportCampaignDelivery(requireTenantId(tenant), campaignId, broadcastSendLogFiltersSchema.parse({ ...query, campaignId }));
  }

  @Get("compliance-logs")
  async listComplianceHistory(@Query() query: Record<string, unknown>, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.listComplianceHistory(requireTenantId(tenant), broadcastComplianceFiltersSchema.parse(query));
  }

  @Get("campaigns/:campaignId/compliance-logs")
  async listComplianceLogs(@Param("campaignId") campaignId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.listComplianceLogs(requireTenantId(tenant), campaignId);
  }

  @Get("segments")
  async listSegments(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.listSegments(requireTenantId(tenant));
  }

  @Post("segments")
  async createSegment(@Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.createSegment(requireTenantId(tenant), createBroadcastSegmentRequestSchema.parse(body));
  }

  @Patch("segments/:segmentId")
  async updateSegment(@Param("segmentId") segmentId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.updateSegment(requireTenantId(tenant), segmentId, updateBroadcastSegmentRequestSchema.parse(body));
  }

  @Delete("segments/:segmentId")
  async deleteSegment(@Param("segmentId") segmentId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.broadcasts.deleteSegment(requireTenantId(tenant), segmentId);
  }
}

function requireTenantId(tenant: string | undefined) {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
}
