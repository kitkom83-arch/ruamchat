import { Body, Controller, Get, Headers, Inject, Param, Patch } from "@nestjs/common";
import {
  updateSettingsCannedReplyRequestSchema,
  updateSettingsChannelAccountRequestSchema,
  updateSettingsSlaPolicyRequestSchema,
  updateSettingsTeamMemberRequestSchema
} from "@ai-omni/shared";
import { SettingsService } from "../services/settings.service.js";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

@Controller("settings")
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settings: SettingsService) {}

  @Get("channels")
  async listChannels(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.settings.listChannels(tenant);
  }

  @Get("channels/:channelAccountId")
  async getChannel(@Param("channelAccountId") channelAccountId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.settings.getChannel(tenant, channelAccountId);
  }

  @Patch("channels/:channelAccountId")
  async updateChannel(
    @Param("channelAccountId") channelAccountId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.settings.updateChannel(tenant, channelAccountId, updateSettingsChannelAccountRequestSchema.parse(body));
  }

  @Get("team")
  async listTeam(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.settings.listTeam(tenant);
  }

  @Get("team/:agentId")
  async getTeamMember(@Param("agentId") agentId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.settings.getTeamMember(tenant, agentId);
  }

  @Patch("team/:agentId")
  async updateTeamMember(
    @Param("agentId") agentId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.settings.updateTeamMember(tenant, agentId, updateSettingsTeamMemberRequestSchema.parse(body));
  }

  @Get("sla-policies")
  async listSlaPolicies(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.settings.listSlaPolicies(tenant);
  }

  @Get("sla-policies/:policyId")
  async getSlaPolicy(@Param("policyId") policyId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.settings.getSlaPolicy(tenant, policyId);
  }

  @Patch("sla-policies/:policyId")
  async updateSlaPolicy(
    @Param("policyId") policyId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.settings.updateSlaPolicy(tenant, policyId, updateSettingsSlaPolicyRequestSchema.parse(body));
  }

  @Get("canned-replies")
  async listCannedReplies(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.settings.listCannedReplies(tenant);
  }

  @Get("canned-replies/:replyId")
  async getCannedReply(@Param("replyId") replyId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.settings.getCannedReply(tenant, replyId);
  }

  @Patch("canned-replies/:replyId")
  async updateCannedReply(
    @Param("replyId") replyId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.settings.updateCannedReply(tenant, replyId, updateSettingsCannedReplyRequestSchema.parse(body));
  }
}
