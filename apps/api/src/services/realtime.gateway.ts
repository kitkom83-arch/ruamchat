import { Logger } from "@nestjs/common";
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: process.env.APP_URL ?? "http://localhost:3000",
    credentials: true
  }
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server?: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    const tenantId = String(client.handshake.query.tenantId ?? "");
    if (tenantId) {
      void client.join(`tenant:${tenantId}`);
    }
    this.logger.debug(`socket connected ${client.id}`);
  }

  conversationUpdated(tenantId: string, payload: unknown) {
    this.server?.to(`tenant:${tenantId}`).emit("conversation.updated", payload);
  }
}
