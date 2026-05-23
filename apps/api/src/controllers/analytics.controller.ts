import { Controller, Get, Headers, Inject, Query } from "@nestjs/common";
import { AnalyticsService, type AnalyticsQueryInput } from "../services/analytics.service.js";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

@Controller("analytics")
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private readonly analytics: AnalyticsService) {}

  @Get("overview")
  async overview(@Headers("x-tenant-id") tenant = defaultTenantId, @Query() query: AnalyticsQueryInput) {
    return this.analytics.overview(tenant, query);
  }

  @Get("conversations")
  async conversations(@Headers("x-tenant-id") tenant = defaultTenantId, @Query() query: AnalyticsQueryInput) {
    return this.analytics.conversations(tenant, query);
  }

  @Get("channels")
  async channels(@Headers("x-tenant-id") tenant = defaultTenantId, @Query() query: AnalyticsQueryInput) {
    return this.analytics.channels(tenant, query);
  }

  @Get("agents")
  async agents(@Headers("x-tenant-id") tenant = defaultTenantId, @Query() query: AnalyticsQueryInput) {
    return this.analytics.agents(tenant, query);
  }

  @Get("sla")
  async sla(@Headers("x-tenant-id") tenant = defaultTenantId, @Query() query: AnalyticsQueryInput) {
    return this.analytics.sla(tenant, query);
  }

  @Get("ai")
  async ai(@Headers("x-tenant-id") tenant = defaultTenantId, @Query() query: AnalyticsQueryInput) {
    return this.analytics.ai(tenant, query);
  }

  @Get("tasks")
  async tasks(@Headers("x-tenant-id") tenant = defaultTenantId, @Query() query: AnalyticsQueryInput) {
    return this.analytics.tasks(tenant, query);
  }

  @Get("audit")
  async audit(@Headers("x-tenant-id") tenant = defaultTenantId, @Query() query: AnalyticsQueryInput) {
    return this.analytics.audit(tenant, query);
  }
}
