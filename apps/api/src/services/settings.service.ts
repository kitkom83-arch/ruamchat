import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  AgentRole,
  SettingsCannedReply,
  SettingsChannelAccount,
  SettingsSlaPolicy,
  SettingsTeamMember,
  UpdateSettingsCannedReplyRequest,
  UpdateSettingsChannelAccountRequest,
  UpdateSettingsSlaPolicyRequest,
  UpdateSettingsTeamMemberRequest
} from "@ai-omni/shared";
import type { Platform } from "@prisma/client";
import { CryptoService } from "./crypto.service.js";
import { PrismaService } from "./prisma.service.js";

@Injectable()
export class SettingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(CryptoService) private readonly crypto: CryptoService
  ) {}

  async listChannels(tenantId: string) {
    const channels = await this.prisma.channelAccount.findMany({
      where: { tenantId },
      orderBy: [{ platform: "asc" }, { displayName: "asc" }]
    });
    const activity = await this.channelActivity(tenantId, channels.map((channel) => channel.id));
    return channels.map((channel) => mapChannel(channel, activity.get(channel.id)));
  }

  async getChannel(tenantId: string, channelAccountId: string) {
    const channel = await this.prisma.channelAccount.findFirst({
      where: { tenantId, id: channelAccountId }
    });
    if (!channel) throw new NotFoundException("Channel account not found");
    const activity = await this.channelActivity(tenantId, [channel.id]);
    return mapChannel(channel, activity.get(channel.id));
  }

  async updateChannel(tenantId: string, channelAccountId: string, request: UpdateSettingsChannelAccountRequest) {
    await this.ensureChannel(tenantId, channelAccountId);
    const data: {
      displayName?: string;
      status?: string;
      accessTokenCiphertext?: string;
      webhookSecret?: string;
    } = {
      displayName: request.accountName,
      status: request.status
    };
    if (request.accessToken !== undefined) {
      data.accessTokenCiphertext = this.crypto.encrypt(request.accessToken.trim());
    }
    if (request.webhookSecret !== undefined) {
      data.webhookSecret = request.webhookSecret.trim();
    }
    await this.prisma.channelAccount.update({
      where: { id: channelAccountId },
      data
    });
    return this.getChannel(tenantId, channelAccountId);
  }

  async listTeam(tenantId: string) {
    const memberships = await this.prisma.teamMembership.findMany({
      where: { tenantId },
      include: { user: true },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }]
    });
    return memberships.map(mapTeamMember);
  }

  async getTeamMember(tenantId: string, agentId: string) {
    const membership = await this.prisma.teamMembership.findFirst({
      where: { tenantId, userId: agentId },
      include: { user: true }
    });
    if (!membership) throw new NotFoundException("Team member not found");
    return mapTeamMember(membership);
  }

  async updateTeamMember(tenantId: string, agentId: string, request: UpdateSettingsTeamMemberRequest) {
    await this.ensureTeamMember(tenantId, agentId);
    if (request.name !== undefined || request.displayName !== undefined) {
      await this.prisma.user.update({
        where: { id: agentId },
        data: { name: request.displayName ?? request.name }
      });
    }
    if (request.role !== undefined) {
      await this.prisma.teamMembership.update({
        where: { tenantId_userId: { tenantId, userId: agentId } },
        data: { role: request.role }
      });
    }
    return this.getTeamMember(tenantId, agentId);
  }

  async listSlaPolicies(tenantId: string) {
    const policies = await this.prisma.slaPolicy.findMany({
      where: { tenantId },
      orderBy: [{ priorityScope: "asc" }, { name: "asc" }]
    });
    return policies.map(mapSlaPolicy);
  }

  async getSlaPolicy(tenantId: string, policyId: string) {
    const policy = await this.prisma.slaPolicy.findFirst({
      where: { tenantId, id: policyId }
    });
    if (!policy) throw new NotFoundException("SLA policy not found");
    return mapSlaPolicy(policy);
  }

  async updateSlaPolicy(tenantId: string, policyId: string, request: UpdateSettingsSlaPolicyRequest) {
    await this.ensureSlaPolicy(tenantId, policyId);
    await this.prisma.slaPolicy.update({
      where: { id: policyId },
      data: {
        name: request.name,
        description: request.description,
        status: request.status,
        priorityScope: request.priorityScope,
        firstResponseMinutes: request.firstResponseMinutes,
        resolutionMinutes: request.resolutionMinutes,
        businessHoursMode: request.businessHoursMode,
        escalationRole: request.escalationRole
      }
    });
    return this.getSlaPolicy(tenantId, policyId);
  }

  async listCannedReplies(tenantId: string) {
    const replies = await this.prisma.cannedReply.findMany({
      where: { tenantId },
      orderBy: [{ category: "asc" }, { title: "asc" }]
    });
    return replies.map(mapCannedReply);
  }

  async getCannedReply(tenantId: string, replyId: string) {
    const reply = await this.prisma.cannedReply.findFirst({
      where: { tenantId, id: replyId }
    });
    if (!reply) throw new NotFoundException("Canned reply not found");
    return mapCannedReply(reply);
  }

  async updateCannedReply(tenantId: string, replyId: string, request: UpdateSettingsCannedReplyRequest) {
    await this.ensureCannedReply(tenantId, replyId);
    await this.prisma.cannedReply.update({
      where: { id: replyId },
      data: {
        title: request.title,
        category: request.category,
        shortcut: request.shortcut,
        bodyTemplate: request.bodyTemplate,
        tags: request.tags,
        platformScope: request.platformScope,
        roomScope: request.roomScope,
        status: request.status
      }
    });
    return this.getCannedReply(tenantId, replyId);
  }

  private async ensureChannel(tenantId: string, channelAccountId: string) {
    const channel = await this.prisma.channelAccount.findFirst({
      where: { tenantId, id: channelAccountId }
    });
    if (!channel) throw new NotFoundException("Channel account not found");
    return channel;
  }

  private async ensureTeamMember(tenantId: string, agentId: string) {
    const membership = await this.prisma.teamMembership.findFirst({
      where: { tenantId, userId: agentId }
    });
    if (!membership) throw new NotFoundException("Team member not found");
    return membership;
  }

  private async ensureSlaPolicy(tenantId: string, policyId: string) {
    const policy = await this.prisma.slaPolicy.findFirst({
      where: { tenantId, id: policyId }
    });
    if (!policy) throw new NotFoundException("SLA policy not found");
    return policy;
  }

  private async ensureCannedReply(tenantId: string, replyId: string) {
    const reply = await this.prisma.cannedReply.findFirst({
      where: { tenantId, id: replyId }
    });
    if (!reply) throw new NotFoundException("Canned reply not found");
    return reply;
  }

  private async channelActivity(tenantId: string, channelAccountIds: string[]) {
    const activity = new Map<string, { lastInboundAt: Date | null; lastMessageAt: Date | null }>();
    for (const channelAccountId of channelAccountIds) {
      const [lastInbound, lastMessage] = await Promise.all([
        this.prisma.message.findFirst({
          where: { tenantId, channelAccountId, senderType: "user" },
          orderBy: { createdAt: "desc" }
        }),
        this.prisma.message.findFirst({
          where: { tenantId, channelAccountId },
          orderBy: { createdAt: "desc" }
        })
      ]);
      activity.set(channelAccountId, {
        lastInboundAt: lastInbound?.createdAt ?? null,
        lastMessageAt: lastMessage?.createdAt ?? null
      });
    }
    return activity;
  }
}

function mapChannel(channel: {
  id: string;
  platform: Platform;
  displayName: string;
  accountKey: string | null;
  accessTokenCiphertext: string | null;
  webhookSecret: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}, activity?: { lastInboundAt: Date | null; lastMessageAt: Date | null }): SettingsChannelAccount {
  return {
    id: channel.id,
    platform: channel.platform,
    accountName: channel.displayName,
    accountKey: channel.accountKey,
    status: channel.status,
    webhookUrl: webhookUrl(channel.platform, channel.accountKey ?? channel.id),
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString(),
    lastInboundAt: activity?.lastInboundAt?.toISOString() ?? null,
    lastMessageAt: activity?.lastMessageAt?.toISOString() ?? null,
    hasAccessToken: Boolean(channel.accessTokenCiphertext),
    tokenMasked: channel.accessTokenCiphertext ? "configured:redacted" : null,
    secretConfigured: Boolean(channel.webhookSecret),
    secretMasked: channel.webhookSecret ? "configured:redacted" : null
  };
}

function mapTeamMember(membership: {
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    name: string;
    email: string;
    updatedAt: Date;
  };
}): SettingsTeamMember {
  const role = normalizeRole(membership.role);
  return {
    id: membership.userId,
    name: membership.user.name,
    displayName: membership.user.name,
    role,
    email: membership.user.email,
    status: roleStatus(role),
    skills: roleSkills(role),
    maxConcurrentChats: roleCapacity(role),
    createdAt: membership.createdAt.toISOString(),
    updatedAt: membership.user.updatedAt.toISOString()
  };
}

function mapSlaPolicy(policy: {
  id: string;
  name: string;
  description: string;
  status: string;
  priorityScope: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  businessHoursMode: string;
  escalationRole: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SettingsSlaPolicy {
  return {
    id: policy.id,
    name: policy.name,
    description: policy.description,
    status: policy.status,
    priorityScope: policy.priorityScope,
    firstResponseMinutes: policy.firstResponseMinutes,
    resolutionMinutes: policy.resolutionMinutes,
    businessHoursMode: policy.businessHoursMode,
    escalationRole: policy.escalationRole,
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString()
  };
}

function mapCannedReply(reply: {
  id: string;
  title: string;
  category: string;
  shortcut: string;
  bodyTemplate: string;
  tags: string[];
  platformScope: string[];
  roomScope: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): SettingsCannedReply {
  return {
    id: reply.id,
    title: reply.title,
    category: reply.category,
    shortcut: reply.shortcut,
    bodyTemplate: reply.bodyTemplate,
    tags: reply.tags,
    platformScope: reply.platformScope.filter((platform) => ["webchat", "telegram", "line", "facebook", "instagram"].includes(platform)) as SettingsCannedReply["platformScope"],
    roomScope: reply.roomScope,
    status: reply.status,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString()
  };
}

function normalizeRole(role: string): AgentRole {
  if (["owner", "admin", "supervisor", "agent", "viewer"].includes(role)) return role as AgentRole;
  return "viewer";
}

function webhookUrl(platform: Platform, accountPath: string) {
  const baseUrl = (process.env.API_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
  return `${baseUrl}/webhooks/${platform}/${encodeURIComponent(accountPath)}`;
}

function roleStatus(role: AgentRole) {
  if (role === "viewer") return "offline" as const;
  if (role === "supervisor") return "away" as const;
  return "online" as const;
}

function roleSkills(role: AgentRole) {
  if (role === "owner" || role === "admin") return ["admin", "routing", "all-platforms"];
  if (role === "supervisor") return ["supervision", "handoff", "sla"];
  if (role === "viewer") return ["read-only"];
  return ["support", "omnichannel"];
}

function roleCapacity(role: AgentRole) {
  if (role === "owner" || role === "admin") return 12;
  if (role === "supervisor") return 10;
  if (role === "viewer") return 1;
  return 6;
}
