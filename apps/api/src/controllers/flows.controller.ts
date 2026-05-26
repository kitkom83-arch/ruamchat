import { BadRequestException, Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
import {
  createFlowRequestSchema,
  flowTestRunRequestSchema,
  updateFlowRequestSchema,
  updateFlowStatusRequestSchema
} from "@ai-omni/shared";
import { FlowService } from "../services/flow.service.js";

@Controller("flows")
export class FlowsController {
  constructor(@Inject(FlowService) private readonly flows: FlowService) {}

  @Get()
  async listFlows(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.flows.listFlows(requireTenantId(tenant));
  }

  @Post()
  async createFlow(
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.flows.createFlow(requireTenantId(tenant), userId, createFlowRequestSchema.parse(body));
  }

  @Get(":flowId")
  async getFlow(@Param("flowId") flowId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.flows.getFlow(requireTenantId(tenant), flowId);
  }

  @Patch(":flowId")
  async updateFlow(@Param("flowId") flowId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.flows.updateFlow(requireTenantId(tenant), flowId, updateFlowRequestSchema.parse(body));
  }

  @Delete(":flowId")
  async deleteFlow(@Param("flowId") flowId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.flows.archiveFlow(requireTenantId(tenant), flowId);
  }

  @Post(":flowId/duplicate")
  async duplicateFlow(
    @Param("flowId") flowId: string,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.flows.duplicateFlow(requireTenantId(tenant), flowId, userId);
  }

  @Patch(":flowId/status")
  async updateStatus(@Param("flowId") flowId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.flows.updateStatus(requireTenantId(tenant), flowId, updateFlowStatusRequestSchema.parse(body).status);
  }

  @Get(":flowId/runs")
  async listRuns(@Param("flowId") flowId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.flows.listRuns(requireTenantId(tenant), flowId);
  }

  @Post(":flowId/test-run")
  async testRun(@Param("flowId") flowId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.flows.testRun(requireTenantId(tenant), flowId, flowTestRunRequestSchema.parse(body ?? {}));
  }
}

function requireTenantId(tenant: string | undefined) {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
}
