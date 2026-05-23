import { Body, Controller, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
import {
  createContactRequestSchema,
  linkContactIdentityRequestSchema,
  setPrimaryIdentityRequestSchema,
  unlinkContactIdentityRequestSchema,
  updateContactRequestSchema
} from "@ai-omni/shared";
import { CustomerService } from "../services/customer.service.js";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

@Controller("contacts")
export class ContactsController {
  constructor(@Inject(CustomerService) private readonly customers: CustomerService) {}

  @Get()
  async list(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.customers.listContacts(tenant);
  }

  @Get(":contactId")
  async detail(@Param("contactId") contactId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.customers.getContact(tenant, contactId);
  }

  @Get(":contactId/identities")
  async identities(@Param("contactId") contactId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.customers.getContactIdentities(tenant, contactId);
  }

  @Get(":contactId/conversations")
  async conversations(@Param("contactId") contactId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.customers.getContactConversations(tenant, contactId);
  }

  @Post()
  async create(@Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.customers.createContact(tenant, createContactRequestSchema.parse(body));
  }

  @Patch(":contactId")
  async update(
    @Param("contactId") contactId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.customers.updateContact(tenant, contactId, updateContactRequestSchema.parse(body));
  }

  @Post(":contactId/identities/link")
  async linkIdentity(
    @Param("contactId") contactId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.customers.linkIdentity(tenant, contactId, linkContactIdentityRequestSchema.parse(body));
  }

  @Post(":contactId/identities/unlink")
  async unlinkIdentity(
    @Param("contactId") contactId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.customers.unlinkIdentity(tenant, contactId, unlinkContactIdentityRequestSchema.parse(body));
  }

  @Patch(":contactId/primary-identity")
  async setPrimaryIdentity(
    @Param("contactId") contactId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.customers.setPrimaryIdentity(tenant, contactId, setPrimaryIdentityRequestSchema.parse(body));
  }
}
