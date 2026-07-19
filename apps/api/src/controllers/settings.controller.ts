import { Body, Controller, Get, Headers, Inject, Param, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import {
  updateSettingsCannedReplyRequestSchema,
  updateSettingsChannelAccountRequestSchema,
  updateSettingsSlaPolicyRequestSchema,
  updateSettingsTeamMemberRequestSchema
} from "@ai-omni/shared";
import { SettingsService } from "../services/settings.service.js";
import { TelegramChannelService } from "../services/telegram-channel.service.js";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

@Controller("settings")
export class SettingsController {
  constructor(
    @Inject(SettingsService) private readonly settings: SettingsService,
    @Inject(TelegramChannelService) private readonly telegram: TelegramChannelService
  ) {}

  @Get("channels/:channelAccountId/telegram/bot-info")
  async telegramBotInfo(
    @Param("channelAccountId") channelAccountId: string,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.telegram.getBotInfo(tenant, channelAccountId);
  }

  @Post("channels/:channelAccountId/telegram/test-connection")
  async telegramTestConnection(
    @Param("channelAccountId") channelAccountId: string,
    @Req() req: Request,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.telegram.testConnection(tenant, channelAccountId, requestOrigin(req));
  }

  @Post("channels/:channelAccountId/telegram/set-webhook")
  async telegramSetWebhook(
    @Param("channelAccountId") channelAccountId: string,
    @Req() req: Request,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.telegram.setWebhook(tenant, channelAccountId, requestOrigin(req));
  }

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

/**
 * Best-effort public origin (protocol + host) from the incoming request, used
 * as a fallback when PUBLIC_BASE_URL / APP_URL are not configured. Honours
 * reverse-proxy headers set by Caddy in production.
 */
function requestOrigin(req: Request): string | undefined {
  const forwardedHost = headerValue(req.headers["x-forwarded-host"]) ?? headerValue(req.headers.host);
  if (!forwardedHost) return undefined;
  const forwardedProto = headerValue(req.headers["x-forwarded-proto"]);
  const proto = forwardedProto ?? (req.protocol || "https");
  return `${proto}://${forwardedHost}`;
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]?.split(",")[0]?.trim();
  if (typeof value === "string") return value.split(",")[0]?.trim();
  return undefined;
}
