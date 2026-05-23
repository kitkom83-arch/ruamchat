import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import crypto from "node:crypto";
import { Platform } from "@ai-omni/shared";
import { ChannelAccount } from "@prisma/client";
import { PrismaService } from "./prisma.service.js";

@Injectable()
export class ChannelAccountsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async byWebchatKey(accountKey: string) {
    const account = await this.prisma.channelAccount.findUnique({ where: { accountKey } });
    if (!account || account.platform !== "webchat") {
      throw new NotFoundException("Unknown webchat account");
    }
    return account;
  }

  async byId(channelAccountId: string, platform?: Platform) {
    const account = await this.prisma.channelAccount.findUnique({ where: { id: channelAccountId } });
    if (!account || (platform && account.platform !== platform)) {
      throw new NotFoundException("Unknown channel account");
    }
    return account;
  }

  verifyLineSignature(account: ChannelAccount, rawBody: Buffer | undefined, signature: string | undefined) {
    const secret = account.webhookSecret ?? process.env.LINE_CHANNEL_SECRET;
    if (!secret) {
      return true;
    }
    if (isMockChannelMode() && signature === "mock-line-signature") {
      return true;
    }
    if (!rawBody || !signature) {
      throw new UnauthorizedException("Missing LINE signature");
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");

    const actual = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actual.length !== expectedBuffer.length || !crypto.timingSafeEqual(actual, expectedBuffer)) {
      throw new UnauthorizedException("Invalid LINE signature");
    }
    return true;
  }

  verifyTelegramSecret(account: ChannelAccount, secretToken: string | undefined) {
    const secret = account.webhookSecret ?? process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret) {
      return true;
    }
    if (isMockChannelMode() && secretToken === "mock-telegram-secret") {
      return true;
    }
    if (!secretToken) {
      throw new UnauthorizedException("Missing Telegram webhook secret");
    }
    const actual = Buffer.from(secretToken);
    const expected = Buffer.from(secret);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
      throw new UnauthorizedException("Invalid Telegram webhook secret");
    }
    return true;
  }

  verifyMetaWebhook(platform: Extract<Platform, "facebook" | "instagram">, verifyToken: string | undefined) {
    const expected = metaVerifyToken(platform);
    if (!expected) {
      throw new UnauthorizedException("Meta verify token is not configured");
    }
    if (!verifyToken) {
      throw new UnauthorizedException("Missing Meta verify token");
    }
    const actual = Buffer.from(verifyToken);
    const expectedBuffer = Buffer.from(expected);
    if (actual.length !== expectedBuffer.length || !crypto.timingSafeEqual(actual, expectedBuffer)) {
      throw new UnauthorizedException("Invalid Meta verify token");
    }
    return true;
  }

  verifyMetaSignature(rawBody: Buffer | undefined, signature: string | undefined) {
    if (isMockChannelMode() && signature === "mock-meta-signature") {
      return true;
    }

    const secret = process.env.META_APP_SECRET;
    if (!secret) {
      if (isMockChannelMode()) return true;
      throw new UnauthorizedException("META_APP_SECRET is required for Meta signature verification");
    }
    if (!rawBody || !signature) {
      throw new UnauthorizedException("Missing Meta signature");
    }

    const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
    const actual = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actual.length !== expectedBuffer.length || !crypto.timingSafeEqual(actual, expectedBuffer)) {
      throw new UnauthorizedException("Invalid Meta signature");
    }
    return true;
  }
}

function isMockChannelMode() {
  return ["mock", "demo", "test"].includes((process.env.META_CHANNEL_MODE ?? process.env.CHANNEL_MODE ?? process.env.AI_MODE ?? "mock").toLowerCase());
}

function metaVerifyToken(platform: Extract<Platform, "facebook" | "instagram">) {
  const platformToken = platform === "facebook" ? process.env.FACEBOOK_VERIFY_TOKEN : process.env.INSTAGRAM_VERIFY_TOKEN;
  return platformToken ?? process.env.META_VERIFY_TOKEN ?? (isMockChannelMode() ? "test_verify_token" : undefined);
}
