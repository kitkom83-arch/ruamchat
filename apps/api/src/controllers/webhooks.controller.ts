import { BadRequestException, Body, Controller, Get, Headers, Inject, Param, Post, Query, Req } from "@nestjs/common";
import type { Request } from "express";
import type { Platform } from "@ai-omni/shared";
import { ChannelAccountsService } from "../services/channel-accounts.service.js";
import { ConversationService } from "../services/conversation.service.js";
import { NormalizerService } from "../services/normalizer.service.js";

@Controller("webhooks")
export class WebhooksController {
  constructor(
    @Inject(ChannelAccountsService)
    private readonly accounts: ChannelAccountsService,
    @Inject(NormalizerService)
    private readonly normalizer: NormalizerService,
    @Inject(ConversationService)
    private readonly conversations: ConversationService
  ) {}

  @Post("webchat/:accountKey")
  async webchat(@Param("accountKey") accountKey: string, @Body() body: unknown) {
    const account = await this.accounts.byWebchatKey(accountKey);
    const normalized = this.normalizer.webchat(account, body as never);
    const result = await this.conversations.ingest(normalized);
    return { accepted: true, conversationId: result.conversation.id, messageId: result.message.id, duplicate: result.duplicate };
  }

  @Post("telegram/:channelAccountId")
  async telegram(
    @Param("channelAccountId") channelAccountId: string,
    @Headers("x-telegram-bot-api-secret-token") secretToken: string | undefined,
    @Body() body: unknown
  ) {
    const account = await this.accounts.byId(channelAccountId, "telegram");
    this.accounts.verifyTelegramSecret(account, secretToken);
    const normalized = this.normalizer.telegram(account, body as never);
    if (!normalized) return { accepted: true };
    const result = await this.conversations.ingest(normalized);
    return { accepted: true, conversationId: result.conversation.id, messageId: result.message.id, duplicate: result.duplicate };
  }

  @Post("line/:channelAccountId")
  async line(
    @Param("channelAccountId") channelAccountId: string,
    @Headers("x-line-signature") signature: string | undefined,
    @Req() req: Request,
    @Body() body: unknown
  ) {
    const account = await this.accounts.byId(channelAccountId, "line");
    this.accounts.verifyLineSignature(account, req.rawBody, signature);
    const normalizedMessages = this.normalizer.line(account, body as never);
    const results = [];
    for (const message of normalizedMessages) {
      results.push(await this.conversations.ingest(message));
    }
    return {
      accepted: true,
      conversations: results.map((result) => ({
        conversationId: result.conversation.id,
        messageId: result.message.id,
        duplicate: result.duplicate
      })),
      ...singleResult(results)
    };
  }

  @Get("facebook/:channelAccountId")
  async facebookVerify(
    @Param("channelAccountId") channelAccountId: string,
    @Query("hub.mode") mode: string | undefined,
    @Query("hub.verify_token") verifyToken: string | undefined,
    @Query("hub.challenge") challenge: string | undefined
  ) {
    await this.accounts.byId(channelAccountId, "facebook");
    return this.verifyMetaChallenge("facebook", mode, verifyToken, challenge);
  }

  @Post("facebook/:channelAccountId")
  async facebook(
    @Param("channelAccountId") channelAccountId: string,
    @Headers("x-hub-signature-256") signature: string | undefined,
    @Req() req: Request,
    @Body() body: unknown
  ) {
    const account = await this.accounts.byId(channelAccountId, "facebook");
    this.accounts.verifyMetaSignature(req.rawBody, signature);
    const normalizedMessages = this.normalizer.facebook(account, body as never);
    return this.ingestMany(normalizedMessages);
  }

  @Get("instagram/:channelAccountId")
  async instagramVerify(
    @Param("channelAccountId") channelAccountId: string,
    @Query("hub.mode") mode: string | undefined,
    @Query("hub.verify_token") verifyToken: string | undefined,
    @Query("hub.challenge") challenge: string | undefined
  ) {
    await this.accounts.byId(channelAccountId, "instagram");
    return this.verifyMetaChallenge("instagram", mode, verifyToken, challenge);
  }

  @Post("instagram/:channelAccountId")
  async instagram(
    @Param("channelAccountId") channelAccountId: string,
    @Headers("x-hub-signature-256") signature: string | undefined,
    @Req() req: Request,
    @Body() body: unknown
  ) {
    const account = await this.accounts.byId(channelAccountId, "instagram");
    this.accounts.verifyMetaSignature(req.rawBody, signature);
    const normalizedMessages = this.normalizer.instagram(account, body as never);
    return this.ingestMany(normalizedMessages);
  }

  private verifyMetaChallenge(platform: Extract<Platform, "facebook" | "instagram">, mode: string | undefined, verifyToken: string | undefined, challenge: string | undefined) {
    if (mode !== "subscribe" || !challenge) {
      throw new BadRequestException("Invalid Meta webhook verification request");
    }
    this.accounts.verifyMetaWebhook(platform, verifyToken);
    return challenge;
  }

  private async ingestMany(messages: ReturnType<NormalizerService["line"]>) {
    const results = [];
    for (const message of messages) {
      results.push(await this.conversations.ingest(message));
    }
    return {
      accepted: true,
      conversations: results.map((result) => ({
        conversationId: result.conversation.id,
        messageId: result.message.id,
        duplicate: result.duplicate
      })),
      ...singleResult(results)
    };
  }
}

function singleResult(results: Awaited<ReturnType<ConversationService["ingest"]>>[]) {
  if (results.length !== 1 || !results[0]) return {};
  return {
    conversationId: results[0].conversation.id,
    messageId: results[0].message.id,
    duplicate: results[0].duplicate
  };
}
