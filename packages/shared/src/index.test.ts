import { describe, expect, it } from "vitest";
import {
  applyAiDecisionPolicy,
  aiDecisionSchema,
  agentSchema,
  agentPerformanceMetricSchema,
  aiPerformanceMetricSchema,
  analyticsDateRangeSchema,
  assignmentSchema,
  auditLogSchema,
  broadcastCampaignSchema,
  broadcastDeliveryEventSchema,
  broadcastRecipientSchema,
  broadcastRunSchema,
  broadcastSegmentRuleSchema,
  broadcastSegmentSchema,
  broadcastTemplateSchema,
  cannedReplySchema,
  channelMetricSchema,
  conversationFunnelMetricSchema,
  contactIdentitySchema,
  contactSchema,
  contactTaskSchema,
  contactTaskStatusSchema,
  conversationPrioritySchema,
  coreConversationCardSchema,
  createKnowledgeAwareMockAiDecision,
  createFallbackAiDecision,
  findMatchedKnowledge,
  flowEdgeSchema,
  flowNodeSchema,
  flowRunSchema,
  flowSchema,
  flowTriggerSchema,
  internalNoteSchema,
  knowledgeCategorySchema,
  knowledgeMetricSchema,
  knowledgeItemSchema,
  knowledgeStatusSchema,
  leadStatusSchema,
  metricCardSchema,
  metricTrendSchema,
  normalizedInboundMessageSchema,
  parseAiDecisionWithFallback,
  sampleKnowledgeItems,
  shouldAutoSend,
  shouldHandoff,
  slaPolicySchema,
  slaMetricSchema,
  slaStateSchema,
  updateCustomer360ProfileRequestSchema
} from "./index.js";

describe("shared contracts", () => {
  it("validates normalized inbound messages", () => {
    const parsed = normalizedInboundMessageSchema.parse({
      tenantId: "00000000-0000-4000-8000-000000000001",
      platform: "telegram",
      channelAccountId: "00000000-0000-4000-8000-000000000002",
      externalUserId: "123",
      platformMessageId: "tg-1",
      messageType: "text",
      text: "hello",
      attachments: [],
      timestamp: new Date().toISOString(),
      rawPayload: {}
    });

    expect(parsed.platform).toBe("telegram");
  });

  it("validates structured AI decisions", () => {
    const decision = aiDecisionSchema.parse({
      intent: "pricing",
      sentiment: "neutral",
      priority: "medium",
      confidence: 0.95,
      riskLevel: "low",
      requiresHuman: false,
      nextAction: "auto_reply",
      reply: "ราคาขึ้นอยู่กับแพ็กเกจครับ",
      summary: "Customer asks about pricing.",
      tags: ["pricing"],
      reason: "High confidence pricing FAQ."
    });

    expect(shouldAutoSend(decision, "auto_faq", true)).toBe(true);
  });

  it("falls back to requiresHuman when structured AI validation fails", () => {
    const decision = parseAiDecisionWithFallback({ intent: "bad" }, "bad-json");

    expect(decision.requiresHuman).toBe(true);
    expect(decision.nextAction).toBe("handoff");
    expect(decision.reason).toBe("bad-json");
  });

  it("hands off high-risk fallback decisions", () => {
    expect(shouldHandoff(createFallbackAiDecision())).toBe(true);
  });

  it("forces refund, complaint, and human requests to require a human", () => {
    for (const intent of ["refund", "complaint", "human_request"] as const) {
      const decision = applyAiDecisionPolicy({
        intent,
        sentiment: "neutral",
        priority: "low",
        confidence: 0.95,
        riskLevel: "low",
        requiresHuman: false,
        nextAction: "auto_reply",
        reply: "mock reply",
        summary: "mock summary",
        tags: [],
        reason: "policy test"
      });

      expect(decision.requiresHuman).toBe(true);
      expect(decision.nextAction).toBe("handoff");
    }
  });

  it("hands off confidence below 0.60", () => {
    const decision = applyAiDecisionPolicy({
      intent: "unknown",
      sentiment: "neutral",
      priority: "medium",
      confidence: 0.59,
      riskLevel: "low",
      requiresHuman: false,
      nextAction: "suggest_reply",
      reply: "mock reply",
      summary: "mock summary",
      tags: [],
      reason: "low confidence"
    });

    expect(decision.requiresHuman).toBe(true);
    expect(decision.nextAction).toBe("handoff");
  });

  it("allows high confidence low risk replies under auto mode", () => {
    const decision = applyAiDecisionPolicy({
      intent: "product_info",
      sentiment: "neutral",
      priority: "low",
      confidence: 0.9,
      riskLevel: "low",
      requiresHuman: false,
      nextAction: "auto_reply",
      reply: "mock reply",
      summary: "mock summary",
      tags: [],
      reason: "safe answer"
    });

    expect(decision.requiresHuman).toBe(false);
    expect(shouldAutoSend(decision, "ai_agent", true)).toBe(true);
  });

  it("validates knowledge item schema", () => {
    const parsed = knowledgeItemSchema.parse(sampleKnowledgeItems[0]);

    expect(parsed.id).toBe("kb-business-demo");
    expect(parsed.status).toBe("active");
  });

  it("validates knowledge category and status enums", () => {
    expect(knowledgeCategorySchema.parse("price_rules")).toBe("price_rules");
    expect(knowledgeStatusSchema.parse("archived")).toBe("archived");
    expect(() => knowledgeCategorySchema.parse("secret_docs")).toThrow();
    expect(() => knowledgeStatusSchema.parse("deleted")).toThrow();
  });

  it("validates CRM contact schemas and enums", () => {
    const identity = contactIdentitySchema.parse({
      id: "identity-1",
      contactId: "contact-1",
      platform: "line",
      channelAccountId: "line-oa-main",
      accountName: "LINE OA Main",
      externalUserId: "U123",
      externalConversationId: "U123",
      displayName: "Ploy",
      isPrimary: true,
      lastSeenAt: new Date().toISOString()
    });
    const task = contactTaskSchema.parse({
      id: "task-1",
      contactId: "contact-1",
      title: "Follow up",
      status: "open",
      ownerAgent: "May",
      createdAt: new Date().toISOString()
    });
    const contact = contactSchema.parse({
      id: "contact-1",
      displayName: "Ploy Smile",
      phone: "081-222-3434",
      email: "ploy@example.com",
      leadStatus: "interested",
      ownerAgent: "May",
      tags: ["faq"],
      customFields: { branch: "Siam" },
      identities: [identity],
      notes: [],
      tasks: [task],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    expect(contact.identities[0]?.isPrimary).toBe(true);
    expect(leadStatusSchema.parse("follow_up")).toBe("follow_up");
    expect(contactTaskStatusSchema.parse("done")).toBe("done");
    expect(() => leadStatusSchema.parse("merged")).toThrow();
    expect(() => contactTaskStatusSchema.parse("waiting")).toThrow();
  });

  it("validates safe Customer 360 profile update payloads", () => {
    const parsed = updateCustomer360ProfileRequestSchema.parse({
      contactId: "contact-1",
      displayName: "Ploy Smile",
      email: "ploy@example.com",
      phone: "081-222-3434",
      leadStatus: "qualified",
      tags: ["vip", "sprint41"]
    });

    expect(parsed.tags).toEqual(["vip", "sprint41"]);
    expect(() => updateCustomer360ProfileRequestSchema.parse({
      contactId: "contact-1",
      apiKey: "sk-should-not-be-accepted"
    })).toThrow();
  });

  it("requires contact conversation cards to keep platform account room separation fields", () => {
    const card = coreConversationCardSchema.parse({
      id: "conv-line",
      roomId: "682ba6aa-901c-4617-af0f-78acc601615b",
      tab: "human",
      platform: "line",
      platformLabel: "LINE",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main",
      customerName: "Demo LINE Member",
      customerEmail: "-",
      customerPhone: "-",
      lastMessage: "hello",
      lastMessageAt: "2026-05-21T04:00:00.000Z",
      lastMessageTime: "11:00",
      unreadCount: 1,
      assignedAgent: null,
      tags: [],
      aiStatus: "Need Human",
      priority: "medium",
      status: "open",
      unreplied: true
    });

    expect(card).toMatchObject({
      id: "conv-line",
      roomId: "682ba6aa-901c-4617-af0f-78acc601615b",
      platform: "line",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main"
    });
    expect(() => coreConversationCardSchema.parse({ ...card, channelAccountId: undefined })).toThrow();
  });

  it("validates Sprint 8 admin tools schemas", () => {
    const now = new Date("2026-05-20T10:00:00.000Z").toISOString();
    const agent = agentSchema.parse({
      id: "agent-may",
      name: "May",
      email: "may@example.com",
      role: "agent",
      status: "online",
      avatarUrl: "https://example.com/may.png",
      assignedRoomIds: ["webchat-main"],
      maxActiveConversations: 5,
      activeConversationCount: 2
    });
    const assignment = assignmentSchema.parse({
      id: "assign-1",
      conversationId: "conv-web-01",
      agentId: agent.id,
      assignedBy: "agent-owner",
      assignedAt: now,
      status: "active"
    });
    const slaPolicy = slaPolicySchema.parse({
      id: "sla-high",
      name: "High priority",
      firstResponseMinutes: 10,
      nextResponseMinutes: 15,
      resolutionHours: 4,
      appliesToPriority: "high"
    });
    const slaState = slaStateSchema.parse({
      conversationId: "conv-web-01",
      firstResponseDueAt: now,
      nextResponseDueAt: now,
      resolutionDueAt: now,
      status: "warning",
      breachedReason: "First response due soon"
    });
    const note = internalNoteSchema.parse({
      id: "note-1",
      tenantId: "tenant-demo",
      conversationId: "conv-web-01",
      contactId: "contact-anya",
      customerId: "contact-anya",
      platform: "webchat",
      channelAccountId: "channel-webchat",
      roomId: "room-webchat",
      body: "Pinned team context",
      visibility: "team",
      createdBy: agent.id,
      createdAt: now,
      updatedAt: now,
      pinned: true,
      externalCalls: 0
    });
    const reply = cannedReplySchema.parse({
      id: "reply-price",
      title: "Pricing",
      shortcut: "/price",
      body: "แพ็กเกจเริ่มต้น...",
      tags: ["pricing"],
      category: "sales",
      isActive: true
    });
    const audit = auditLogSchema.parse({
      id: "audit-1",
      actorId: agent.id,
      action: "assign",
      targetType: "conversation",
      targetId: "conv-web-01",
      metadata: { agentId: agent.id },
      createdAt: now
    });

    expect(agent.role).toBe("agent");
    expect(assignment.status).toBe("active");
    expect(slaPolicy.appliesToPriority).toBe("high");
    expect(slaState.status).toBe("warning");
    expect(note.pinned).toBe(true);
    expect(reply.shortcut).toBe("/price");
    expect(audit.action).toBe("assign");
    expect(conversationPrioritySchema.parse("urgent")).toBe("urgent");
  });

  it("validates Sprint 9 analytics schemas and enums", () => {
    expect(analyticsDateRangeSchema.parse("last_7_days")).toBe("last_7_days");
    expect(metricTrendSchema.parse("flat")).toBe("flat");

    expect(metricCardSchema.parse({
      id: "total",
      title: "Total conversations",
      value: 128,
      previousValue: 100,
      changePercent: 28,
      trend: "up",
      unit: "conversations",
      description: "All conversations"
    }).trend).toBe("up");

    expect(channelMetricSchema.parse({
      platform: "line",
      accountName: "LINE OA Main",
      totalConversations: 20,
      newConversations: 5,
      resolvedConversations: 8,
      unresolvedConversations: 12,
      averageFirstResponseMinutes: 4,
      averageResolutionHours: 2,
      aiHandledCount: 12,
      humanHandledCount: 8,
      handoffCount: 3
    }).platform).toBe("line");

    expect(aiPerformanceMetricSchema.parse({
      totalAiRuns: 10,
      autoReplies: 4,
      suggestedReplies: 3,
      handoffs: 3,
      averageConfidence: 0.82,
      lowConfidenceCount: 1,
      markedWrongCount: 1,
      knowledgeSourceUsedCount: 7,
      noKnowledgeMatchCount: 2,
      topIntents: [{ intent: "pricing", count: 4 }],
      topFailureReasons: [{ reason: "low confidence", count: 1 }]
    }).topIntents[0]?.intent).toBe("pricing");

    expect(agentPerformanceMetricSchema.parse({
      agentId: "agent-may",
      agentName: "May",
      assignedCount: 4,
      resolvedCount: 2,
      averageFirstResponseMinutes: 5,
      averageHandleTimeMinutes: 30,
      slaBreachedCount: 1,
      notesCreated: 2,
      cannedRepliesUsed: 3,
      takeoverCount: 1
    }).agentName).toBe("May");

    expect(slaMetricSchema.parse({
      okCount: 5,
      warningCount: 2,
      breachedCount: 1,
      breachRatePercent: 12.5,
      topBreachedRooms: [{ roomId: "webchat-main", roomName: "Main Website", breachedCount: 1 }]
    }).breachedCount).toBe(1);

    expect(knowledgeMetricSchema.parse({
      knowledgeId: "kb-price-package",
      title: "Price",
      category: "price_rules",
      usedCount: 5,
      successfulUseCount: 4,
      markedWrongCount: 1,
      lastUsedAt: new Date().toISOString()
    }).category).toBe("price_rules");

    expect(conversationFunnelMetricSchema.parse({
      new: 1,
      interested: 2,
      qualified: 3,
      quoted: 4,
      won: 5,
      lost: 6,
      follow_up: 7
    }).follow_up).toBe(7);
  });

  it("does not use archived knowledge for matching", () => {
    const archivedOnly = sampleKnowledgeItems.map((item) => ({ ...item, status: "archived" as const }));

    expect(findMatchedKnowledge("ขอราคาแพ็กเกจ", archivedOnly)).toEqual([]);
  });

  it("matches active FAQ and price knowledge with customer questions", () => {
    const faq = findMatchedKnowledge("มีคู่มือ webhook ไหม", sampleKnowledgeItems, { categories: ["faq"] });
    const pricing = createKnowledgeAwareMockAiDecision("ขอราคาแพ็กเกจ Pro", sampleKnowledgeItems);

    expect(faq[0]?.category).toBe("faq");
    expect(pricing.intent).toBe("pricing");
    expect(pricing.matchedKnowledge?.[0]?.title).toContain("ราคา");
  });

  it("forces forbidden answers to require a human", () => {
    const decision = createKnowledgeAwareMockAiDecision("ช่วยยกเลิกบริการและ refund ให้ด้วย", sampleKnowledgeItems);

    expect(decision.requiresHuman).toBe(true);
    expect(decision.nextAction).toBe("handoff");
    expect(decision.matchedKnowledge?.some((item) => item.category === "forbidden_answers")).toBe(true);
  });

  it("returns matched knowledge in AI Test Lab mock results", () => {
    const decision = createKnowledgeAwareMockAiDecision("รองรับ Platform Rooms และ Customer 360 ไหม", sampleKnowledgeItems, { categories: ["product_service"] });

    expect(decision.matchedKnowledge?.length).toBeGreaterThan(0);
    expect(decision.summary).toContain("active knowledge");
  });

  it("validates Sprint 10 flow builder schemas", () => {
    const trigger = flowTriggerSchema.parse({
      id: "trigger-pricing",
      type: "keyword",
      keyword: "ราคา",
      matchMode: "contains",
      caseSensitive: false
    });
    const triggerNode = flowNodeSchema.parse({
      id: "node-trigger",
      type: "trigger",
      label: "Keyword trigger",
      config: {},
      position: { x: 0, y: 0 }
    });
    const actionNode = flowNodeSchema.parse({
      id: "node-message",
      type: "send_message",
      label: "Send package details",
      config: { message: "แพ็กเกจเริ่มต้น" },
      position: { x: 200, y: 0 }
    });
    const edge = flowEdgeSchema.parse({
      id: "edge-1",
      sourceNodeId: triggerNode.id,
      targetNodeId: actionNode.id,
      conditionLabel: "true"
    });
    const flow = flowSchema.parse({
      id: "flow-test",
      name: "Pricing flow",
      description: "Test flow",
      status: "draft",
      triggerType: "keyword",
      trigger,
      roomIds: ["webchat-main"],
      platformScope: ["webchat"],
      nodes: [triggerNode, actionNode],
      edges: [edge],
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const run = flowRunSchema.parse({
      id: "run-test",
      flowId: flow.id,
      conversationId: "conv-web-01",
      contactId: "contact-anya",
      status: "completed",
      startedAt: "2026-05-21T00:00:01.000Z",
      completedAt: "2026-05-21T00:00:02.000Z",
      steps: [{
        id: "step-1",
        nodeId: actionNode.id,
        nodeType: actionNode.type,
        status: "completed",
        input: { message: "ราคา" },
        output: { action: "mock" },
        createdAt: "2026-05-21T00:00:01.000Z"
      }],
      resultSummary: "Completed"
    });

    expect(flow.triggerType).toBe("keyword");
    expect(run.steps[0]?.nodeType).toBe("send_message");
  });

  it("validates Sprint 11 broadcast schemas", () => {
    const campaign = broadcastCampaignSchema.parse({
      id: "camp-test",
      name: "Test campaign",
      description: "Mock only",
      status: "draft",
      platformScope: ["line"],
      roomIds: ["line-oa-main"],
      segmentId: "seg-test",
      templateId: "tmpl-test",
      message: "Hello {{contact.name}}",
      scheduleType: "now",
      createdBy: "Demo Admin",
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const rule = broadcastSegmentRuleSchema.parse({
      id: "rule-test",
      field: "tag",
      operator: "contains",
      value: "pricing"
    });
    const segment = broadcastSegmentSchema.parse({
      id: "seg-test",
      name: "Pricing",
      description: "Pricing contacts",
      rules: [rule],
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const template = broadcastTemplateSchema.parse({
      id: "tmpl-test",
      name: "Pricing reminder",
      category: "sales",
      body: "Hello {{contact.name}}",
      variables: ["contact.name"],
      tags: ["pricing"],
      isActive: true,
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const recipient = broadcastRecipientSchema.parse({
      id: "recipient-test",
      campaignId: campaign.id,
      contactId: "contact-anya",
      identityId: "identity-anya-web",
      platform: "webchat",
      roomId: "webchat-main",
      displayName: "Anya",
      status: "pending",
      renderedMessage: "Hello Anya",
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const run = broadcastRunSchema.parse({
      id: "run-test",
      campaignId: campaign.id,
      status: "completed",
      totalRecipients: 1,
      sentMockCount: 1,
      failedMockCount: 0,
      skippedCount: 0,
      startedAt: "2026-05-21T00:00:00.000Z",
      completedAt: "2026-05-21T00:00:01.000Z",
      summary: "Mock completed"
    });
    const event = broadcastDeliveryEventSchema.parse({
      id: "event-test",
      campaignId: campaign.id,
      recipientId: recipient.id,
      status: "sent_mock",
      message: "local only",
      createdAt: "2026-05-21T00:00:01.000Z"
    });

    expect(segment.rules[0]?.field).toBe("tag");
    expect(template.isActive).toBe(true);
    expect(run.sentMockCount).toBe(1);
    expect(event.status).toBe("sent_mock");
  });
});
