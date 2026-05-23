import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
import {
  createFlowRequestSchema,
  flowTestRunRequestSchema,
  updateFlowRequestSchema,
  updateFlowStatusRequestSchema
} from "@ai-omni/shared";
import { FlowService } from "../services/flow.service.js";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

@Controller("flows")
export class FlowsController {
  constructor(@Inject(FlowService) private readonly flows: FlowService) {}

  @Get()
  async listFlows(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.flows.listFlows(tenant);
  }

  @Post()
  async createFlow(
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId,
    @Headers("x-user-id") userId?: string
  ) {
    return this.flows.createFlow(tenant, userId, createFlowRequestSchema.parse(body));
  }

  @Get(":flowId")
  async getFlow(@Param("flowId") flowId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.flows.getFlow(tenant, flowId);
  }

  @Patch(":flowId")
  async updateFlow(@Param("flowId") flowId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.flows.updateFlow(tenant, flowId, updateFlowRequestSchema.parse(body));
  }

  @Delete(":flowId")
  async deleteFlow(@Param("flowId") flowId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.flows.archiveFlow(tenant, flowId);
  }

  @Post(":flowId/duplicate")
  async duplicateFlow(
    @Param("flowId") flowId: string,
    @Headers("x-tenant-id") tenant = defaultTenantId,
    @Headers("x-user-id") userId?: string
  ) {
    return this.flows.duplicateFlow(tenant, flowId, userId);
  }

  @Patch(":flowId/status")
  async updateStatus(@Param("flowId") flowId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.flows.updateStatus(tenant, flowId, updateFlowStatusRequestSchema.parse(body).status);
  }

  @Get(":flowId/runs")
  async listRuns(@Param("flowId") flowId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.flows.listRuns(tenant, flowId);
  }

  @Post(":flowId/test-run")
  async testRun(@Param("flowId") flowId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.flows.testRun(tenant, flowId, flowTestRunRequestSchema.parse(body ?? {}));
  }
}
