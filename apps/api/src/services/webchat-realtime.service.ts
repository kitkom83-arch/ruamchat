import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Redis } from "ioredis";
import { WEBCHAT_OUTBOUND_CHANNEL, type WebchatOutboundEvent } from "@ai-omni/shared";

export type WebchatStreamListener = (event: WebchatOutboundEvent) => void;

/**
 * Bridges webchat outbound replies published by the worker process (over Redis
 * pub/sub on {@link WEBCHAT_OUTBOUND_CHANNEL}) into per-conversation listeners.
 * The webchat SSE controller registers a listener per connected widget and
 * relays matching events to the customer's browser in real time.
 *
 * The worker and API run as separate processes, so Redis pub/sub is the bridge:
 * worker `publish` -> API subscriber -> `dispatch` -> SSE `write`.
 */
@Injectable()
export class WebchatRealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebchatRealtimeService.name);
  private subscriber?: Redis;
  private readonly listeners = new Map<string, Set<WebchatStreamListener>>();

  onModuleInit() {
    if (!process.env.REDIS_URL) {
      return;
    }
    this.subscriber = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
    this.subscriber.on("message", (channel, message) => {
      if (channel === WEBCHAT_OUTBOUND_CHANNEL) {
        this.dispatch(message);
      }
    });
    this.subscriber.subscribe(WEBCHAT_OUTBOUND_CHANNEL).catch((error) => {
      this.logger.error(`Failed to subscribe to ${WEBCHAT_OUTBOUND_CHANNEL}`, error as Error);
    });
  }

  /**
   * Register a listener for a conversation. Returns an unsubscribe function that
   * must be called when the SSE connection closes to avoid leaking listeners.
   */
  subscribe(conversationId: string, listener: WebchatStreamListener): () => void {
    const set = this.listeners.get(conversationId) ?? new Set<WebchatStreamListener>();
    set.add(listener);
    this.listeners.set(conversationId, set);

    return () => {
      const current = this.listeners.get(conversationId);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0) {
        this.listeners.delete(conversationId);
      }
    };
  }

  /** Parse a raw pub/sub payload and fan it out to matching listeners. */
  dispatch(raw: string) {
    let event: WebchatOutboundEvent;
    try {
      event = JSON.parse(raw) as WebchatOutboundEvent;
    } catch (error) {
      this.logger.warn(`Discarding malformed webchat outbound event: ${(error as Error).message}`);
      return;
    }

    if (!event || typeof event.conversationId !== "string") {
      return;
    }

    const set = this.listeners.get(event.conversationId);
    if (!set) return;
    for (const listener of set) {
      try {
        listener(event);
      } catch (error) {
        this.logger.error("Webchat stream listener failed", error as Error);
      }
    }
  }

  async onModuleDestroy() {
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = undefined;
    }
    this.listeners.clear();
  }
}
