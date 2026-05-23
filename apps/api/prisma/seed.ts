import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const seedDir = path.dirname(fileURLToPath(import.meta.url));

for (const envPath of [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(seedDir, "../.env"),
  path.resolve(seedDir, "../../..", ".env.local")
]) {
  config({ path: envPath, override: false });
}

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Demo Omnichannel Team"
    }
  });

  const owner = await ensureUser({
    id: "00000000-0000-4000-8000-000000000010",
    email: "owner@example.com",
    name: "Owner"
  });

  await prisma.teamMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: owner.id } },
    update: { role: "owner" },
    create: { tenantId: tenant.id, userId: owner.id, role: "owner" }
  });

  const demoUsers = [
    { id: "00000000-0000-4000-8000-000000000011", email: "may@example.local", name: "May", role: "agent" as const },
    { id: "00000000-0000-4000-8000-000000000012", email: "ton@example.local", name: "Ton", role: "supervisor" as const },
    { id: "00000000-0000-4000-8000-000000000013", email: "beam@example.local", name: "Beam", role: "agent" as const }
  ];

  for (const user of demoUsers) {
    await ensureUser(user);
    await prisma.teamMembership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: { role: user.role },
      create: { tenantId: tenant.id, userId: user.id, role: user.role }
    });
  }

  const demoSlaPolicies = [
    {
      id: "00000000-0000-4000-8000-000000000061",
      name: "Low priority",
      description: "Safe demo SLA for low priority conversations.",
      priorityScope: "low",
      firstResponseMinutes: 60,
      resolutionMinutes: 4320,
      businessHoursMode: "business_hours",
      escalationRole: "supervisor"
    },
    {
      id: "00000000-0000-4000-8000-000000000062",
      name: "Medium priority",
      description: "Safe demo SLA for normal priority conversations.",
      priorityScope: "medium",
      firstResponseMinutes: 30,
      resolutionMinutes: 1440,
      businessHoursMode: "business_hours",
      escalationRole: "supervisor"
    },
    {
      id: "00000000-0000-4000-8000-000000000063",
      name: "High priority",
      description: "Safe demo SLA for high priority conversations.",
      priorityScope: "high",
      firstResponseMinutes: 10,
      resolutionMinutes: 480,
      businessHoursMode: "always",
      escalationRole: "supervisor"
    },
    {
      id: "00000000-0000-4000-8000-000000000064",
      name: "Urgent priority",
      description: "Safe demo SLA for urgent conversations.",
      priorityScope: "urgent",
      firstResponseMinutes: 5,
      resolutionMinutes: 120,
      businessHoursMode: "always",
      escalationRole: "admin"
    }
  ];

  for (const policy of demoSlaPolicies) {
    await prisma.slaPolicy.upsert({
      where: { id: policy.id },
      update: {
        name: policy.name,
        description: policy.description,
        status: "active",
        priorityScope: policy.priorityScope,
        firstResponseMinutes: policy.firstResponseMinutes,
        resolutionMinutes: policy.resolutionMinutes,
        businessHoursMode: policy.businessHoursMode,
        escalationRole: policy.escalationRole
      },
      create: {
        ...policy,
        tenantId: tenant.id,
        status: "active",
        createdAt: new Date("2026-05-21T04:00:00.000Z")
      }
    });
  }

  const demoCannedReplies = [
    {
      id: "00000000-0000-4000-8000-000000000071",
      title: "Greeting",
      shortcut: "/hello",
      category: "general",
      bodyTemplate: "สวัสดีครับ สนใจสอบถามเรื่องไหนครับ",
      tags: ["hello", "start"],
      platformScope: [] as string[],
      roomScope: [] as string[]
    },
    {
      id: "00000000-0000-4000-8000-000000000072",
      title: "Pricing package",
      shortcut: "/price",
      category: "sales",
      bodyTemplate: "แพ็กเกจเริ่มต้น 1,990 บาทต่อเดือนครับ ถ้าต้องการใช้งานหลายช่องทางหรือมี SLA ทีมขายช่วยประเมินแพ็กเกจที่เหมาะให้ได้ครับ",
      tags: ["pricing", "sales"],
      platformScope: ["webchat", "telegram", "line", "facebook", "instagram"],
      roomScope: [] as string[]
    },
    {
      id: "00000000-0000-4000-8000-000000000073",
      title: "Follow up",
      shortcut: "/followup",
      category: "sales",
      bodyTemplate: "ขออนุญาตติดตามผลครับ ยังสนใจให้ทีมงานช่วยดูรายละเอียดต่อไหมครับ",
      tags: ["followup"],
      platformScope: [] as string[],
      roomScope: [] as string[]
    },
    {
      id: "00000000-0000-4000-8000-000000000074",
      title: "Human review",
      shortcut: "/human",
      category: "support",
      bodyTemplate: "เดี๋ยวแอดมินตรวจสอบให้ครับ",
      tags: ["handoff", "support"],
      platformScope: [] as string[],
      roomScope: [] as string[]
    }
  ];

  for (const reply of demoCannedReplies) {
    await prisma.cannedReply.upsert({
      where: {
        tenantId_shortcut: {
          tenantId: tenant.id,
          shortcut: reply.shortcut
        }
      },
      update: {
        title: reply.title,
        category: reply.category,
        bodyTemplate: reply.bodyTemplate,
        tags: reply.tags,
        platformScope: reply.platformScope,
        roomScope: reply.roomScope,
        status: "active"
      },
      create: {
        ...reply,
        tenantId: tenant.id,
        status: "active",
        createdAt: new Date("2026-05-21T04:00:00.000Z")
      }
    });
  }

  const accounts = [
    { platform: "webchat" as const, displayName: "Main Website", accountKey: "demo-webchat", externalAccountId: "web-main", aiMode: "suggest" as const },
    { platform: "telegram" as const, displayName: "Bot 007237", accountKey: null, externalAccountId: "bot-007237", aiMode: "auto_faq" as const },
    { platform: "line" as const, displayName: "LINE OA Main", accountKey: null, externalAccountId: "line-oa-main", webhookSecret: "mock-line-secret", aiMode: "human_first" as const },
    { platform: "facebook" as const, displayName: "Page หลัก", accountKey: null, externalAccountId: "facebook-page-main", aiMode: "suggest" as const },
    { platform: "instagram" as const, displayName: "IG ร้านค้า", accountKey: null, externalAccountId: "instagram-shop", aiMode: "off" as const }
  ];

  for (const account of accounts) {
    const accountId = channelAccountId(account.platform);
    const saved = await prisma.channelAccount.upsert({
      where: account.accountKey ? { accountKey: account.accountKey } : { id: accountId },
      update: {
        displayName: account.displayName,
        externalAccountId: account.externalAccountId,
        webhookSecret: account.webhookSecret
      },
      create: {
        id: accountId,
        tenantId: tenant.id,
        platform: account.platform,
        displayName: account.displayName,
        accountKey: account.accountKey,
        externalAccountId: account.externalAccountId,
        webhookSecret: account.webhookSecret
      }
    });

    await prisma.room.upsert({
      where: {
        tenantId_platform_channelAccountId: {
          tenantId: tenant.id,
          platform: saved.platform,
          channelAccountId: saved.id
        }
      },
      update: { name: saved.displayName, aiMode: account.aiMode },
      create: {
        tenantId: tenant.id,
        platform: saved.platform,
        channelAccountId: saved.id,
        name: saved.displayName,
        aiMode: account.aiMode
      }
    });
  }

  const demoContacts = [
    {
      id: "00000000-0000-4000-8000-000000000101",
      displayName: "Demo Web Visitor",
      email: "web.visitor@example.local",
      phone: "000-000-0101",
      leadStatus: "interested",
      identities: [
        { platform: "webchat" as const, externalUserId: "visitor-demo-seed", displayName: "Demo Web", isPrimary: true }
      ]
    },
    {
      id: "00000000-0000-4000-8000-000000000102",
      displayName: "Demo Telegram Buyer",
      email: "telegram.buyer@example.local",
      phone: "000-000-0102",
      leadStatus: "new",
      identities: [
        { platform: "telegram" as const, externalUserId: "tg-demo-seed", displayName: "Demo TG", isPrimary: true }
      ]
    },
    {
      id: "00000000-0000-4000-8000-000000000103",
      displayName: "Demo Cross Platform",
      email: "cross.platform@example.local",
      phone: "000-000-0103",
      leadStatus: "qualified",
      identities: [
        { platform: "webchat" as const, externalUserId: "visitor-cross-seed", displayName: "Cross Web", isPrimary: true },
        { platform: "telegram" as const, externalUserId: "tg-cross-seed", displayName: "Cross TG", isPrimary: false }
      ]
    },
    {
      id: "00000000-0000-4000-8000-000000000104",
      displayName: "Demo Closed Customer",
      email: "closed.customer@example.local",
      phone: "000-000-0104",
      leadStatus: "quoted",
      identities: [
        { platform: "facebook" as const, externalUserId: "fb-closed-seed", displayName: "Closed FB", isPrimary: true }
      ]
    },
    {
      id: "00000000-0000-4000-8000-000000000105",
      displayName: "Demo Spam Candidate",
      email: "spam.candidate@example.local",
      phone: "000-000-0105",
      leadStatus: "new",
      identities: [
        { platform: "instagram" as const, externalUserId: "ig-spam-seed", displayName: "Spam IG", isPrimary: true }
      ]
    },
    {
      id: "00000000-0000-4000-8000-000000000106",
      displayName: "Demo LINE Member",
      email: "line.member@example.local",
      phone: "000-000-0106",
      leadStatus: "follow_up",
      identities: [
        { platform: "line" as const, externalUserId: "line-demo-seed", displayName: "Demo LINE", isPrimary: true }
      ]
    }
  ];

  for (const contact of demoContacts) {
    await prisma.contact.upsert({
      where: { id: contact.id },
      update: {
        displayName: contact.displayName,
        email: contact.email,
        phone: contact.phone,
        leadStatus: contact.leadStatus
      },
      create: {
        id: contact.id,
        tenantId: tenant.id,
        displayName: contact.displayName,
        email: contact.email,
        phone: contact.phone,
        leadStatus: contact.leadStatus
      }
    });

    for (const identity of contact.identities) {
      const accountId = channelAccountId(identity.platform);
      await prisma.contactIdentity.upsert({
        where: {
          tenantId_platform_channelAccountId_externalUserId: {
            tenantId: tenant.id,
            platform: identity.platform,
            channelAccountId: accountId,
            externalUserId: identity.externalUserId
          }
        },
        update: {
          contactId: contact.id,
          displayName: identity.displayName,
          isPrimary: identity.isPrimary
        },
        create: {
          tenantId: tenant.id,
          contactId: contact.id,
          platform: identity.platform,
          channelAccountId: accountId,
          externalUserId: identity.externalUserId,
          displayName: identity.displayName,
          isPrimary: identity.isPrimary
        }
      });
    }
  }

  const demoConversations = [
    {
      id: "00000000-0000-4000-8000-000000000201",
      contactId: "00000000-0000-4000-8000-000000000101",
      platform: "webchat" as const,
      externalUserId: "visitor-demo-seed",
      assignedUserId: "00000000-0000-4000-8000-000000000011",
      aiState: "need_human",
      priority: "high" as const,
      status: "open" as const,
      unread: true,
      unreplied: true,
      followUpAt: null,
      slaDueAt: new Date("2026-05-21T04:10:00.000Z"),
      firstResponseDueAt: new Date("2026-05-21T04:10:00.000Z"),
      resolutionDueAt: new Date("2026-05-21T12:00:00.000Z"),
      slaStatus: "warning" as const,
      slaBreachedAt: null,
      lastMessage: "อยากเทียบแพ็กเกจ Pro กับ Business ก่อนตัดสินใจ",
      platformMessageId: "seed-webchat-message-1"
    },
    {
      id: "00000000-0000-4000-8000-000000000202",
      contactId: "00000000-0000-4000-8000-000000000102",
      platform: "telegram" as const,
      externalUserId: "tg-demo-seed",
      assignedUserId: null,
      aiState: "human",
      priority: "urgent" as const,
      status: "open" as const,
      unread: true,
      unreplied: true,
      followUpAt: null,
      slaDueAt: new Date("2026-05-21T03:50:00.000Z"),
      firstResponseDueAt: new Date("2026-05-21T03:50:00.000Z"),
      resolutionDueAt: new Date("2026-05-21T05:00:00.000Z"),
      slaStatus: "breached" as const,
      slaBreachedAt: new Date("2026-05-21T03:55:00.000Z"),
      lastMessage: "บอทตอบเรื่องใบเสนอราคาผิด ช่วยดูให้หน่อย",
      platformMessageId: "seed-telegram-message-1"
    },
    {
      id: "00000000-0000-4000-8000-000000000203",
      contactId: "00000000-0000-4000-8000-000000000103",
      platform: "webchat" as const,
      externalUserId: "visitor-cross-seed",
      assignedUserId: "00000000-0000-4000-8000-000000000012",
      aiState: "ai_active",
      priority: "normal" as const,
      status: "pending" as const,
      unread: false,
      unreplied: false,
      followUpAt: new Date("2026-05-22T04:00:00.000Z"),
      slaDueAt: new Date("2026-05-21T06:00:00.000Z"),
      firstResponseDueAt: new Date("2026-05-21T06:00:00.000Z"),
      resolutionDueAt: new Date("2026-05-22T04:00:00.000Z"),
      slaStatus: "ok" as const,
      slaBreachedAt: null,
      lastMessage: "มีคู่มือเชื่อม webhook ไหม",
      platformMessageId: "seed-cross-web-message-1"
    },
    {
      id: "00000000-0000-4000-8000-000000000204",
      contactId: "00000000-0000-4000-8000-000000000104",
      platform: "facebook" as const,
      externalUserId: "fb-closed-seed",
      assignedUserId: "00000000-0000-4000-8000-000000000012",
      aiState: "idle",
      priority: "low" as const,
      status: "closed" as const,
      unread: false,
      unreplied: false,
      followUpAt: null,
      slaDueAt: null,
      firstResponseDueAt: null,
      resolutionDueAt: null,
      slaStatus: "ok" as const,
      slaBreachedAt: null,
      lastMessage: "ขอปิดเคสก่อน เดี๋ยวติดต่อใหม่",
      platformMessageId: "seed-facebook-closed-message-1"
    },
    {
      id: "00000000-0000-4000-8000-000000000205",
      contactId: "00000000-0000-4000-8000-000000000105",
      platform: "instagram" as const,
      externalUserId: "ig-spam-seed",
      assignedUserId: null,
      aiState: "off",
      priority: "normal" as const,
      status: "spam" as const,
      unread: true,
      unreplied: true,
      followUpAt: null,
      slaDueAt: null,
      firstResponseDueAt: null,
      resolutionDueAt: null,
      slaStatus: "ok" as const,
      slaBreachedAt: null,
      lastMessage: "wholesale promo repeated message",
      platformMessageId: "seed-instagram-spam-message-1"
    },
    {
      id: "00000000-0000-4000-8000-000000000206",
      contactId: "00000000-0000-4000-8000-000000000106",
      platform: "line" as const,
      externalUserId: "line-demo-seed",
      assignedUserId: "00000000-0000-4000-8000-000000000013",
      aiState: "need_human",
      priority: "normal" as const,
      status: "open" as const,
      unread: false,
      unreplied: false,
      followUpAt: null,
      slaDueAt: new Date("2026-05-21T08:00:00.000Z"),
      firstResponseDueAt: new Date("2026-05-21T08:00:00.000Z"),
      resolutionDueAt: new Date("2026-05-23T04:00:00.000Z"),
      slaStatus: "ok" as const,
      slaBreachedAt: null,
      lastMessage: "ขอเวลาทำการและนัดให้ทีมติดต่อกลับ",
      platformMessageId: "seed-line-message-1"
    }
  ];

  for (const item of demoConversations) {
    const accountId = channelAccountId(item.platform);
    const room = await prisma.room.findFirstOrThrow({
      where: { tenantId: tenant.id, platform: item.platform, channelAccountId: accountId }
    });
    const identity = await prisma.contactIdentity.findUniqueOrThrow({
      where: {
        tenantId_platform_channelAccountId_externalUserId: {
          tenantId: tenant.id,
          platform: item.platform,
          channelAccountId: accountId,
          externalUserId: item.externalUserId
        }
      }
    });
    await prisma.conversation.upsert({
      where: { id: item.id },
      update: {
        assignedUserId: item.assignedUserId,
        aiState: item.aiState,
        priority: item.priority,
        status: item.status,
        slaDueAt: item.slaDueAt,
        slaBreachedAt: item.slaBreachedAt,
        slaStatus: item.slaStatus,
        firstResponseDueAt: item.firstResponseDueAt,
        resolutionDueAt: item.resolutionDueAt,
        unread: item.unread,
        unreplied: item.unreplied,
        followUpAt: item.followUpAt,
        createdAt: new Date("2026-05-21T04:00:00.000Z"),
        lastMessageAt: new Date("2026-05-21T04:00:00.000Z")
      },
      create: {
        id: item.id,
        tenantId: tenant.id,
        roomId: room.id,
        contactId: item.contactId,
        contactIdentityId: identity.id,
        externalConversationId: item.externalUserId,
        assignedUserId: item.assignedUserId,
        aiState: item.aiState,
        priority: item.priority,
        status: item.status,
        slaDueAt: item.slaDueAt,
        slaBreachedAt: item.slaBreachedAt,
        slaStatus: item.slaStatus,
        firstResponseDueAt: item.firstResponseDueAt,
        resolutionDueAt: item.resolutionDueAt,
        unread: item.unread,
        unreplied: item.unreplied,
        followUpAt: item.followUpAt,
        createdAt: new Date("2026-05-21T04:00:00.000Z"),
        lastMessageAt: new Date("2026-05-21T04:00:00.000Z")
      }
    });
    await prisma.message.upsert({
      where: {
        channelAccountId_platformMessageId: {
          channelAccountId: accountId,
          platformMessageId: item.platformMessageId
      }
    },
      update: { text: item.lastMessage, senderType: "user", createdAt: new Date("2026-05-21T04:00:00.000Z") },
      create: {
        tenantId: tenant.id,
        conversationId: item.id,
        channelAccountId: accountId,
        platformMessageId: item.platformMessageId,
        senderType: "user",
        messageType: "text",
        text: item.lastMessage,
        createdAt: new Date("2026-05-21T04:00:00.000Z")
      }
    });
  }

  const demoOutboundMessages = [
    {
      conversationId: "00000000-0000-4000-8000-000000000201",
      platform: "webchat" as const,
      platformMessageId: "seed-webchat-agent-reply-1",
      senderType: "agent" as const,
      agentUserId: "00000000-0000-4000-8000-000000000011",
      text: "รับเรื่องแล้วครับ เดี๋ยวส่งตารางเปรียบเทียบแพ็กเกจให้",
      createdAt: new Date("2026-05-21T04:04:00.000Z")
    },
    {
      conversationId: "00000000-0000-4000-8000-000000000203",
      platform: "webchat" as const,
      platformMessageId: "seed-cross-web-ai-reply-1",
      senderType: "ai" as const,
      agentUserId: null,
      text: "มีคู่มือ webhook ครับ เลือก platform ที่ต้องการเชื่อมต่อได้เลย",
      createdAt: new Date("2026-05-21T04:02:00.000Z")
    },
    {
      conversationId: "00000000-0000-4000-8000-000000000204",
      platform: "facebook" as const,
      platformMessageId: "seed-facebook-agent-reply-1",
      senderType: "agent" as const,
      agentUserId: "00000000-0000-4000-8000-000000000012",
      text: "รับทราบครับ ปิดเคสไว้ก่อนและกลับมาคุยต่อได้เสมอ",
      createdAt: new Date("2026-05-21T04:05:00.000Z")
    },
    {
      conversationId: "00000000-0000-4000-8000-000000000206",
      platform: "line" as const,
      platformMessageId: "seed-line-agent-reply-1",
      senderType: "agent" as const,
      agentUserId: "00000000-0000-4000-8000-000000000013",
      text: "สาขาเปิด 09:00-18:00 ครับ ผมตั้งให้ทีมติดต่อกลับแล้ว",
      createdAt: new Date("2026-05-21T04:06:00.000Z")
    }
  ];

  for (const message of demoOutboundMessages) {
    const accountId = channelAccountId(message.platform);
    await prisma.message.upsert({
      where: {
        channelAccountId_platformMessageId: {
          channelAccountId: accountId,
          platformMessageId: message.platformMessageId
        }
      },
      update: {
        senderType: message.senderType,
        agentUserId: message.agentUserId,
        text: message.text,
        createdAt: message.createdAt
      },
      create: {
        tenantId: tenant.id,
        conversationId: message.conversationId,
        channelAccountId: accountId,
        platformMessageId: message.platformMessageId,
        senderType: message.senderType,
        agentUserId: message.agentUserId,
        messageType: "text",
        text: message.text,
        createdAt: message.createdAt
      }
    });
  }

  await prisma.internalNote.upsert({
    where: { id: "00000000-0000-4000-8000-000000000301" },
    update: { body: "Demo note: ลูกค้าถามเรื่อง SLA และ migration ให้ supervisor ช่วยดูส่วนลด" },
    create: {
      id: "00000000-0000-4000-8000-000000000301",
      tenantId: tenant.id,
      conversationId: "00000000-0000-4000-8000-000000000201",
      contactId: "00000000-0000-4000-8000-000000000101",
      authorUserId: "00000000-0000-4000-8000-000000000011",
      body: "Demo note: ลูกค้าถามเรื่อง SLA และ migration ให้ supervisor ช่วยดูส่วนลด",
      visibility: "supervisor",
      pinned: true
    }
  });

  const demoTasks = [
    {
      id: "00000000-0000-4000-8000-000000000401",
      conversationId: "00000000-0000-4000-8000-000000000201",
      contactId: "00000000-0000-4000-8000-000000000101",
      title: "Demo task: ส่งราคา Business พร้อม SLA",
      status: "open",
      assigneeUserId: "00000000-0000-4000-8000-000000000011",
      createdByUserId: "00000000-0000-4000-8000-000000000012",
      dueAt: new Date("2026-05-22T09:00:00.000Z"),
      completedAt: null
    },
    {
      id: "00000000-0000-4000-8000-000000000402",
      conversationId: "00000000-0000-4000-8000-000000000204",
      contactId: "00000000-0000-4000-8000-000000000104",
      title: "Demo task: บันทึกผลปิดเคส Facebook",
      status: "done",
      assigneeUserId: "00000000-0000-4000-8000-000000000012",
      createdByUserId: "00000000-0000-4000-8000-000000000012",
      dueAt: new Date("2026-05-21T08:00:00.000Z"),
      completedAt: new Date("2026-05-21T04:20:00.000Z")
    },
    {
      id: "00000000-0000-4000-8000-000000000403",
      conversationId: "00000000-0000-4000-8000-000000000202",
      contactId: "00000000-0000-4000-8000-000000000102",
      title: "Demo task: ตรวจใบเสนอราคาที่บอทตอบผิด",
      status: "open",
      assigneeUserId: "00000000-0000-4000-8000-000000000011",
      createdByUserId: "00000000-0000-4000-8000-000000000012",
      dueAt: new Date("2026-05-21T03:30:00.000Z"),
      completedAt: null
    }
  ];

  for (const task of demoTasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        status: task.status,
        assigneeUserId: task.assigneeUserId,
        dueAt: task.dueAt,
        completedAt: task.completedAt
      },
      create: {
        id: task.id,
        tenantId: tenant.id,
        conversationId: task.conversationId,
        contactId: task.contactId,
        title: task.title,
        status: task.status,
        assigneeUserId: task.assigneeUserId,
        createdByUserId: task.createdByUserId,
        dueAt: task.dueAt,
        completedAt: task.completedAt,
        createdAt: new Date("2026-05-21T04:00:00.000Z")
      }
    });
  }

  await prisma.assignment.upsert({
    where: { id: "00000000-0000-4000-8000-000000000501" },
    update: { userId: "00000000-0000-4000-8000-000000000011", status: "active" },
    create: {
      id: "00000000-0000-4000-8000-000000000501",
      tenantId: tenant.id,
      conversationId: "00000000-0000-4000-8000-000000000201",
      userId: "00000000-0000-4000-8000-000000000011",
      assignedByUserId: "00000000-0000-4000-8000-000000000012",
      status: "active"
    }
  });

  const demoAuditLogs = [
    {
      id: "00000000-0000-4000-8000-000000000601",
      conversationId: "00000000-0000-4000-8000-000000000201",
      actorUserId: "00000000-0000-4000-8000-000000000012",
      action: "conversation.priority_updated",
      beforeJson: { priority: "normal" },
      afterJson: { priority: "high" },
      metadataJson: { source: "seed" }
    },
    {
      id: "00000000-0000-4000-8000-000000000602",
      conversationId: "00000000-0000-4000-8000-000000000202",
      actorUserId: "00000000-0000-4000-8000-000000000011",
      action: "conversation.sla_updated",
      beforeJson: { slaStatus: "warning" },
      afterJson: { slaStatus: "breached" },
      metadataJson: { source: "seed", reason: "demo breached SLA" }
    },
    {
      id: "00000000-0000-4000-8000-000000000603",
      conversationId: "00000000-0000-4000-8000-000000000204",
      actorUserId: "00000000-0000-4000-8000-000000000012",
      action: "conversation.closed",
      beforeJson: { status: "open" },
      afterJson: { status: "closed" },
      metadataJson: { source: "seed" }
    }
  ];

  for (const log of demoAuditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {
        tenantId: tenant.id,
        conversationId: log.conversationId,
        actorUserId: log.actorUserId,
        action: log.action,
        entityType: "conversation",
        entityId: log.conversationId,
        beforeJson: log.beforeJson,
        afterJson: log.afterJson,
        metadata: log.metadataJson,
        metadataJson: log.metadataJson
      },
      create: {
        id: log.id,
        tenantId: tenant.id,
        conversationId: log.conversationId,
        actorUserId: log.actorUserId,
        action: log.action,
        entityType: "conversation",
        entityId: log.conversationId,
        beforeJson: log.beforeJson,
        afterJson: log.afterJson,
        metadata: log.metadataJson,
        metadataJson: log.metadataJson
      }
    });
  }

  await prisma.conversationStatusHistory.upsert({
    where: { id: "00000000-0000-4000-8000-000000000701" },
    update: {
      tenantId: tenant.id,
      conversationId: "00000000-0000-4000-8000-000000000204",
      actorUserId: "00000000-0000-4000-8000-000000000012",
      fromStatus: "open",
      toStatus: "closed",
      metadataJson: { source: "seed" }
    },
    create: {
      id: "00000000-0000-4000-8000-000000000701",
      tenantId: tenant.id,
      conversationId: "00000000-0000-4000-8000-000000000204",
      actorUserId: "00000000-0000-4000-8000-000000000012",
      fromStatus: "open",
      toStatus: "closed",
      metadataJson: { source: "seed" }
    }
  });

  await prisma.knowledgeDoc.upsert({
    where: { id: "00000000-0000-4000-8000-000000000030" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000030",
      tenantId: tenant.id,
      category: "FAQ",
      title: "Default pricing FAQ",
      body: "ตอบคำถามราคาเบื้องต้นด้วยความสุภาพ ถ้าเกี่ยวกับคืนเงิน ยกเลิก หรือข้อมูลส่วนตัว ให้ส่งต่อมนุษย์"
    }
  });

  const defaultKnowledgeBase = await prisma.knowledgeBase.upsert({
    where: { id: "00000000-0000-4000-8000-000000000801" },
    update: {
      name: "Default Demo Knowledge Base",
      description: "Safe demo knowledge for AI Center API mode.",
      status: "active"
    },
    create: {
      id: "00000000-0000-4000-8000-000000000801",
      tenantId: tenant.id,
      name: "Default Demo Knowledge Base",
      description: "Safe demo knowledge for AI Center API mode.",
      status: "active"
    }
  });

  const demoDocuments = [
    {
      id: "00000000-0000-4000-8000-000000000802",
      title: "Pricing and Package FAQ",
      sourceType: "manual",
      sourceUrl: null
    },
    {
      id: "00000000-0000-4000-8000-000000000803",
      title: "Support and Handoff Policy",
      sourceType: "manual",
      sourceUrl: null
    }
  ];

  for (const document of demoDocuments) {
    await prisma.knowledgeDocument.upsert({
      where: { id: document.id },
      update: {
        title: document.title,
        sourceType: document.sourceType,
        sourceUrl: document.sourceUrl,
        status: "active"
      },
      create: {
        id: document.id,
        tenantId: tenant.id,
        knowledgeBaseId: defaultKnowledgeBase.id,
        title: document.title,
        sourceType: document.sourceType,
        sourceUrl: document.sourceUrl,
        status: "active"
      }
    });
  }

  const demoChunks = [
    {
      id: "00000000-0000-4000-8000-000000000804",
      documentId: "00000000-0000-4000-8000-000000000802",
      content: "Starter demo package starts at 1,990 THB per month for small teams.",
      metadataJson: { section: "pricing", language: "en" }
    },
    {
      id: "00000000-0000-4000-8000-000000000805",
      documentId: "00000000-0000-4000-8000-000000000802",
      content: "Pro demo package starts at 4,990 THB per month and includes AI draft assistance.",
      metadataJson: { section: "pricing", language: "en" }
    },
    {
      id: "00000000-0000-4000-8000-000000000806",
      documentId: "00000000-0000-4000-8000-000000000803",
      content: "AI must hand off refund, cancellation, payment, legal, and personal data change requests to a human agent.",
      metadataJson: { section: "safety", language: "en" }
    },
    {
      id: "00000000-0000-4000-8000-000000000807",
      documentId: "00000000-0000-4000-8000-000000000803",
      content: "Support demo hours are Monday to Friday, 09:00-18:00 Bangkok time.",
      metadataJson: { section: "support", language: "en" }
    }
  ];

  for (const chunk of demoChunks) {
    await prisma.knowledgeChunk.upsert({
      where: { id: chunk.id },
      update: {
        content: chunk.content,
        metadataJson: chunk.metadataJson
      },
      create: {
        id: chunk.id,
        tenantId: tenant.id,
        documentId: chunk.documentId,
        content: chunk.content,
        metadataJson: chunk.metadataJson
      }
    });
  }

  const documentCount = await prisma.knowledgeDocument.count({
    where: { tenantId: tenant.id, knowledgeBaseId: defaultKnowledgeBase.id, status: { not: "archived" } }
  });
  await prisma.knowledgeBase.update({
    where: { id: defaultKnowledgeBase.id },
    data: { documentCount }
  });

  const webchatRoom = await prisma.room.findFirstOrThrow({
    where: {
      tenantId: tenant.id,
      platform: "webchat",
      channelAccountId: channelAccountId("webchat")
    }
  });
  await prisma.roomKnowledgeBase.upsert({
    where: {
      tenantId_roomId_knowledgeBaseId: {
        tenantId: tenant.id,
        roomId: webchatRoom.id,
        knowledgeBaseId: defaultKnowledgeBase.id
      }
    },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000808",
      tenantId: tenant.id,
      roomId: webchatRoom.id,
      knowledgeBaseId: defaultKnowledgeBase.id
    }
  });

  const demoFlows = [
    {
      id: "00000000-0000-4000-8000-000000000901",
      name: "Demo pricing lead dry-run",
      description: "Routes pricing questions into a safe dry-run automation path.",
      status: "active",
      triggerType: "keyword",
      triggerConfigJson: {
        id: "trigger-demo-pricing",
        type: "keyword",
        keyword: "แพ็กเกจ",
        matchMode: "contains",
        caseSensitive: false
      },
      conditionsJson: {
        platformScope: ["webchat", "telegram", "line", "facebook", "instagram"],
        roomIds: [],
        nodes: [
          {
            id: "node-demo-pricing-hours",
            type: "condition",
            label: "Business hours",
            config: { operator: "business_hours", value: true },
            position: { x: 300, y: 80 }
          }
        ],
        edges: []
      },
      actionsJson: {
        nodes: [
          {
            id: "node-demo-pricing-message",
            type: "send_message",
            label: "Skip outbound pricing reply",
            config: { message: "Dry-run only pricing reply placeholder" },
            position: { x: 520, y: 80 }
          },
          {
            id: "node-demo-pricing-tag",
            type: "add_tag",
            label: "Simulate pricing tag",
            config: { tag: "pricing" },
            position: { x: 740, y: 80 }
          },
          {
            id: "node-demo-pricing-end",
            type: "end",
            label: "End flow",
            config: {},
            position: { x: 960, y: 80 }
          }
        ],
        edges: []
      }
    },
    {
      id: "00000000-0000-4000-8000-000000000902",
      name: "Demo LINE handoff draft",
      description: "Paused demo rule for LINE hot-lead handoff simulation.",
      status: "paused",
      triggerType: "tag_added",
      triggerConfigJson: {
        id: "trigger-demo-line-hot",
        type: "tag_added",
        tag: "hot lead",
        matchMode: "exact",
        caseSensitive: false
      },
      conditionsJson: {
        platformScope: ["line"],
        roomIds: [],
        nodes: [
          {
            id: "node-demo-line-platform",
            type: "condition",
            label: "Platform is LINE",
            config: { operator: "platform_equals", value: "line" },
            position: { x: 300, y: 80 }
          }
        ],
        edges: []
      },
      actionsJson: {
        nodes: [
          {
            id: "node-demo-line-assign",
            type: "assign_agent",
            label: "Simulate LINE owner assignment",
            config: { agentId: "00000000-0000-4000-8000-000000000013" },
            position: { x: 520, y: 80 }
          },
          {
            id: "node-demo-line-note",
            type: "note",
            label: "Simulate internal note",
            config: { note: "Dry-run LINE hot lead handoff note." },
            position: { x: 740, y: 80 }
          },
          {
            id: "node-demo-line-end",
            type: "end",
            label: "End flow",
            config: {},
            position: { x: 960, y: 80 }
          }
        ],
        edges: []
      }
    }
  ];

  for (const flow of demoFlows) {
    await prisma.flow.upsert({
      where: { id: flow.id },
      update: {
        name: flow.name,
        description: flow.description,
        status: flow.status,
        triggerType: flow.triggerType,
        triggerConfigJson: flow.triggerConfigJson,
        conditionsJson: flow.conditionsJson,
        actionsJson: flow.actionsJson,
        createdByUserId: owner.id
      },
      create: {
        id: flow.id,
        tenantId: tenant.id,
        name: flow.name,
        description: flow.description,
        status: flow.status,
        triggerType: flow.triggerType,
        triggerConfigJson: flow.triggerConfigJson,
        conditionsJson: flow.conditionsJson,
        actionsJson: flow.actionsJson,
        createdByUserId: owner.id,
        createdAt: new Date("2026-05-21T04:00:00.000Z")
      }
    });
  }

  const demoFlowRuns = [
    {
      id: "00000000-0000-4000-8000-000000000903",
      flowId: "00000000-0000-4000-8000-000000000901",
      conversationId: "00000000-0000-4000-8000-000000000201",
      status: "dry_run",
      inputJson: {
        conversationId: "00000000-0000-4000-8000-000000000201",
        contactId: "00000000-0000-4000-8000-000000000101",
        message: "อยากทราบราคาแพ็กเกจ",
        platform: "webchat",
        roomId: webchatRoom.id,
        triggerType: "keyword",
        businessHours: true
      },
      outputJson: {
        triggerMatched: true,
        summary: "Seed dry run completed with one skipped outbound action and one simulated tag action.",
        skippedExternalActions: ["send_message"],
        externalCalls: [],
        auditLogsCreated: [],
        actionResults: [
          {
            actionType: "send_message",
            status: "skipped_mock",
            message: "send_message skipped in dry-run mode; no external outbound call was made.",
            metadata: { dryRun: true, externalCalls: 0 }
          },
          {
            actionType: "add_tag",
            status: "success",
            message: "add_tag simulated in dry-run mode.",
            metadata: { dryRun: true, tag: "pricing" }
          }
        ],
        steps: [
          {
            id: "seed-flow-step-1",
            nodeId: "node-demo-pricing-trigger",
            nodeType: "trigger",
            status: "completed",
            input: {},
            output: { matched: true },
            createdAt: "2026-05-21T04:25:00.000Z"
          },
          {
            id: "seed-flow-step-2",
            nodeId: "node-demo-pricing-message",
            nodeType: "send_message",
            status: "skipped",
            input: {},
            output: { status: "skipped_mock", externalCalls: 0 },
            createdAt: "2026-05-21T04:25:01.000Z"
          }
        ]
      }
    },
    {
      id: "00000000-0000-4000-8000-000000000904",
      flowId: "00000000-0000-4000-8000-000000000902",
      conversationId: "00000000-0000-4000-8000-000000000206",
      status: "dry_run",
      inputJson: {
        conversationId: "00000000-0000-4000-8000-000000000206",
        contactId: "00000000-0000-4000-8000-000000000106",
        message: "LINE hot lead",
        platform: "line",
        roomId: "line-oa-main",
        triggerType: "tag_added",
        tag: "hot lead",
        businessHours: true
      },
      outputJson: {
        triggerMatched: true,
        summary: "Seed dry run simulated assignment and note actions only.",
        skippedExternalActions: [],
        externalCalls: [],
        auditLogsCreated: [],
        actionResults: [
          {
            actionType: "assign_agent",
            status: "success",
            message: "assign_agent simulated in dry-run mode.",
            metadata: { dryRun: true }
          },
          {
            actionType: "note",
            status: "success",
            message: "note simulated in dry-run mode.",
            metadata: { dryRun: true }
          }
        ],
        steps: [
          {
            id: "seed-flow-step-3",
            nodeId: "node-demo-line-trigger",
            nodeType: "trigger",
            status: "completed",
            input: {},
            output: { matched: true },
            createdAt: "2026-05-21T04:30:00.000Z"
          },
          {
            id: "seed-flow-step-4",
            nodeId: "node-demo-line-assign",
            nodeType: "assign_agent",
            status: "completed",
            input: {},
            output: { dryRun: true },
            createdAt: "2026-05-21T04:30:01.000Z"
          }
        ]
      }
    }
  ];

  for (const run of demoFlowRuns) {
    await prisma.flowRun.upsert({
      where: { id: run.id },
      update: {
        conversationId: run.conversationId,
        status: run.status,
        inputJson: run.inputJson,
        outputJson: run.outputJson,
        errorMessage: null
      },
      create: {
        id: run.id,
        tenantId: tenant.id,
        flowId: run.flowId,
        conversationId: run.conversationId,
        status: run.status,
        inputJson: run.inputJson,
        outputJson: run.outputJson,
        errorMessage: null,
        createdAt: new Date("2026-05-21T04:30:00.000Z")
      }
    });
  }

  const demoBroadcastSegments = [
    {
      id: "00000000-0000-4000-8000-000000001001",
      name: "API interested web leads",
      description: "Persisted demo segment for webchat leads that asked about packages.",
      rulesJson: {
        rules: [
          { id: "rule-api-web-lead-status", field: "leadStatus", operator: "equals", value: "interested" },
          { id: "rule-api-web-platform", field: "platform", operator: "contains", value: "webchat" }
        ]
      },
      estimatedCount: 1
    },
    {
      id: "00000000-0000-4000-8000-000000001002",
      name: "API LINE follow-up",
      description: "Persisted demo segment for LINE follow-up contacts.",
      rulesJson: {
        rules: [
          { id: "rule-api-line-platform", field: "platform", operator: "contains", value: "line" },
          { id: "rule-api-line-status", field: "leadStatus", operator: "equals", value: "follow_up" }
        ]
      },
      estimatedCount: 1
    }
  ];

  for (const segment of demoBroadcastSegments) {
    await prisma.broadcastSegment.upsert({
      where: { id: segment.id },
      update: {
        name: segment.name,
        description: segment.description,
        rulesJson: segment.rulesJson,
        estimatedCount: segment.estimatedCount
      },
      create: {
        id: segment.id,
        tenantId: tenant.id,
        name: segment.name,
        description: segment.description,
        rulesJson: segment.rulesJson,
        estimatedCount: segment.estimatedCount,
        createdAt: new Date("2026-05-21T04:40:00.000Z")
      }
    });
  }

  const demoBroadcastCampaigns = [
    {
      id: "00000000-0000-4000-8000-000000001011",
      name: "API package follow-up",
      description: "Safe mock-only campaign persisted for API mode.",
      status: "draft",
      channelPlatform: "webchat" as const,
      channelAccountId: channelAccountId("webchat"),
      segmentId: "00000000-0000-4000-8000-000000001001",
      contentJson: {
        message: "Hi {{contact.firstName}}, here is the safe demo package follow-up from {{roomName}}.",
        templateId: "api-package-follow-up",
        safeMockOnly: true
      },
      scheduleAt: null
    },
    {
      id: "00000000-0000-4000-8000-000000001012",
      name: "API LINE appointment reminder",
      description: "Safe scheduled mock campaign for LINE follow-up.",
      status: "scheduled",
      channelPlatform: "line" as const,
      channelAccountId: channelAccountId("line"),
      segmentId: "00000000-0000-4000-8000-000000001002",
      contentJson: {
        message: "สวัสดีคุณ {{contact.firstName}} ทีมงานจะติดตามนัดหมายผ่าน {{roomName}} แบบ safe mock เท่านั้น",
        templateId: "api-line-follow-up",
        safeMockOnly: true
      },
      scheduleAt: new Date("2026-05-23T04:00:00.000Z")
    }
  ];

  for (const campaign of demoBroadcastCampaigns) {
    await prisma.broadcastCampaign.upsert({
      where: { id: campaign.id },
      update: {
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        channelPlatform: campaign.channelPlatform,
        channelAccountId: campaign.channelAccountId,
        segmentId: campaign.segmentId,
        contentJson: campaign.contentJson,
        scheduleAt: campaign.scheduleAt,
        createdByUserId: owner.id
      },
      create: {
        id: campaign.id,
        tenantId: tenant.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        channelPlatform: campaign.channelPlatform,
        channelAccountId: campaign.channelAccountId,
        segmentId: campaign.segmentId,
        contentJson: campaign.contentJson,
        scheduleAt: campaign.scheduleAt,
        createdByUserId: owner.id,
        createdAt: new Date("2026-05-21T04:45:00.000Z")
      }
    });
  }

  const webIdentity = await prisma.contactIdentity.findUniqueOrThrow({
    where: {
      tenantId_platform_channelAccountId_externalUserId: {
        tenantId: tenant.id,
        platform: "webchat",
        channelAccountId: channelAccountId("webchat"),
        externalUserId: "visitor-demo-seed"
      }
    }
  });
  const lineIdentity = await prisma.contactIdentity.findUniqueOrThrow({
    where: {
      tenantId_platform_channelAccountId_externalUserId: {
        tenantId: tenant.id,
        platform: "line",
        channelAccountId: channelAccountId("line"),
        externalUserId: "line-demo-seed"
      }
    }
  });

  const demoBroadcastSendLogs = [
    {
      id: "00000000-0000-4000-8000-000000001021",
      campaignId: "00000000-0000-4000-8000-000000001011",
      contactId: "00000000-0000-4000-8000-000000000101",
      contactIdentityId: webIdentity.id,
      platform: "webchat" as const,
      channelAccountId: channelAccountId("webchat"),
      status: "sent_mock",
      reason: "seed safe mock send only; no external outbound",
      payloadJson: { safeMockOnly: true, externalCalls: 0, seed: true },
      createdAt: new Date("2026-05-21T04:50:00.000Z")
    },
    {
      id: "00000000-0000-4000-8000-000000001022",
      campaignId: "00000000-0000-4000-8000-000000001012",
      contactId: "00000000-0000-4000-8000-000000000106",
      contactIdentityId: lineIdentity.id,
      platform: "line" as const,
      channelAccountId: channelAccountId("line"),
      status: "skipped_mock",
      reason: "seed skipped_mock sample; no external outbound",
      payloadJson: { safeMockOnly: true, externalCalls: 0, seed: true },
      createdAt: new Date("2026-05-21T04:51:00.000Z")
    }
  ];

  for (const log of demoBroadcastSendLogs) {
    await prisma.broadcastSendLog.upsert({
      where: { id: log.id },
      update: {
        contactId: log.contactId,
        contactIdentityId: log.contactIdentityId,
        platform: log.platform,
        channelAccountId: log.channelAccountId,
        status: log.status,
        reason: log.reason,
        payloadJson: log.payloadJson,
        createdAt: log.createdAt
      },
      create: {
        id: log.id,
        tenantId: tenant.id,
        campaignId: log.campaignId,
        contactId: log.contactId,
        contactIdentityId: log.contactIdentityId,
        platform: log.platform,
        channelAccountId: log.channelAccountId,
        status: log.status,
        reason: log.reason,
        payloadJson: log.payloadJson,
        createdAt: log.createdAt
      }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

function channelAccountId(platform: "webchat" | "telegram" | "line" | "facebook" | "instagram") {
  if (platform === "webchat") return "00000000-0000-4000-8000-000000000020";
  if (platform === "telegram") return "00000000-0000-4000-8000-000000000021";
  if (platform === "line") return "00000000-0000-4000-8000-000000000022";
  if (platform === "facebook") return "00000000-0000-4000-8000-000000000023";
  return "00000000-0000-4000-8000-000000000024";
}

async function ensureUser(user: { id: string; email: string; name: string }) {
  const data = { id: user.id, email: user.email, name: user.name };
  const existing = await prisma.user.findFirst({
    where: { OR: [{ id: user.id }, { email: user.email }] }
  });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data
    });
  }
  return prisma.user.create({ data });
}
