import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service.js";

type AuditRecordInput = {
  tenantId: string;
  conversationId?: string | null;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeJson?: Prisma.InputJsonValue;
  afterJson?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  metadataJson?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput) {
    return this.prisma.auditLog.create({
      data: this.toCreateData(input)
    });
  }

  private toCreateData(input: AuditRecordInput): Prisma.AuditLogUncheckedCreateInput {
    const metadata = input.metadataJson ?? input.metadata;
    return {
      tenantId: input.tenantId,
      conversationId: input.conversationId ?? (input.entityType === "conversation" ? input.entityId ?? null : null),
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      beforeJson: input.beforeJson,
      afterJson: input.afterJson,
      metadata: metadata ?? Prisma.JsonNull,
      metadataJson: metadata
    };
  }
}
