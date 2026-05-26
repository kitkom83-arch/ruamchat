import type { Contact, ContactIdentity, LeadStatus, Platform } from "@ai-omni/shared";
import type { ConversationCard } from "./inbox-data";
import { mockConversations } from "./inbox-data";

export const crmStorageKey = "ai-omni-crm-demo-v1";

export type MergeSuggestion = {
  id: string;
  sourceIdentityId: string;
  suggestedContactId: string;
  reason: string;
  confidence: number;
  ignored?: boolean;
};

export const leadStatusOptions: LeadStatus[] = ["new", "interested", "qualified", "quoted", "won", "lost", "follow_up"];

const now = "2026-05-21T00:00:00.000Z";

export const mockContacts: Contact[] = [
  {
    id: "contact-anya",
    displayName: "Anya Prom",
    phone: "089-111-2222",
    email: "anya@example.com",
    leadStatus: "qualified",
    ownerAgent: "May",
    tags: ["pricing", "hot lead"],
    customFields: { company: "Anya Retail", plan: "Business" },
    identities: [
      identity("identity-anya-web", "contact-anya", "webchat", "webchat-main", "Main Website", "visitor-8871", "session-8871", "Anya", true, "2026-05-21T09:42:00.000Z")
    ],
    notes: [{ id: "note-anya-1", contactId: "contact-anya", body: "สนใจ Business SLA และต้องการเทียบราคา", createdBy: "May", createdAt: now }],
    tasks: [{ id: "task-anya-1", contactId: "contact-anya", title: "ส่งใบเสนอราคา Business", status: "open", dueAt: "2026-05-22T10:00:00.000Z", ownerAgent: "May", createdAt: now }],
    optOutBroadcast: false,
    doNotContact: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "contact-ploy",
    displayName: "Ploy Smile",
    phone: "081-222-3434",
    email: "ploy@example.com",
    leadStatus: "interested",
    ownerAgent: "Nok",
    tags: ["faq", "branch"],
    customFields: { preferredBranch: "Siam" },
    identities: [
      identity("identity-ploy-line", "contact-ploy", "line", "line-oa-main", "LINE OA Main", "U-2219", "U-2219", "Ploy", true, "2026-05-21T08:20:00.000Z")
    ],
    notes: [{ id: "note-ploy-1", contactId: "contact-ploy", body: "ถามเวลาทำการสาขาสยาม", createdBy: "Nok", createdAt: now }],
    tasks: [],
    optOutBroadcast: false,
    doNotContact: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "contact-june",
    displayName: "June Studio",
    phone: "084-555-7878",
    email: "june@example.com",
    leadStatus: "lost",
    ownerAgent: "Ton",
    tags: ["closed", "low priority"],
    customFields: { segment: "studio" },
    identities: [
      identity("identity-june-facebook", "contact-june", "facebook", "facebook-page-main", "Page หลัก", "fb-381", "fb-381", "June Studio", true, "2026-05-20T07:00:00.000Z"),
      identity("identity-june-instagram", "contact-june", "instagram", "instagram-shop", "IG ร้านค้า", "ig-june", "ig-june", "@junestudio", false, "2026-05-20T07:12:00.000Z")
    ],
    notes: [{ id: "note-june-1", contactId: "contact-june", body: "ลูกค้าขอปิดเคสและอาจกลับมาใหม่เดือนหน้า", createdBy: "Ton", createdAt: now }],
    tasks: [{ id: "task-june-1", contactId: "contact-june", title: "ติดตามใหม่เดือนหน้า", status: "open", ownerAgent: "Ton", createdAt: now }],
    optOutBroadcast: false,
    doNotContact: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "contact-krit",
    displayName: "Krit Market",
    phone: "086-447-1111",
    email: "krit@example.com",
    leadStatus: "quoted",
    ownerAgent: "May",
    tags: ["quote", "need review"],
    customFields: { company: "Krit Market" },
    identities: [
      identity("identity-krit-telegram", "contact-krit", "telegram", "telegram-bot-007237", "Bot 007237", "tg-55201", "tg-55201", "Krit", true, "2026-05-21T08:58:00.000Z"),
      identity("identity-krit-facebook", "contact-krit", "facebook", "facebook-page-main", "Page หลัก", "fb-901", "fb-901", "Krit Market", false, "2026-05-20T12:00:00.000Z")
    ],
    notes: [{ id: "note-krit-1", contactId: "contact-krit", body: "ตรวจ quote template ก่อนตอบกลับ", createdBy: "May", createdAt: now }],
    tasks: [{ id: "task-krit-1", contactId: "contact-krit", title: "แก้ใบเสนอราคาและตอบ Telegram", status: "open", ownerAgent: "May", createdAt: now }],
    optOutBroadcast: false,
    doNotContact: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "contact-mint",
    displayName: "Mint Boutique",
    phone: "088-994-1200",
    email: "mint@example.com",
    leadStatus: "follow_up",
    ownerAgent: "Pim",
    tags: ["wholesale", "dm"],
    customFields: { segment: "wholesale" },
    identities: [
      identity("identity-mint-instagram", "contact-mint", "instagram", "instagram-shop", "IG ร้านค้า", "ig-mint", "ig-mint", "@mintboutique", true, "2026-05-21T07:44:00.000Z"),
      identity("identity-mint-line", "contact-mint", "line", "line-oa-main", "LINE OA Main", "U-9081", "U-9081", "Mint", false, "2026-05-20T13:10:00.000Z")
    ],
    notes: [{ id: "note-mint-1", contactId: "contact-mint", body: "รอตรวจว่าเป็น wholesale จริงหรือ spam", createdBy: "Pim", createdAt: now }],
    tasks: [{ id: "task-mint-1", contactId: "contact-mint", title: "ขอจำนวนสั่งซื้อและเสนอราคา wholesale", status: "open", ownerAgent: "Pim", createdAt: now }],
    optOutBroadcast: true,
    doNotContact: false,
    suppressedReason: "Customer requested no promotional messages in mock CRM",
    createdAt: now,
    updatedAt: now
  }
];

function identity(
  id: string,
  contactId: string,
  platform: Platform,
  channelAccountId: string,
  accountName: string,
  externalUserId: string,
  externalConversationId: string,
  displayName: string,
  isPrimary: boolean,
  lastSeenAt: string
): ContactIdentity {
  return { id, contactId, platform, channelAccountId, accountName, externalUserId, externalConversationId, displayName, isPrimary, lastSeenAt };
}

export function getStoredContacts(): Contact[] {
  if (typeof window === "undefined") return mockContacts;
  try {
    const raw = window.localStorage.getItem(crmStorageKey);
    if (!raw) return mockContacts;
    const parsed = JSON.parse(raw) as { contacts?: Contact[] };
    return Array.isArray(parsed.contacts) ? parsed.contacts : mockContacts;
  } catch {
    return mockContacts;
  }
}

export function saveStoredContacts(contacts: Contact[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(crmStorageKey, JSON.stringify({ contacts }));
  window.dispatchEvent(new CustomEvent(crmStorageKey, { detail: { contacts } }));
}

export function subscribeContacts(callback: (contacts: Contact[]) => void) {
  if (typeof window === "undefined") return () => {};
  const notify = () => callback(getStoredContacts());
  const handleStorage = (event: StorageEvent) => {
    if (event.key === crmStorageKey) notify();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(crmStorageKey, notify);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(crmStorageKey, notify);
  };
}

export function findContactForConversation(contacts: Contact[], conversation: ConversationCard | null) {
  if (!conversation) return null;
  return contacts.find((contact) =>
    contact.identities.some((identity) =>
      conversation.linkedIdentities.some((linked) =>
        linked.platform === identity.platform &&
        linked.accountName === identity.accountName &&
        linked.externalUserId === identity.externalUserId
      )
    )
  ) ?? null;
}

export function getContactConversations(contact: Contact, conversations: ConversationCard[] = mockConversations) {
  return conversations.filter((conversation) =>
    contact.identities.some((identity) =>
      conversation.linkedIdentities.some((linked) =>
        linked.platform === identity.platform &&
        linked.accountName === identity.accountName &&
        linked.externalUserId === identity.externalUserId
      )
    )
  );
}

export function filterContacts(
  contacts: Contact[],
  filters: { search?: string; platform?: string; leadStatus?: string; ownerAgent?: string; tag?: string }
) {
  const search = filters.search?.trim().toLowerCase();
  return contacts.filter((contact) => {
    const haystack = [
      contact.displayName,
      contact.phone,
      contact.email,
      contact.ownerAgent,
      contact.leadStatus,
      contact.tags.join(" "),
      contact.identities.map((identity) => `${identity.platform} ${identity.displayName} ${identity.externalUserId} ${identity.accountName}`).join(" ")
    ].filter(Boolean).join(" ").toLowerCase();
    if (search && !haystack.includes(search)) return false;
    if (filters.platform && filters.platform !== "all" && !contact.identities.some((identity) => identity.platform === filters.platform)) return false;
    if (filters.leadStatus && filters.leadStatus !== "all" && contact.leadStatus !== filters.leadStatus) return false;
    if (filters.ownerAgent && filters.ownerAgent !== "all" && contact.ownerAgent !== filters.ownerAgent) return false;
    if (filters.tag && filters.tag !== "all" && !contact.tags.includes(filters.tag)) return false;
    return true;
  });
}

export function addContactNote(contacts: Contact[], contactId: string, body: string, createdBy = "Demo Admin"): Contact[] {
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    notes: [{ id: `note-${Date.now()}`, contactId, body, createdBy, createdAt: new Date().toISOString() }, ...contact.notes],
    updatedAt: new Date().toISOString()
  } : contact);
}

export function createContactTask(contacts: Contact[], contactId: string, title: string, ownerAgent = "Demo Admin"): Contact[] {
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    tasks: [{ id: `task-${Date.now()}`, contactId, title, status: "open" as const, ownerAgent, createdAt: new Date().toISOString() }, ...contact.tasks],
    updatedAt: new Date().toISOString()
  } : contact);
}

export function markContactTaskDone(contacts: Contact[], contactId: string, taskId: string): Contact[] {
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    tasks: contact.tasks.map((task) => task.id === taskId ? { ...task, status: "done" as const } : task),
    updatedAt: new Date().toISOString()
  } : contact);
}

export function updateContactLeadStatus(contacts: Contact[], contactId: string, leadStatus: LeadStatus): Contact[] {
  return contacts.map((contact) => contact.id === contactId ? { ...contact, leadStatus, updatedAt: new Date().toISOString() } : contact);
}

export function addContactTag(contacts: Contact[], contactId: string, tag: string): Contact[] {
  const clean = tag.trim();
  if (!clean) return contacts;
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    tags: Array.from(new Set([...contact.tags, clean])),
    updatedAt: new Date().toISOString()
  } : contact);
}

export function removeContactTag(contacts: Contact[], contactId: string, tag: string): Contact[] {
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    tags: contact.tags.filter((item) => item !== tag),
    updatedAt: new Date().toISOString()
  } : contact);
}

export function setPrimaryIdentity(contacts: Contact[], contactId: string, identityId: string): Contact[] {
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    identities: contact.identities.map((identity) => ({ ...identity, isPrimary: identity.id === identityId })),
    updatedAt: new Date().toISOString()
  } : contact);
}

export function unlinkIdentity(contacts: Contact[], contactId: string, identityId: string): Contact[] {
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    identities: contact.identities.filter((identity) => identity.id !== identityId),
    updatedAt: new Date().toISOString()
  } : contact);
}

export function linkIdentityToContact(contacts: Contact[], contactId: string, identity: ContactIdentity): Contact[] {
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    identities: contact.identities.some((item) =>
      item.id === identity.id ||
      (item.platform === identity.platform && item.accountName === identity.accountName && item.externalUserId === identity.externalUserId)
    )
      ? contact.identities
      : [...contact.identities, { ...identity, contactId, isPrimary: contact.identities.length === 0 }],
    updatedAt: new Date().toISOString()
  } : contact);
}

export function createContactFromIdentity(contacts: Contact[], identity: ContactIdentity) {
  const contactId = `contact-${identity.id}`;
  const contact: Contact = {
    id: contactId,
    displayName: identity.displayName,
    leadStatus: "new",
    ownerAgent: "Demo Admin",
    tags: ["new-contact"],
    customFields: {},
    identities: [{ ...identity, contactId, isPrimary: true }],
    notes: [],
    tasks: [],
    optOutBroadcast: false,
    doNotContact: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return [contact, ...contacts];
}

export function createIdentityFromConversation(conversation: ConversationCard): ContactIdentity {
  const linked = conversation.linkedIdentities[0];
  return {
    id: `identity-${conversation.id}`,
    contactId: "",
    platform: linked.platform,
    channelAccountId: conversation.roomId,
    accountName: linked.accountName,
    externalUserId: linked.externalUserId,
    externalConversationId: conversation.id,
    displayName: linked.displayName,
    isPrimary: false,
    lastSeenAt: new Date().toISOString()
  };
}

export function suggestContactMerges(contacts: Contact[], source: Contact): MergeSuggestion[] {
  return contacts
    .filter((contact) => contact.id !== source.id)
    .flatMap((contact) => {
      if (source.phone && contact.phone === source.phone) return suggestion(source, contact, "phone matches", 0.96);
      if (source.email && contact.email === source.email) return suggestion(source, contact, "email matches", 0.94);
      const sourceNames = [source.displayName, ...source.identities.map((identity) => identity.displayName)].map(normalizeName);
      const targetNames = [contact.displayName, ...contact.identities.map((identity) => identity.displayName)].map(normalizeName);
      if (sourceNames.some((name) => targetNames.includes(name))) return suggestion(source, contact, "display name matches", 0.72);
      return [];
    });
}

export function ignoreMergeSuggestion(suggestions: MergeSuggestion[], suggestionId: string) {
  return suggestions.map((suggestionItem) => suggestionItem.id === suggestionId ? { ...suggestionItem, ignored: true } : suggestionItem);
}

function suggestion(source: Contact, target: Contact, reason: string, confidence: number): MergeSuggestion[] {
  return [{
    id: `merge-${source.id}-${target.id}-${reason.replace(/\s+/g, "-")}`,
    sourceIdentityId: source.identities[0]?.id ?? source.id,
    suggestedContactId: target.id,
    reason,
    confidence
  }];
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, " ").trim();
}
