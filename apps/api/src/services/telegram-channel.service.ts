import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  TelegramBotInfo,
  TelegramSetWebhookResult,
  TelegramTestConnectionResult
} from "@ai-omni/shared";
import { CryptoService } from "./crypto.service.js";
import { PrismaService } from "./prisma.service.js";

/**
 * Admin helpers for the Telegram channel card in Settings > Channels.
 *
 * Talks to the Telegram Bot API (getMe / getWebhookInfo / setWebhook) using the
 * access token stored (encrypted) on the ChannelAccount. The raw token is never
 * logged nor returned to the caller — only bot identity and connection status.
 */
@Injectable()
export class TelegramChannelService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(CryptoService) private readonly crypto: CryptoService
  ) {}

  async getBotInfo(tenantId: string, channelAccountId: string): Promise<TelegramBotInfo> {
    const { token } = await this.resolveAccount(tenantId, channelAccountId, { requireToken: true });
    const me = await telegramGetMe(token!);
    if (!me.ok || !me.result) {
      throw new NotFoundException(me.description ?? "Unable to fetch Telegram bot info");
    }
    return mapBotInfo(me.result);
  }

  async testConnection(
    tenantId: string,
    channelAccountId: string,
    requestHost?: string
  ): Promise<TelegramTestConnectionResult> {
    const { token } = await this.resolveAccount(tenantId, channelAccountId, { requireToken: false });
    const expectedWebhookUrl = telegramWebhookUrl(channelAccountId, requestHost);

    if (!token) {
      return {
        tokenOk: false,
        webhookOk: false,
        botUsername: null,
        currentWebhookUrl: null,
        expectedWebhookUrl,
        pendingUpdateCount: null,
        lastErrorMessage: "ยังไม่ได้ตั้งค่า access token ของบอท"
      };
    }

    const me = await telegramGetMe(token);
    if (!me.ok || !me.result) {
      return {
        tokenOk: false,
        webhookOk: false,
        botUsername: null,
        currentWebhookUrl: null,
        expectedWebhookUrl,
        pendingUpdateCount: null,
        lastErrorMessage: me.description ?? "Telegram token ไม่ถูกต้อง"
      };
    }

    const info = await telegramGetWebhookInfo(token);
    if (!info.ok || !info.result) {
      return {
        tokenOk: true,
        webhookOk: false,
        botUsername: me.result.username ?? null,
        currentWebhookUrl: null,
        expectedWebhookUrl,
        pendingUpdateCount: null,
        lastErrorMessage: info.description ?? "ไม่สามารถอ่านข้อมูล webhook ได้"
      };
    }

    const currentWebhookUrl = info.result.url ? info.result.url : null;
    return {
      tokenOk: true,
      webhookOk: currentWebhookUrl === expectedWebhookUrl,
      botUsername: me.result.username ?? null,
      currentWebhookUrl,
      expectedWebhookUrl,
      pendingUpdateCount: typeof info.result.pending_update_count === "number" ? info.result.pending_update_count : null,
      lastErrorMessage: info.result.last_error_message ? info.result.last_error_message : null
    };
  }

  async setWebhook(
    tenantId: string,
    channelAccountId: string,
    requestHost?: string
  ): Promise<TelegramSetWebhookResult> {
    const { account, token } = await this.resolveAccount(tenantId, channelAccountId, { requireToken: true });
    const expectedWebhookUrl = telegramWebhookUrl(channelAccountId, requestHost);
    const secret = account.webhookSecret ?? undefined;

    const result = await telegramSetWebhook(token!, expectedWebhookUrl, secret);
    return {
      ok: result.ok === true,
      expectedWebhookUrl,
      secretApplied: Boolean(secret),
      description: result.description ?? null
    };
  }

  private async resolveAccount(
    tenantId: string,
    channelAccountId: string,
    options: { requireToken: boolean }
  ) {
    const account = await this.prisma.channelAccount.findFirst({
      where: { tenantId, id: channelAccountId }
    });
    if (!account || account.platform !== "telegram") {
      throw new NotFoundException("Telegram channel account not found");
    }
    let token: string | null = null;
    if (account.accessTokenCiphertext) {
      token = this.crypto.decrypt(account.accessTokenCiphertext);
    }
    if (options.requireToken && !token) {
      throw new NotFoundException("ยังไม่ได้ตั้งค่า access token ของบอท Telegram");
    }
    return { account, token };
  }
}

type TelegramApiResponse<T> = { ok: boolean; result?: T; description?: string };

type TelegramGetMeResult = {
  id: number;
  username?: string | null;
  first_name?: string | null;
  can_join_groups?: boolean | null;
};

type TelegramWebhookInfoResult = {
  url?: string | null;
  pending_update_count?: number | null;
  last_error_message?: string | null;
};

async function telegramGetMe(token: string): Promise<TelegramApiResponse<TelegramGetMeResult>> {
  return telegramCall<TelegramGetMeResult>(token, "getMe");
}

async function telegramGetWebhookInfo(token: string): Promise<TelegramApiResponse<TelegramWebhookInfoResult>> {
  return telegramCall<TelegramWebhookInfoResult>(token, "getWebhookInfo");
}

async function telegramSetWebhook(
  token: string,
  url: string,
  secretToken?: string
): Promise<TelegramApiResponse<boolean>> {
  const body: Record<string, unknown> = { url };
  if (secretToken) {
    body.secret_token = secretToken;
  }
  return telegramCall<boolean>(token, "setWebhook", body);
}

async function telegramCall<T>(
  token: string,
  method: string,
  body?: Record<string, unknown>
): Promise<TelegramApiResponse<T>> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {})
    });
    const data = (await response.json().catch(() => null)) as TelegramApiResponse<T> | null;
    if (!data) {
      return { ok: false, description: `Telegram ${method} failed: ${response.status}` };
    }
    return data;
  } catch (error) {
    return { ok: false, description: error instanceof Error ? error.message : `Telegram ${method} request failed` };
  }
}

function mapBotInfo(result: TelegramGetMeResult): TelegramBotInfo {
  return {
    id: result.id,
    username: result.username ?? null,
    firstName: result.first_name ?? null,
    canJoinGroups: typeof result.can_join_groups === "boolean" ? result.can_join_groups : null
  };
}

function telegramWebhookUrl(channelAccountId: string, requestHost?: string) {
  const base = publicBaseUrl(requestHost).replace(/\/$/, "");
  return `${base}/api/webhooks/telegram/${encodeURIComponent(channelAccountId)}`;
}

function publicBaseUrl(requestHost?: string) {
  const configured = process.env.PUBLIC_BASE_URL ?? process.env.APP_URL;
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured;
  }
  if (requestHost) {
    return requestHost.startsWith("http") ? requestHost : `https://${requestHost}`;
  }
  return "http://localhost:4000";
}
