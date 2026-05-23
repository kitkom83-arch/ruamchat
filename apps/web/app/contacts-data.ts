import type { Contact, DataMode, Platform } from "@ai-omni/shared";
import {
  getContact as getApiContact,
  getContactConversations as getApiContactConversations,
  getContacts as getApiContacts
} from "./api-client";
import { getContactConversations as getMockContactConversations, getStoredContacts } from "./crm-data";
import type { ConversationCard } from "./inbox-data";

export type ContactsDirectoryData = {
  contacts: Contact[];
  selectedContact: Contact | null;
  relatedConversations: ContactRelatedConversation[];
};

export type ContactRelatedConversation = {
  id: string;
  roomId: string;
  channelAccountId: string;
  platform: Platform;
  platformLabel: string;
  accountName: string;
  lastMessage: string;
  closed?: boolean;
  status?: string;
};

export async function loadContactsDirectoryData(mode: DataMode, selectedContactId?: string): Promise<ContactsDirectoryData> {
  if (mode === "api") {
    const contacts = await getApiContacts();
    const selectedId = selectedContactId && contacts.some((contact) => contact.id === selectedContactId)
      ? selectedContactId
      : contacts[0]?.id;
    const selectedContact = selectedId ? await getApiContact(selectedId) : null;
    const relatedConversations = selectedId ? await getApiContactConversations(selectedId) : [];
    return { contacts: upsertContact(contacts, selectedContact), selectedContact, relatedConversations };
  }

  const contacts = getStoredContacts();
  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) ?? contacts[0] ?? null;
  return {
    contacts,
    selectedContact,
    relatedConversations: selectedContact ? getMockContactConversations(selectedContact).map(mapMockRelatedConversation) : []
  };
}

export async function loadContactsListData() {
  return getApiContacts();
}

function upsertContact(contacts: Contact[], selectedContact: Contact | null) {
  if (!selectedContact) return contacts;
  return contacts.some((contact) => contact.id === selectedContact.id)
    ? contacts.map((contact) => contact.id === selectedContact.id ? selectedContact : contact)
    : [selectedContact, ...contacts];
}

export async function loadContactDetailData(contactId: string) {
  const selectedContact = await getApiContact(contactId);
  const relatedConversations = await getApiContactConversations(contactId);
  return { selectedContact, relatedConversations };
}

function mapMockRelatedConversation(conversation: ConversationCard): ContactRelatedConversation {
  return {
    id: conversation.id,
    roomId: conversation.roomId,
    channelAccountId: conversation.roomId,
    platform: conversation.linkedIdentities[0]?.platform ?? "webchat",
    platformLabel: conversation.platformLabel,
    accountName: conversation.accountName,
    lastMessage: conversation.lastMessage,
    closed: conversation.closed,
    status: conversation.status
  };
}
