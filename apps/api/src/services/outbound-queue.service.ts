import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { Redis } from "ioredis";

@Injectable()
export class OutboundQueueService implements OnModuleDestroy {
  private readonly connection?: Redis;
  private readonly outboundQueue?: Queue;
  private readonly aiQueue?: Queue;

  constructor() {
    if (process.env.REDIS_URL) {
      this.connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
      this.outboundQueue = new Queue("outbound", { connection: this.connection });
      this.aiQueue = new Queue("ai", { connection: this.connection });
    }
  }

  async enqueueOutbound(messageId: string) {
    await this.outboundQueue?.add("send", { messageId }, { attempts: 5, backoff: { type: "exponential", delay: 1000 } });
  }

  async enqueueAi(conversationId: string, messageId: string) {
    await this.aiQueue?.add("suggest", { conversationId, messageId }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
  }

  async onModuleDestroy() {
    await this.outboundQueue?.close();
    await this.aiQueue?.close();
    await this.connection?.quit();
  }
}
