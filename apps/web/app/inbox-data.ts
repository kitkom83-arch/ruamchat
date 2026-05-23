import type { AiSuggestedReply, ConversationFilter, ConversationPriority, ConversationStatus, CoreConversationCard, CoreMessage, CoreRoom, DataMode, KnowledgeCategory, KnowledgeItem, SlaStatus } from "@ai-omni/shared";
import { createKnowledgeAwareMockAiDecision, sampleKnowledgeItems, type AIDecision } from "@ai-omni/shared";
import { getStoredKnowledgeItems, knowledgeStorageKey } from "./ai-knowledge-store";

export type InboxPlatform = "webchat" | "telegram" | "line" | "facebook" | "instagram";
export type InboxTab = "human" | "bot";
export type AiStatus = "AI Off" | "Suggest" | "AI Active" | "Need Human" | "Human Taken" | "Closed";
export type MessageSender = "customer" | "agent" | "ai" | "ai_draft" | "automation" | "system";

export type PlatformRoom = {
  id: string;
  platform: InboxPlatform;
  platformLabel: string;
  accountName: string;
  roomName: string;
  accent: string;
};

export type LinkedIdentity = {
  platform: InboxPlatform;
  accountName: string;
  externalUserId: string;
  displayName: string;
};

export type ChatMessage = {
  id: string;
  sender: MessageSender;
  body: string;
  time: string;
};

export type ConversationCard = {
  id: string;
  roomId: string;
  tab: InboxTab;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  platformLabel: string;
  accountName: string;
  lastMessage: string;
  unreadCount: number;
  assignedAgent: string | null;
  tags: string[];
  aiStatus: AiStatus;
  lastMessageTime: string;
  followUpAt?: string;
  closed?: boolean;
  spam?: boolean;
  priority: ConversationPriority;
  status: ConversationStatus;
  unreplied?: boolean;
  slaDueAt?: string | null;
  slaBreachedAt?: string | null;
  slaStatus?: SlaStatus;
  firstResponseDueAt?: string | null;
  resolutionDueAt?: string | null;
  linkedIdentities: LinkedIdentity[];
  notesPlaceholder: string;
  aiSummary: string;
  aiDecision: string;
  aiAnalysis?: AIDecision;
  aiSuggestionId?: string;
  aiSuggestionGeneratedAt?: string;
  aiSuggestionExternalCalls?: 0;
  intent: string;
  confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  nextAction: string;
  messages: ChatMessage[];
};

export const webchatDemoStorageKey = "ai-omni-webchat-demo-v1";
export const webchatDemoConversationId = "conv-webchat-demo-visitor";

export type WebchatDemoStore = {
  messages: ChatMessage[];
};

export const quickReplies = [
  "สวัสดีครับ สนใจเรื่องไหนครับ",
  "ขอเบอร์ติดต่อกลับได้ไหมครับ",
  "เดี๋ยวแอดมินตรวจสอบให้ครับ"
];

export function getQuickRepliesForMode(mode: DataMode) {
  return mode === "api" ? [] : quickReplies;
}

export const filterOptions: Array<{ id: ConversationFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "my", label: "My Inbox" },
  { id: "unassigned", label: "Unassigned" },
  { id: "sla_warning", label: "SLA Warning" },
  { id: "sla_breached", label: "SLA Breached" },
  { id: "ai_active", label: "AI Active" },
  { id: "need_human", label: "Need Human" },
  { id: "unread", label: "Unread" },
  { id: "unreplied", label: "Unreplied" },
  { id: "follow_up", label: "Follow Up" },
  { id: "closed", label: "Closed" },
  { id: "spam", label: "Spam" }
];

export const platformRooms: PlatformRoom[] = [
  {
    id: "webchat-main",
    platform: "webchat",
    platformLabel: "Webchat",
    accountName: "Main Website",
    roomName: "Main Website",
    accent: "#0d9488"
  },
  {
    id: "telegram-bot-007237",
    platform: "telegram",
    platformLabel: "Telegram",
    accountName: "Bot 007237",
    roomName: "Bot 007237",
    accent: "#2563eb"
  },
  {
    id: "line-oa-main",
    platform: "line",
    platformLabel: "LINE",
    accountName: "LINE OA Main",
    roomName: "LINE OA Main",
    accent: "#16a34a"
  },
  {
    id: "facebook-page-main",
    platform: "facebook",
    platformLabel: "Facebook",
    accountName: "Page หลัก",
    roomName: "Page หลัก",
    accent: "#1d4ed8"
  },
  {
    id: "instagram-shop",
    platform: "instagram",
    platformLabel: "Instagram",
    accountName: "IG ร้านค้า",
    roomName: "IG ร้านค้า",
    accent: "#db2777"
  }
];

export const mockConversations: ConversationCard[] = [
  {
    id: "conv-web-01",
    roomId: "webchat-main",
    tab: "human",
    customerName: "Anya Prom",
    customerEmail: "anya@example.com",
    customerPhone: "089-111-2222",
    platformLabel: "Webchat",
    accountName: "Main Website",
    lastMessage: "อยากเทียบแพ็กเกจ Pro กับ Business ก่อนตัดสินใจ",
    unreadCount: 3,
    assignedAgent: "May",
    tags: ["pricing", "hot lead"],
    aiStatus: "Need Human",
    lastMessageTime: "09:42",
    followUpAt: "Today 15:00",
    priority: "high",
    status: "open",
    unreplied: true,
    linkedIdentities: [
      { platform: "webchat", accountName: "Main Website", externalUserId: "visitor-8871", displayName: "Anya" },
      { platform: "line", accountName: "LINE OA Main", externalUserId: "U-7712", displayName: "Anya P." }
    ],
    notesPlaceholder: "เพิ่มโน้ตภายในสำหรับทีมขายหรือ support",
    aiSummary: "ลูกค้าสนใจแผนรายเดือนและถามเงื่อนไขย้ายข้อมูลจากระบบเดิม",
    aiDecision: "ส่งให้คนดูแล เพราะเป็น lead มูลค่าสูงและถามเงื่อนไขเชิงพาณิชย์",
    intent: "Compare plans",
    confidence: 0.78,
    riskLevel: "Medium",
    nextAction: "Take over and send tailored pricing",
    messages: [
      { id: "m-web-1", sender: "customer", body: "อยากเทียบแพ็กเกจ Pro กับ Business ก่อนตัดสินใจ", time: "09:42" },
      { id: "m-web-2", sender: "ai", body: "สรุปความต่างหลักไว้แล้ว แต่ควรให้ agent ยืนยันส่วนลดและ SLA", time: "09:43" }
    ]
  },
  {
    id: "conv-web-02",
    roomId: "webchat-main",
    tab: "bot",
    customerName: "Narin Tech",
    customerEmail: "ops@narin.example",
    customerPhone: "02-441-9000",
    platformLabel: "Webchat",
    accountName: "Main Website",
    lastMessage: "มีคู่มือเชื่อม webhook ไหม",
    unreadCount: 0,
    assignedAgent: null,
    tags: ["docs", "developer"],
    aiStatus: "AI Active",
    lastMessageTime: "09:10",
    priority: "medium",
    status: "open",
    linkedIdentities: [
      { platform: "webchat", accountName: "Main Website", externalUserId: "visitor-0098", displayName: "Narin Ops" }
    ],
    notesPlaceholder: "ยังไม่มี internal note",
    aiSummary: "ลูกค้าขอเอกสาร webhook และกำลังตอบโดย bot จาก FAQ",
    aiDecision: "ตอบอัตโนมัติด้วยลิงก์เอกสารและถาม platform ที่ต้องการเชื่อมต่อ",
    intent: "Webhook docs",
    confidence: 0.92,
    riskLevel: "Low",
    nextAction: "Auto reply with documentation",
    messages: [
      { id: "m-web-3", sender: "customer", body: "มีคู่มือเชื่อม webhook ไหม", time: "09:10" },
      { id: "m-web-4", sender: "ai", body: "มีครับ ผมส่งหัวข้อ webhook setup และตัวอย่าง payload ให้ได้", time: "09:10" }
    ]
  },
  {
    id: "conv-telegram-01",
    roomId: "telegram-bot-007237",
    tab: "human",
    customerName: "Krit Market",
    customerEmail: "krit@example.com",
    customerPhone: "086-447-1111",
    platformLabel: "Telegram",
    accountName: "Bot 007237",
    lastMessage: "บอทตอบเรื่องใบเสนอราคาผิด ช่วยดูให้หน่อย",
    unreadCount: 1,
    assignedAgent: null,
    tags: ["quote", "need review"],
    aiStatus: "Human Taken",
    lastMessageTime: "08:58",
    priority: "urgent",
    status: "open",
    unreplied: true,
    linkedIdentities: [
      { platform: "telegram", accountName: "Bot 007237", externalUserId: "tg-55201", displayName: "Krit" },
      { platform: "facebook", accountName: "Page หลัก", externalUserId: "fb-901", displayName: "Krit Market" }
    ],
    notesPlaceholder: "ตรวจ quote template ก่อนตอบกลับ",
    aiSummary: "มีความเสี่ยงจากข้อมูลใบเสนอราคาผิด ต้องให้ agent ตรวจคำตอบ",
    aiDecision: "หยุด bot และให้คนรับช่วง",
    intent: "Quote correction",
    confidence: 0.64,
    riskLevel: "High",
    nextAction: "Review transcript and correct quote",
    messages: [
      { id: "m-tg-1", sender: "customer", body: "บอทตอบเรื่องใบเสนอราคาผิด ช่วยดูให้หน่อย", time: "08:58" },
      { id: "m-tg-2", sender: "system", body: "AI paused after pricing risk detected", time: "08:59" }
    ]
  },
  {
    id: "conv-line-01",
    roomId: "line-oa-main",
    tab: "bot",
    customerName: "Ploy Smile",
    customerEmail: "ploy@example.com",
    customerPhone: "081-222-3434",
    platformLabel: "LINE",
    accountName: "LINE OA Main",
    lastMessage: "ขอเวลาทำการของสาขาสยาม",
    unreadCount: 0,
    assignedAgent: null,
    tags: ["faq", "branch"],
    aiStatus: "Suggest",
    lastMessageTime: "08:20",
    priority: "low",
    status: "pending",
    linkedIdentities: [
      { platform: "line", accountName: "LINE OA Main", externalUserId: "U-2219", displayName: "Ploy" },
      { platform: "instagram", accountName: "IG ร้านค้า", externalUserId: "ig-ploy", displayName: "@ploysmile" }
    ],
    notesPlaceholder: "ยังไม่มี internal note",
    aiSummary: "คำถาม FAQ ปกติ สามารถให้ AI draft แล้ว agent ตรวจได้",
    aiDecision: "ร่างคำตอบเวลาทำการและแนบแผนที่",
    intent: "Store hours",
    confidence: 0.88,
    riskLevel: "Low",
    nextAction: "Suggest reply",
    messages: [
      { id: "m-line-1", sender: "customer", body: "ขอเวลาทำการของสาขาสยาม", time: "08:20" },
      { id: "m-line-2", sender: "ai", body: "ร่างคำตอบ: สาขาสยามเปิดทุกวัน 10:00-21:00 น.", time: "08:21" }
    ]
  },
  {
    id: "conv-facebook-01",
    roomId: "facebook-page-main",
    tab: "human",
    customerName: "June Studio",
    customerEmail: "june@example.com",
    customerPhone: "084-555-7878",
    platformLabel: "Facebook",
    accountName: "Page หลัก",
    lastMessage: "ขอปิดเคสก่อน เดี๋ยวติดต่อใหม่",
    unreadCount: 0,
    assignedAgent: "Ton",
    tags: ["closed", "low priority"],
    aiStatus: "Closed",
    lastMessageTime: "Yesterday",
    closed: true,
    priority: "low",
    status: "closed",
    linkedIdentities: [
      { platform: "facebook", accountName: "Page หลัก", externalUserId: "fb-381", displayName: "June Studio" }
    ],
    notesPlaceholder: "ลูกค้าจะกลับมาใหม่เดือนหน้า",
    aiSummary: "เคสจบแล้ว ไม่มี action ต่อ",
    aiDecision: "ปิด conversation และเก็บประวัติไว้ใน Customer 360",
    intent: "Close request",
    confidence: 0.97,
    riskLevel: "Low",
    nextAction: "No action",
    messages: [
      { id: "m-fb-1", sender: "customer", body: "ขอปิดเคสก่อน เดี๋ยวติดต่อใหม่", time: "Yesterday" },
      { id: "m-fb-2", sender: "agent", body: "รับทราบครับ ปิดเคสไว้ก่อนและกลับมาคุยต่อได้เสมอ", time: "Yesterday" }
    ]
  },
  {
    id: "conv-instagram-01",
    roomId: "instagram-shop",
    tab: "human",
    customerName: "Mint Boutique",
    customerEmail: "mint@example.com",
    customerPhone: "088-994-1200",
    platformLabel: "Instagram",
    accountName: "IG ร้านค้า",
    lastMessage: "ส่งรูปสินค้าใน DM แล้ว อยากได้ราคา wholesale",
    unreadCount: 5,
    assignedAgent: null,
    tags: ["wholesale", "dm"],
    aiStatus: "AI Off",
    lastMessageTime: "07:44",
    spam: true,
    priority: "medium",
    status: "spam",
    unreplied: true,
    linkedIdentities: [
      { platform: "instagram", accountName: "IG ร้านค้า", externalUserId: "ig-mint", displayName: "@mintboutique" },
      { platform: "line", accountName: "LINE OA Main", externalUserId: "U-9081", displayName: "Mint" }
    ],
    notesPlaceholder: "รอตรวจว่าเป็น wholesale จริงหรือ spam",
    aiSummary: "ลูกค้าส่งรูปสินค้าและถามราคาแบบ wholesale แต่บัญชีมีสัญญาณ spam",
    aiDecision: "ไม่ให้ AI ตอบอัตโนมัติจนกว่า agent ยืนยัน",
    intent: "Wholesale inquiry",
    confidence: 0.58,
    riskLevel: "Medium",
    nextAction: "Verify customer and classify",
    messages: [
      { id: "m-ig-1", sender: "customer", body: "ส่งรูปสินค้าใน DM แล้ว อยากได้ราคา wholesale", time: "07:44" },
      { id: "m-ig-2", sender: "system", body: "AI disabled for this room policy", time: "07:45" }
    ]
  }
];

export function getRoomConversationCount(roomId: string, conversations = mockConversations) {
  return conversations.filter((conversation) => conversation.roomId === roomId).length;
}

export function filterConversations(
  conversations: ConversationCard[],
  roomId: string,
  filter: ConversationFilter,
  tab: InboxTab
) {
  return conversations.filter((conversation) => {
    if (conversation.roomId !== roomId || conversation.tab !== tab) return false;

    switch (filter) {
      case "all":
        return true;
      case "my":
        return conversation.assignedAgent === "May";
      case "unassigned":
        return conversation.assignedAgent === null;
      case "sla_warning":
      case "sla_breached":
        return true;
      case "ai_active":
        return conversation.aiStatus === "AI Active";
      case "need_human":
        return conversation.aiStatus === "Need Human" || conversation.aiStatus === "Human Taken";
      case "unread":
        return conversation.unreadCount > 0;
      case "unreplied":
        return Boolean(conversation.unreplied);
      case "follow_up":
        return conversation.status === "follow_up" || Boolean(conversation.followUpAt);
      case "closed":
        return ["resolved", "closed"].includes(conversation.status) || conversation.aiStatus === "Closed" || Boolean(conversation.closed);
      case "spam":
        return conversation.status === "spam" || Boolean(conversation.spam);
      default:
        return true;
    }
  });
}

export function createChatMessage(sender: MessageSender, body: string, date = new Date()): ChatMessage {
  return {
    id: `${sender}-${date.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    body,
    time: formatMessageTime(date)
  };
}

export function buildWebchatDemoConversation(messages: ChatMessage[], knowledgeItems: KnowledgeItem[] = sampleKnowledgeItems): ConversationCard | null {
  if (messages.length === 0) return null;

  const lastMessage = messages[messages.length - 1];
  const latestCustomerText = [...messages].reverse().find((message) => message.sender === "customer")?.body ?? "";
  const aiAnalysis = createKnowledgeAwareMockAiDecision(latestCustomerText, knowledgeItems);
  const unreadCount = messages.filter((message) => message.sender === "customer").length;

  return {
    id: webchatDemoConversationId,
    roomId: "webchat-main",
    tab: "human",
    customerName: "Visitor Demo",
    customerEmail: "visitor.demo@example.local",
    customerPhone: "Demo visitor",
    platformLabel: "Webchat",
    accountName: "Main Website",
    lastMessage: lastMessage.body,
    unreadCount,
    assignedAgent: "Demo Admin",
    tags: ["demo", "webchat"],
    aiStatus: aiAnalysis.requiresHuman ? "Need Human" : "Suggest",
    lastMessageTime: lastMessage.time,
    priority: aiAnalysis.priority,
    status: "open",
    unreplied: lastMessage.sender === "customer",
    linkedIdentities: [
      { platform: "webchat", accountName: "Main Website", externalUserId: "visitor-demo", displayName: "Visitor Demo" }
    ],
    notesPlaceholder: "Demo mode conversation synced through browser storage.",
    aiSummary: aiAnalysis.summary,
    aiDecision: aiAnalysis.reason,
    aiAnalysis,
    intent: aiAnalysis.intent,
    confidence: aiAnalysis.confidence,
    riskLevel: titleCase(aiAnalysis.riskLevel),
    nextAction: aiAnalysis.nextAction,
    messages
  };
}

export function applyAiSuggestionToConversation(conversation: ConversationCard, suggestion: AiSuggestedReply): ConversationCard {
  const aiAnalysis: AIDecision = {
    intent: suggestion.intent,
    sentiment: "neutral",
    priority: conversation.priority,
    confidence: suggestion.confidence,
    riskLevel: suggestion.riskLevel,
    requiresHuman: suggestion.requiresHuman,
    nextAction: suggestion.nextAction,
    reply: suggestion.suggestedReply,
    summary: suggestion.summary,
    tags: conversation.tags,
    reason: suggestion.error ?? "Generated by backend safe AI suggestion API.",
    matchedKnowledge: suggestion.sources.map((source) => ({
      id: source.id,
      title: source.title,
      category: normalizeKnowledgeCategory(source.category),
      matchReason: source.matchReason
    }))
  };

  return {
    ...conversation,
    aiSummary: suggestion.summary,
    aiDecision: aiAnalysis.reason,
    aiAnalysis,
    aiSuggestionId: suggestion.suggestionId,
    aiSuggestionGeneratedAt: suggestion.generatedAt,
    aiSuggestionExternalCalls: suggestion.externalCalls,
    intent: suggestion.intent,
    confidence: suggestion.confidence,
    riskLevel: titleCase(suggestion.riskLevel),
    nextAction: suggestion.nextAction
  };
}

export function mapApiRoomToPlatformRoom(room: CoreRoom): PlatformRoom {
  return {
    id: room.id,
    platform: room.platform,
    platformLabel: room.platformLabel,
    accountName: room.accountName,
    roomName: room.roomName,
    accent: room.accent
  };
}

export function scopeApiConversationsToRoom(conversations: ConversationCard[], roomId: string) {
  return conversations.filter((conversation) => conversation.roomId === roomId);
}

export function mapApiConversationToCard(conversation: CoreConversationCard, messages: ChatMessage[] = []): ConversationCard {
  return {
    id: conversation.id,
    roomId: conversation.roomId,
    tab: conversation.tab,
    customerName: conversation.customerName,
    customerEmail: conversation.customerEmail || "-",
    customerPhone: conversation.customerPhone || "-",
    platformLabel: conversation.platformLabel,
    accountName: conversation.accountName,
    lastMessage: conversation.lastMessage || "-",
    unreadCount: conversation.unreadCount,
    assignedAgent: conversation.assignedAgent,
    tags: conversation.tags,
    aiStatus: conversation.aiStatus,
    lastMessageTime: conversation.lastMessageTime,
    followUpAt: conversation.followUpAt,
    slaDueAt: conversation.slaDueAt,
    slaBreachedAt: conversation.slaBreachedAt,
    slaStatus: conversation.slaStatus,
    firstResponseDueAt: conversation.firstResponseDueAt,
    resolutionDueAt: conversation.resolutionDueAt,
    closed: conversation.status === "closed",
    spam: conversation.status === "spam",
    priority: conversation.priority,
    status: conversation.status,
    unreplied: conversation.unreplied,
    linkedIdentities: [
      {
        platform: conversation.platform,
        accountName: conversation.accountName,
        externalUserId: conversation.id,
        displayName: conversation.customerName
      }
    ],
    notesPlaceholder: "API mode conversation. Internal notes and tasks persist through the backend.",
    aiSummary: "API mode core conversation with persisted operational workflow state.",
    aiDecision: "AI decision metadata is not persisted in Sprint 15.",
    intent: "-",
    confidence: 0,
    riskLevel: "Low",
    nextAction: "-",
    messages
  };
}

export function mapApiMessageToChatMessage(message: CoreMessage): ChatMessage {
  return {
    id: message.id,
    sender: message.senderType === "customer" ? "customer" : message.senderType,
    body: message.text || "-",
    time: formatMessageTime(new Date(message.createdAt))
  };
}

export function applyApiSentMessagesToConversation(
  conversations: ConversationCard[],
  conversationId: string,
  apiMessages: CoreMessage[],
  sentText: string,
  date = new Date()
) {
  const mappedMessages = apiMessages.map(mapApiMessageToChatMessage);
  return conversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          lastMessage: sentText,
          lastMessageTime: formatMessageTime(date),
          unreadCount: 0,
          unreplied: false,
          messages: mappedMessages
        }
      : conversation
  );
}

export function applyLocalAgentMessageToConversation(
  conversations: ConversationCard[],
  conversationId: string,
  text: string,
  date = new Date()
) {
  const message = createChatMessage("agent", text, date);
  return {
    message,
    conversations: conversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            lastMessage: text,
            lastMessageTime: message.time,
            unreadCount: 0,
            unreplied: false,
            messages: [...conversation.messages, message]
          }
        : conversation
    )
  };
}

export function mergeDemoConversation(baseConversations: ConversationCard[], messages: ChatMessage[], knowledgeItems: KnowledgeItem[] = sampleKnowledgeItems) {
  const withoutDemo = baseConversations.filter((conversation) => conversation.id !== webchatDemoConversationId);
  const demoConversation = buildWebchatDemoConversation(messages, knowledgeItems);
  return demoConversation ? [demoConversation, ...withoutDemo] : withoutDemo;
}

export function getAiDraftText(conversation: ConversationCard | null) {
  return conversation?.aiAnalysis?.reply ?? conversation?.nextAction ?? "";
}

export function getAiPanelMockActionStatus(action: "view_source" | "copy_suggested_reply" | "use_ai_draft" | "mark_wrong", conversation: ConversationCard | null) {
  if (!conversation) return "No conversation selected";
  if (action === "view_source") {
    const firstSource = conversation.aiAnalysis?.matchedKnowledge?.[0];
    return firstSource ? `Viewing source: ${firstSource.title}` : "No matched knowledge source";
  }
  if (action === "copy_suggested_reply") return "Suggested reply copied";
  if (action === "use_ai_draft") return "AI draft copied to composer";
  return "Marked as wrong for AI review queue";
}

export function getStoredDemoMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(webchatDemoStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WebchatDemoStore;
    return Array.isArray(parsed.messages) ? parsed.messages.filter(isChatMessage) : [];
  } catch {
    return [];
  }
}

export function saveStoredDemoMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;

  const store: WebchatDemoStore = { messages };
  window.localStorage.setItem(webchatDemoStorageKey, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(webchatDemoStorageKey, { detail: store }));
}

export function appendStoredDemoMessage(sender: MessageSender, body: string, date = new Date()) {
  const message = createChatMessage(sender, body, date);
  saveStoredDemoMessages([...getStoredDemoMessages(), message]);
  return message;
}

export function subscribeStoredDemoMessages(callback: (messages: ChatMessage[]) => void) {
  if (typeof window === "undefined") return () => {};

  const notify = () => callback(getStoredDemoMessages());
  const handleStorage = (event: StorageEvent) => {
    if (event.key === webchatDemoStorageKey) notify();
  };
  const handleCustom = () => notify();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(webchatDemoStorageKey, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(webchatDemoStorageKey, handleCustom);
  };
}

export function subscribeDemoConversationInputs(callback: (messages: ChatMessage[], knowledgeItems: KnowledgeItem[]) => void) {
  if (typeof window === "undefined") return () => {};

  const notify = () => callback(getStoredDemoMessages(), getStoredKnowledgeItems());
  const handleDemoStorage = (event: StorageEvent) => {
    if (event.key === webchatDemoStorageKey || event.key === knowledgeStorageKey) notify();
  };
  const handleCustom = () => notify();

  window.addEventListener("storage", handleDemoStorage);
  window.addEventListener(webchatDemoStorageKey, handleCustom);
  window.addEventListener(knowledgeStorageKey, handleCustom);

  return () => {
    window.removeEventListener("storage", handleDemoStorage);
    window.removeEventListener(webchatDemoStorageKey, handleCustom);
    window.removeEventListener(knowledgeStorageKey, handleCustom);
  };
}

export function formatMessageTime(date: Date) {
  return new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ChatMessage>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.body === "string" &&
    typeof candidate.time === "string" &&
    ["customer", "agent", "ai", "ai_draft", "automation", "system"].includes(String(candidate.sender))
  );
}

function titleCase<T extends string>(value: T) {
  return (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<T>;
}

function normalizeKnowledgeCategory(category: string): KnowledgeCategory {
  const allowed = [
    "business_info",
    "faq",
    "product_service",
    "price_rules",
    "sales_script",
    "support_policy",
    "forbidden_answers",
    "ai_persona"
  ] as const;
  return (allowed as readonly string[]).includes(category) ? category as KnowledgeCategory : "faq";
}
