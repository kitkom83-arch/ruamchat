"use client";

import { CheckCircle2, LinkIcon, ListFilter, MessageSquareText, Plus, Radio, RefreshCw, Search, Tags, UserRound, Wifi } from "lucide-react";
import type { Contact, LeadStatus, Platform } from "@ai-omni/shared";
import { useEffect, useMemo, useState } from "react";
import {
  getContactConversations as getApiContactConversations,
  setPrimaryContactIdentity,
  unlinkContactIdentity,
  updateContact
} from "../api-client";
import {
  addContactNote,
  addContactTag,
  createContactTask,
  filterContacts,
  getContactConversations,
  getStoredContacts,
  ignoreMergeSuggestion,
  leadStatusOptions,
  markContactTaskDone,
  mockContacts,
  removeContactTag,
  saveStoredContacts,
  setPrimaryIdentity,
  subscribeContacts,
  suggestContactMerges,
  type MergeSuggestion,
  unlinkIdentity,
  updateContactLeadStatus
} from "../crm-data";
import {
  createDefaultBroadcastStore,
  getBroadcastHistoryForContact,
  getLastCampaignReceived,
  getStoredBroadcastStore,
  subscribeBroadcastStore,
  toggleContactBroadcastOptOut,
  type BroadcastStore
} from "../broadcast-data";
import { loadContactDetailData, loadContactsListData, type ContactRelatedConversation } from "../contacts-data";
import { dataMode, isApiMode } from "../data-mode";

const platformOptions: Array<"all" | Platform> = ["all", "webchat", "telegram", "line", "facebook", "instagram"];

export default function ContactsPage() {
  const apiMode = isApiMode();
  const [contacts, setContacts] = useState<Contact[]>(apiMode ? [] : mockContacts);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [apiRelatedConversations, setApiRelatedConversations] = useState<ContactRelatedConversation[]>([]);
  const [apiLoading, setApiLoading] = useState(apiMode);
  const [apiError, setApiError] = useState("");
  const [apiDetailError, setApiDetailError] = useState("");
  const [actionStatus, setActionStatus] = useState(apiMode ? "API contacts loading" : "Local CRM ready");
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [leadStatus, setLeadStatus] = useState("all");
  const [ownerAgent, setOwnerAgent] = useState("all");
  const [tag, setTag] = useState("all");
  const [suggestions, setSuggestions] = useState<MergeSuggestion[]>([]);
  const [broadcastStore, setBroadcastStore] = useState<BroadcastStore>(() => createDefaultBroadcastStore());

  useEffect(() => {
    if (apiMode) return;
    setContacts(getStoredContacts());
    return subscribeContacts(setContacts);
  }, [apiMode]);

  useEffect(() => {
    if (!apiMode) return;
    void refreshApiData(selectedContactId || undefined);
  }, [apiMode, selectedContactId]);

  useEffect(() => {
    setBroadcastStore(getStoredBroadcastStore());
    return subscribeBroadcastStore(setBroadcastStore);
  }, []);

  const owners = useMemo(() => Array.from(new Set(contacts.map((contact) => contact.ownerAgent).filter(Boolean))) as string[], [contacts]);
  const tags = useMemo(() => Array.from(new Set(contacts.flatMap((contact) => contact.tags))), [contacts]);
  const visibleContacts = useMemo(
    () => filterContacts(contacts, { search, platform, leadStatus, ownerAgent, tag }),
    [contacts, search, platform, leadStatus, ownerAgent, tag]
  );
  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) ?? visibleContacts[0] ?? contacts[0] ?? null;
  const relatedConversations = apiMode ? apiRelatedConversations : selectedContact ? getContactConversations(selectedContact) : [];
  const broadcastHistory = selectedContact ? getBroadcastHistoryForContact(broadcastStore, selectedContact.id) : [];
  const lastBroadcastCampaign = selectedContact ? getLastCampaignReceived(broadcastStore, selectedContact.id) : null;
  const activeSuggestions = suggestions.filter((suggestion) => !suggestion.ignored);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contactId = params.get("contact");
    if (contactId) setSelectedContactId(contactId);
  }, []);

  useEffect(() => {
    if (visibleContacts.length > 0 && !visibleContacts.some((contact) => contact.id === selectedContactId)) {
      setSelectedContactId(visibleContacts[0]!.id);
    }
  }, [selectedContactId, visibleContacts]);

  function updateContacts(nextContacts: Contact[]) {
    setContacts(nextContacts);
    if (!apiMode) saveStoredContacts(nextContacts);
  }

  async function refreshApiData(contactId = selectedContactId || undefined) {
    if (!apiMode) return;
    setApiLoading(true);
    setApiError("");
    setApiDetailError("");
    try {
      const hasLoadedContact = contactId && contacts.some((contact) => contact.id === contactId);
      const baseContacts = hasLoadedContact ? contacts : await loadContactsListData();
      if (!hasLoadedContact) setContacts(baseContacts);

      const nextSelectedId = contactId && baseContacts.some((contact) => contact.id === contactId)
        ? contactId
        : baseContacts[0]?.id;
      if (!nextSelectedId) {
        setApiRelatedConversations([]);
        setActionStatus(`API contacts loaded from ${dataMode} mode`);
        return;
      }
      if (nextSelectedId !== selectedContactId) setSelectedContactId(nextSelectedId);

      try {
        const data = await loadContactDetailData(nextSelectedId);
        setContacts((current) => current.map((contact) => contact.id === data.selectedContact.id ? data.selectedContact : contact));
        setApiRelatedConversations(data.relatedConversations);
        setActionStatus(`API contact detail loaded from ${dataMode} mode`);
      } catch (detailError) {
        setApiRelatedConversations([]);
        setApiDetailError(readableError(detailError));
        if (baseContacts.length > 0) {
          setActionStatus("Contact detail API request failed");
          return;
        }
        throw detailError;
      }
    } catch (error) {
      const message = readableError(error);
      setContacts([]);
      setApiRelatedConversations([]);
      setApiError(message);
      setActionStatus("Contacts API request failed");
    } finally {
      setApiLoading(false);
    }
  }

  async function applyApiContact(update: Promise<Contact>, successMessage: string) {
    try {
      const contact = await update;
      setContacts((current) => current.map((item) => item.id === contact.id ? contact : item));
      if (contact.id === selectedContactId) {
        setApiRelatedConversations(await getApiContactConversations(contact.id));
        setApiDetailError("");
      }
      setActionStatus(successMessage);
    } catch (error) {
      setApiError(readableError(error));
      setActionStatus("Contacts API action failed");
    }
  }

  async function updateLeadStatus(nextStatus: LeadStatus) {
    if (!selectedContact) return;
    if (apiMode) {
      await applyApiContact(updateContact(selectedContact.id, { leadStatus: nextStatus }), "Lead status persisted to API");
      return;
    }
    updateContacts(updateContactLeadStatus(contacts, selectedContact.id, nextStatus));
  }

  function addNote() {
    if (!selectedContact) return;
    if (apiMode) {
      setActionStatus("Contact notes are read from API; create notes from a conversation workflow.");
      return;
    }
    updateContacts(addContactNote(contacts, selectedContact.id, `Note added from CRM at ${new Date().toLocaleTimeString("th-TH")}`));
  }

  function createTask() {
    if (!selectedContact) return;
    if (apiMode) {
      setActionStatus("Contact tasks are read from API; create tasks from a conversation workflow.");
      return;
    }
    updateContacts(createContactTask(contacts, selectedContact.id, `Follow up ${selectedContact.displayName}`));
  }

  function markDone(taskId: string) {
    if (!selectedContact) return;
    if (apiMode) {
      setActionStatus("Task completion from contacts directory is local-only; API tasks stay unchanged here.");
      return;
    }
    updateContacts(markContactTaskDone(contacts, selectedContact.id, taskId));
  }

  async function addVipTag() {
    if (!selectedContact) return;
    if (apiMode) {
      await applyApiContact(updateContact(selectedContact.id, { tags: Array.from(new Set([...selectedContact.tags, "vip"])) }), "Tag persisted to API");
      return;
    }
    updateContacts(addContactTag(contacts, selectedContact.id, "vip"));
  }

  async function removeTag(tagName: string) {
    if (!selectedContact) return;
    if (apiMode) {
      await applyApiContact(updateContact(selectedContact.id, { tags: selectedContact.tags.filter((item) => item !== tagName) }), "Tag removed from API");
      return;
    }
    updateContacts(removeContactTag(contacts, selectedContact.id, tagName));
  }

  async function setPrimary(identityId: string) {
    if (!selectedContact) return;
    if (apiMode) {
      await applyApiContact(setPrimaryContactIdentity(selectedContact.id, { identityId }), "Primary identity persisted to API");
      return;
    }
    updateContacts(setPrimaryIdentity(contacts, selectedContact.id, identityId));
  }

  async function unlink(identityId: string) {
    if (!selectedContact) return;
    if (apiMode) {
      await applyApiContact(unlinkContactIdentity(selectedContact.id, { identityId }), "Identity unlinked; conversation rooms stayed separated");
      return;
    }
    updateContacts(unlinkIdentity(contacts, selectedContact.id, identityId));
  }

  function findMergeSuggestions() {
    if (!selectedContact) return;
    setSuggestions(suggestContactMerges(contacts, selectedContact));
  }

  function ignoreSuggestion(suggestionId: string) {
    setSuggestions(ignoreMergeSuggestion(suggestions, suggestionId));
  }

  function toggleOptOut() {
    if (!selectedContact) return;
    if (apiMode) {
      setActionStatus("Broadcast opt-out is still local mock CRM state and was not written in API mode.");
      return;
    }
    updateContacts(toggleContactBroadcastOptOut(contacts, selectedContact.id, !selectedContact.optOutBroadcast));
  }

  return (
    <main className="contactsPage">
      <section className="contactsListPanel">
        <header className="contactsHeader">
          <div>
            <p className="eyebrow">CRM</p>
            <h1>Contacts</h1>
          </div>
          <span>{apiMode ? `${dataMode.toUpperCase()} / ` : ""}{visibleContacts.length} shown</span>
        </header>

        {apiMode && (
          <div className={apiError ? "collisionBanner" : "collisionBanner soft"}>
            {apiLoading ? <RefreshCw size={14} /> : <Wifi size={14} />}
            <span>{apiError || actionStatus}</span>
            <button type="button" onClick={() => void refreshApiData(selectedContactId || undefined)}>Refresh</button>
          </div>
        )}

        <div className="contactsFilters">
          <label className="searchBox crmSearch"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, email, tag, platform" /></label>
          <select aria-label="Filter by platform" value={platform} onChange={(event) => setPlatform(event.target.value)}>{platformOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select aria-label="Filter by lead status" value={leadStatus} onChange={(event) => setLeadStatus(event.target.value)}><option value="all">all status</option>{leadStatusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select aria-label="Filter by owner" value={ownerAgent} onChange={(event) => setOwnerAgent(event.target.value)}><option value="all">all owners</option>{owners.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select aria-label="Filter by tag" value={tag} onChange={(event) => setTag(event.target.value)}><option value="all">all tags</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>

        <div className="contactList">
          {apiLoading && visibleContacts.length === 0 && <p className="emptyState">Loading persisted contacts from API...</p>}
          {apiError && visibleContacts.length === 0 && <p className="emptyState"><strong>Contacts API error</strong><span>{apiError}</span></p>}
          {!apiLoading && !apiError && visibleContacts.length === 0 && <p className="emptyState">No contacts returned by the current data source.</p>}
          {visibleContacts.map((contact) => (
            <button key={contact.id} className={selectedContact?.id === contact.id ? "contactCard selected" : "contactCard"} type="button" onClick={() => setSelectedContactId(contact.id)}>
              <div className="conversationTop"><strong>{contact.displayName}</strong><span>{contact.leadStatus}</span></div>
              <p>{contact.phone ?? "No phone"} / {contact.email ?? "No email"}</p>
              <small>{contact.identities.map((identity) => `${identity.platform} / ${identity.accountName}`).join(", ")}</small>
              <div className="cardMeta"><span>{contact.ownerAgent ?? "Unassigned"}</span><time>{lastSeen(contact)}</time></div>
              <div className="tagRow">{contact.tags.map((item) => <span key={item}>{item}</span>)}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="contactDetailPanel">
        {selectedContact ? (
          <>
            <header className="contactDetailHeader">
              <div>
                <p className="eyebrow">Customer profile</p>
                <h2>{selectedContact.displayName}</h2>
                <p>{selectedContact.phone ?? "No phone"} / {selectedContact.email ?? "No email"}</p>
                {apiMode && <p>{actionStatus}</p>}
              </div>
              <select aria-label="Lead status" value={selectedContact.leadStatus} onChange={(event) => updateLeadStatus(event.target.value as LeadStatus)}>
                {leadStatusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </header>

            <div className="contactDetailGrid">
              <section className="panelBlock">
                <div className="blockHeader"><UserRound size={17} /><h3>Profile</h3></div>
                <dl className="profileGrid">
                  <div><dt>Owner</dt><dd>{selectedContact.ownerAgent ?? "Unassigned"}</dd></div>
                  <div><dt>Lead status</dt><dd>{selectedContact.leadStatus}</dd></div>
                  {Object.entries(selectedContact.customFields).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
                </dl>
              </section>

              <section className="panelBlock">
                <div className="blockHeader"><LinkIcon size={17} /><h3>Linked identities</h3></div>
                <div className="identityList">
                  {selectedContact.identities.map((identity) => (
                    <div key={identity.id} className="identityRow">
                      <strong>{identity.platform.toUpperCase()} {identity.isPrimary ? "/ PRIMARY" : ""}</strong>
                      <span>{identity.accountName}</span>
                      <small>{identity.displayName} / {identity.externalUserId}</small>
                      <div className="inlineActions">
                        <button type="button" onClick={() => setPrimary(identity.id)}>Set primary</button>
                        <button type="button" onClick={() => unlink(identity.id)} disabled={selectedContact.identities.length <= 1}>Unlink</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panelBlock">
                <div className="blockHeader"><Tags size={17} /><h3>Tags</h3></div>
                <div className="tagRow panelTags">{selectedContact.tags.map((item) => <button key={item} className="tagPillButton" type="button" onClick={() => removeTag(item)}>{item}</button>)}</div>
                <button className="smallPanelButton" type="button" onClick={addVipTag}><Plus size={14} /> Add vip tag</button>
              </section>

              <section className="panelBlock">
                <div className="blockHeader"><MessageSquareText size={17} /><h3>Conversations by room</h3></div>
                <div className="identityList">
                  {relatedConversations.map((conversation) => (
                    <div key={conversation.id} className="identityRow">
                      <strong>{conversation.platformLabel} / {conversation.accountName}</strong>
                      <span>{conversationPlatform(conversation)} / {conversationChannelAccountId(conversation)} / {conversation.roomId}</span>
                      <small>{conversation.lastMessage} / {conversation.closed || conversation.status === "closed" ? "closed" : "open"}</small>
                    </div>
                  ))}
                  {apiDetailError && <p className="noteText">Contact conversations API error: {apiDetailError}</p>}
                  {relatedConversations.length === 0 && <p className="noteText">No related persisted conversations returned for this contact.</p>}
                </div>
              </section>

              <section className="panelBlock">
                <div className="blockHeader"><Radio size={17} /><h3>Broadcast history</h3></div>
                <dl className="profileGrid">
                  <div><dt>Opt-out status</dt><dd>{selectedContact.optOutBroadcast ? `Opted out / ${selectedContact.suppressedReason ?? "suppressed"}` : "Allowed for mock broadcast"}</dd></div>
                  <div><dt>Last campaign received</dt><dd>{lastBroadcastCampaign?.name ?? "No sent_mock campaign"}</dd></div>
                </dl>
                <button className="smallPanelButton" type="button" onClick={toggleOptOut}>{selectedContact.optOutBroadcast ? "Allow mock broadcast" : "Opt out mock"}</button>
                <div className="miniList">
                  {broadcastHistory.slice(0, 4).map((item) => <p key={item.recipient.id}>{item.campaign?.name ?? item.recipient.campaignId} / {item.recipient.platform} / {item.recipient.status}</p>)}
                  {broadcastHistory.length === 0 && <p>No broadcast history yet</p>}
                </div>
              </section>

              <section className="panelBlock">
                <div className="blockHeader"><ListFilter size={17} /><h3>Notes</h3></div>
                <button className="smallPanelButton" type="button" onClick={addNote}><Plus size={14} /> Add note</button>
                <div className="miniList">{selectedContact.notes.map((note) => <p key={note.id}>{note.body}</p>)}</div>
              </section>

              <section className="panelBlock">
                <div className="blockHeader"><CheckCircle2 size={17} /><h3>Tasks</h3></div>
                <button className="smallPanelButton" type="button" onClick={createTask}><Plus size={14} /> Create task</button>
                <div className="miniList">{selectedContact.tasks.map((task) => <p key={task.id}>{task.title} / {task.status} {task.status === "open" && <button type="button" onClick={() => markDone(task.id)}>Mark done</button>}</p>)}</div>
              </section>

              <section className="panelBlock">
                <div className="blockHeader"><LinkIcon size={17} /><h3>Merge suggestions</h3></div>
                <button className="smallPanelButton" type="button" onClick={findMergeSuggestions}>Suggest Merge</button>
                <div className="identityList">
                  {activeSuggestions.map((suggestion) => {
                    const target = contacts.find((contact) => contact.id === suggestion.suggestedContactId);
                    return <div key={suggestion.id} className="identityRow"><strong>{target?.displayName}</strong><span>{suggestion.reason}</span><small>{Math.round(suggestion.confidence * 100)}% confidence</small><div className="inlineActions"><button type="button">Link</button><button type="button" onClick={() => ignoreSuggestion(suggestion.id)}>Ignore</button></div></div>;
                  })}
                  {activeSuggestions.length === 0 && <p className="noteText">No active suggestion. Suggestions never auto merge.</p>}
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="emptyState">No contact selected</div>
        )}
      </section>
    </main>
  );
}

function lastSeen(contact: Contact) {
  return contact.identities.map((identity) => identity.lastSeenAt).sort().at(-1)?.slice(0, 10) ?? "never";
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown contacts API error";
}

function conversationPlatform(conversation: ContactRelatedConversation | ReturnType<typeof getContactConversations>[number]) {
  return "platform" in conversation ? conversation.platform : conversation.linkedIdentities[0]?.platform ?? "-";
}

function conversationChannelAccountId(conversation: ContactRelatedConversation | ReturnType<typeof getContactConversations>[number]) {
  return "channelAccountId" in conversation ? conversation.channelAccountId : conversation.roomId;
}
