import { BadRequestException, Body, Controller, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
import {
  createContactRequestSchema,
  linkContactIdentityRequestSchema,
  setPrimaryIdentityRequestSchema,
  unlinkContactIdentityRequestSchema,
  updateContactRequestSchema
} from "@ai-omni/shared";
import { CustomerService } from "../services/customer.service.js";

@Controller("contacts")
export class ContactsController {
  constructor(@Inject(CustomerService) private readonly customers: CustomerService) {}

  @Get()
  async list(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.customers.listContacts(requireTenantId(tenant));
  }

  @Get(":contactId")
  async detail(@Param("contactId") contactId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.customers.getContact(requireTenantId(tenant), contactId);
  }

  @Get(":contactId/identities")
  async identities(@Param("contactId") contactId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.customers.getContactIdentities(requireTenantId(tenant), contactId);
  }

  @Get(":contactId/conversations")
  async conversations(@Param("contactId") contactId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.customers.getContactConversations(requireTenantId(tenant), contactId);
  }

  @Post()
  async create(
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.customers.createContact(requireTenantId(tenant), createContactRequestSchema.parse(body), userId);
  }

  @Patch(":contactId")
  async update(
    @Param("contactId") contactId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.customers.updateContact(requireTenantId(tenant), contactId, updateContactRequestSchema.parse(body), userId);
  }

  @Post(":contactId/identities/link")
  async linkIdentity(
    @Param("contactId") contactId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.customers.linkIdentity(requireTenantId(tenant), contactId, linkContactIdentityRequestSchema.parse(body), userId);
  }

  @Post(":contactId/identities/unlink")
  async unlinkIdentity(
    @Param("contactId") contactId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.customers.unlinkIdentity(requireTenantId(tenant), contactId, unlinkContactIdentityRequestSchema.parse(body), userId);
  }

  @Patch(":contactId/primary-identity")
  async setPrimaryIdentity(
    @Param("contactId") contactId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.customers.setPrimaryIdentity(requireTenantId(tenant), contactId, setPrimaryIdentityRequestSchema.parse(body), userId);
  }
}

function requireTenantId(tenant: string | undefined) {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
}
