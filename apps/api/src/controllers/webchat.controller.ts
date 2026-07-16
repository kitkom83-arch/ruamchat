import { Controller, Get, Inject, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import type { WebchatOutboundEvent } from "@ai-omni/shared";
import { WebchatRealtimeService } from "../services/webchat-realtime.service.js";

const HEARTBEAT_INTERVAL_MS = 25_000;

@Controller("webchat")
export class WebchatController {
  constructor(
    @Inject(WebchatRealtimeService)
    private readonly realtime: WebchatRealtimeService
  ) {}

  /**
   * Server-Sent Events stream that pushes webchat outbound replies (admin or AI)
   * to the customer widget for a single conversation in real time. EventSource
   * cannot send custom headers, so this endpoint is keyed only by conversationId
   * and never requires the tenant header.
   */
  @Get("stream/:conversationId")
  stream(@Param("conversationId") conversationId: string, @Res() res: Response) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write(`event: ready\ndata: ${JSON.stringify({ conversationId })}\n\n`);

    const send = (event: WebchatOutboundEvent) => {
      res.write(`event: message\ndata: ${JSON.stringify(event)}\n\n`);
    };
    const unsubscribe = this.realtime.subscribe(conversationId, send);

    const heartbeat = setInterval(() => {
      res.write(`: keep-alive\n\n`);
    }, HEARTBEAT_INTERVAL_MS);

    const cleanup = () => {
      clearInterval(heartbeat);
      unsubscribe();
    };
    res.on("close", cleanup);
    res.on("error", cleanup);
  }
}
