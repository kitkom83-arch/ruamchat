import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
import {
  broadcastAudiencePreviewRequestSchema,
  broadcastSendTestRequestSchema,
  createBroadcastCampaignRequestSchema,
  createBroadcastSegmentRequestSchema,
  scheduleBroadcastCampaignRequestSchema,
  updateBroadcastCampaignRequestSchema,
  updateBroadcastSegmentRequestSchema
} from "@ai-omni/shared";
import { BroadcastService } from "../services/broadcast.service.js";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

@Controller("broadcasts")
export class BroadcastsController {
  constructor(@Inject(BroadcastService) private readonly broadcasts: BroadcastService) {}

  @Get("campaigns")
  async listCampaigns(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.listCampaigns(tenant);
  }

  @Post("campaigns")
  async createCampaign(
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.createCampaign(tenant, userId, createBroadcastCampaignRequestSchema.parse(body));
  }

  @Get("campaigns/:campaignId")
  async getCampaign(@Param("campaignId") campaignId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.getCampaign(tenant, campaignId);
  }

  @Patch("campaigns/:campaignId")
  async updateCampaign(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.updateCampaign(tenant, campaignId, updateBroadcastCampaignRequestSchema.parse(body));
  }

  @Delete("campaigns/:campaignId")
  async deleteCampaign(@Param("campaignId") campaignId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.archiveCampaign(tenant, campaignId);
  }

  @Post("campaigns/:campaignId/duplicate")
  async duplicateCampaign(
    @Param("campaignId") campaignId: string,
    @Headers("x-tenant-id") tenant = defaultTenantId,
    @Headers("x-user-id") userId?: string
  ) {
    return this.broadcasts.duplicateCampaign(tenant, campaignId, userId);
  }

  @Post("campaigns/:campaignId/audience-preview")
  async audiencePreview(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.audiencePreview(tenant, campaignId, broadcastAudiencePreviewRequestSchema.parse(body ?? {}));
  }

  @Post("campaigns/:campaignId/schedule")
  async scheduleCampaign(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.scheduleCampaign(tenant, campaignId, scheduleBroadcastCampaignRequestSchema.parse(body));
  }

  @Post("campaigns/:campaignId/send-test")
  async sendTest(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.sendTest(tenant, campaignId, broadcastSendTestRequestSchema.parse(body ?? {}));
  }

  @Post("campaigns/:campaignId/send-now")
  async sendNow(@Param("campaignId") campaignId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.sendNow(tenant, campaignId, broadcastAudiencePreviewRequestSchema.parse(body ?? {}));
  }

  @Get("campaigns/:campaignId/send-logs")
  async listSendLogs(@Param("campaignId") campaignId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.listSendLogs(tenant, campaignId);
  }

  @Get("segments")
  async listSegments(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.listSegments(tenant);
  }

  @Post("segments")
  async createSegment(@Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.createSegment(tenant, createBroadcastSegmentRequestSchema.parse(body));
  }

  @Patch("segments/:segmentId")
  async updateSegment(@Param("segmentId") segmentId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.updateSegment(tenant, segmentId, updateBroadcastSegmentRequestSchema.parse(body));
  }

  @Delete("segments/:segmentId")
  async deleteSegment(@Param("segmentId") segmentId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.broadcasts.deleteSegment(tenant, segmentId);
  }
}
