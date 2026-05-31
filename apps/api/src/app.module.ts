import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiController } from "./controllers/ai.controller.js";
import { AnalyticsController } from "./controllers/analytics.controller.js";
import { BroadcastsController } from "./controllers/broadcasts.controller.js";
import { ContactsController } from "./controllers/contacts.controller.js";
import { ConversationsController, TasksController } from "./controllers/conversations.controller.js";
import { FlowsController } from "./controllers/flows.controller.js";
import { HealthController } from "./controllers/health.controller.js";
import { ProviderWebhooksController } from "./controllers/provider-webhooks.controller.js";
import { RoomsController } from "./controllers/rooms.controller.js";
import { SettingsController } from "./controllers/settings.controller.js";
import { WebhooksController } from "./controllers/webhooks.controller.js";
import { AuditService } from "./services/audit.service.js";
import { AnalyticsService } from "./services/analytics.service.js";
import { BroadcastService } from "./services/broadcast.service.js";
import { ChannelAccountsService } from "./services/channel-accounts.service.js";
import { ConversationService } from "./services/conversation.service.js";
import { CryptoService } from "./services/crypto.service.js";
import { CustomerService } from "./services/customer.service.js";
import { FlowService } from "./services/flow.service.js";
import { KnowledgeBaseService } from "./services/knowledge-base.service.js";
import { NormalizerService } from "./services/normalizer.service.js";
import { OpenAiOrchestratorService } from "./services/openai-orchestrator.service.js";
import { OutboundConsentService } from "./services/outbound-consent.service.js";
import { OutboundQueueService } from "./services/outbound-queue.service.js";
import { PrismaService } from "./services/prisma.service.js";
import { ProviderWebhookEventsService } from "./services/provider-webhook-events.service.js";
import { RealtimeGateway } from "./services/realtime.gateway.js";
import { SettingsService } from "./services/settings.service.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AiController, AnalyticsController, BroadcastsController, ContactsController, ConversationsController, TasksController, FlowsController, HealthController, ProviderWebhooksController, RoomsController, SettingsController, WebhooksController],
  providers: [
    AnalyticsService,
    AuditService,
    BroadcastService,
    ChannelAccountsService,
    ConversationService,
    CryptoService,
    CustomerService,
    FlowService,
    KnowledgeBaseService,
    NormalizerService,
    OpenAiOrchestratorService,
    OutboundConsentService,
    OutboundQueueService,
    PrismaService,
    ProviderWebhookEventsService,
    RealtimeGateway,
    SettingsService
  ]
})
export class AppModule {}
