"use client";

import {
  BarChart3,
  Bot,
  CalendarClock,
  ClipboardCheck,
  ContactRound,
  Copy,
  Eye,
  Inbox,
  Pause,
  Play,
  Plus,
  Radio,
  Search,
  Send,
  ShieldAlert,
  Workflow
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BroadcastAudiencePreviewRecipient, BroadcastCampaign, BroadcastSegmentRule, BroadcastSendLog, BroadcastSegment, BroadcastTemplate, Platform } from "@ai-omni/shared";
import {
  createBroadcastCampaign,
  createBroadcastSegment,
  deleteBroadcastCampaign,
  deleteBroadcastSegment,
  duplicateBroadcastCampaign,
  getBroadcastCampaigns,
  getBroadcastSegments,
  getBroadcastSendLogs,
  previewBroadcastAudience,
  scheduleBroadcastCampaign,
  sendBroadcastNow,
  sendBroadcastTest,
  updateBroadcastCampaign,
  updateBroadcastSegment
} from "../api-client";
import {
  allBroadcastPlatforms,
  archiveTemplate,
  buildBroadcastSummaryText,
  cancelCampaign,
  createCampaign,
  createDefaultBroadcastStore,
  createSegment,
  createTemplate,
  detectSecretPatterns,
  dryRunCampaign,
  duplicateCampaign,
  editSegment,
  editTemplate,
  emptySafetyChecklist,
  getBroadcastAnalytics,
  getStoredBroadcastStore,
  isSafetyChecklistComplete,
  pauseCampaign,
  previewRecipients,
  resumeCampaign,
  safetyChecklistLabels,
  saveStoredBroadcastStore,
  scheduleCampaign,
  sendMockCampaign,
  subscribeBroadcastStore,
  type BroadcastSafetyChecklist,
  type BroadcastStore
} from "../broadcast-data";
import { getStoredContacts, mockContacts, subscribeContacts } from "../crm-data";
import { isApiMode } from "../data-mode";
import { platformRooms } from "../inbox-data";
import type { Contact } from "@ai-omni/shared";
import type { LucideIcon } from "lucide-react";

const navItems: Array<{ label: string; icon: LucideIcon; href: string; active?: boolean }> = [
  { label: "Inbox", icon: Inbox, href: "/" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Contacts", icon: ContactRound, href: "/contacts" },
  { label: "Broadcasts", icon: Radio, href: "/broadcasts", active: true },
  { label: "AI Center", icon: Bot, href: "/ai-center" },
  { label: "Flows", icon: Workflow, href: "/flows" }
];

const ruleFields: BroadcastSegmentRule["field"][] = ["platform", "roomId", "tag", "leadStatus", "ownerAgent", "lastSeenDays", "hasOpenTask", "priority", "slaStatus", "aiStatus", "status"];
const operators: BroadcastSegmentRule["operator"][] = ["equals", "not_equals", "contains", "not_contains", "in", "not_in", "greater_than", "less_than", "exists", "not_exists"];

export default function BroadcastsPage() {
  return isApiMode() ? <ApiBroadcastsPage /> : <MockBroadcastsPage />;
}

function MockBroadcastsPage() {
  const [store, setStore] = useState<BroadcastStore>(() => createDefaultBroadcastStore());
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selectedCampaignId, setSelectedCampaignId] = useState("camp-line-follow-up");
  const [statusText, setStatusText] = useState("Broadcast mock/local mode ready");
  const [checklist, setChecklist] = useState<BroadcastSafetyChecklist>(emptySafetyChecklist);
  const [campaignForm, setCampaignForm] = useState({
    name: "Draft broadcast",
    description: "Local mock campaign",
    platformScope: ["line"] as Platform[],
    roomIds: ["line-oa-main"],
    segmentId: "seg-line-follow-up",
    templateId: "tmpl-human-support",
    message: "สวัสดีคุณ {{contact.firstName}} แอดมิน {{ownerAgent}} ขออนุญาตติดตามผ่าน {{roomName}} ครับ",
    scheduleType: "now" as BroadcastCampaign["scheduleType"],
    scheduledAt: "2026-05-22T04:00:00.000Z"
  });
  const [segmentForm, setSegmentForm] = useState({
    name: "New local segment",
    description: "Segment created in local mock mode",
    field: "tag" as BroadcastSegmentRule["field"],
    operator: "contains" as BroadcastSegmentRule["operator"],
    value: "pricing"
  });
  const [templateForm, setTemplateForm] = useState({
    id: "",
    name: "New template",
    category: "sales",
    body: "สวัสดีคุณ {{contact.name}} ทีม {{ownerAgent}} พร้อมช่วยดูรายละเอียดใน {{roomName}} ครับ",
    variables: "contact.name, ownerAgent, roomName",
    tags: "sales, follow-up"
  });

  useEffect(() => {
    setStore(getStoredBroadcastStore());
    return subscribeBroadcastStore(setStore);
  }, []);

  useEffect(() => {
    setContacts(getStoredContacts());
    return subscribeContacts(setContacts);
  }, []);

  const selectedCampaign = store.campaigns.find((item) => item.id === selectedCampaignId) ?? store.campaigns[0];
  const analytics = useMemo(() => getBroadcastAnalytics(store), [store]);
  const selectedPreview = useMemo(() => selectedCampaign ? previewRecipients(selectedCampaign, store, contacts) : [], [contacts, selectedCampaign, store]);
  const segmentPreview = useMemo(() => {
    const localCampaign: BroadcastCampaign = {
      id: "preview-segment-local",
      name: "Segment preview",
      description: "",
      status: "draft",
      platformScope: allBroadcastPlatforms,
      roomIds: [],
      segmentId: "__draft_segment__",
      message: templateForm.body,
      scheduleType: "now",
      createdBy: "Demo Admin",
      createdAt: new Date("2026-05-21T00:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-05-21T00:00:00.000Z").toISOString()
    };
    return previewRecipients(localCampaign, {
      ...store,
      segments: [{ id: "__draft_segment__", name: segmentForm.name, description: segmentForm.description, rules: [draftRule()], estimatedCount: 0, createdAt: localCampaign.createdAt, updatedAt: localCampaign.updatedAt }, ...store.segments]
    }, contacts);
  }, [contacts, segmentForm, store, templateForm.body]);
  const secretWarning = detectSecretPatterns([campaignForm.message, templateForm.body, selectedCampaign?.message ?? ""].join("\n"));
  const canSend = isSafetyChecklistComplete(checklist) && !detectSecretPatterns(selectedCampaign?.message ?? "").hasSecret;

  function updateStore(next: BroadcastStore) {
    setStore(next);
    saveStoredBroadcastStore(next);
  }

  function updatePlatforms(platform: Platform, checked: boolean) {
    setCampaignForm((current) => {
      const platformScope = checked ? Array.from(new Set([...current.platformScope, platform])) : current.platformScope.filter((item) => item !== platform);
      const roomIds = current.roomIds.filter((roomId) => platformRooms.find((room) => room.id === roomId && platformScope.includes(room.platform)));
      return { ...current, platformScope, roomIds };
    });
  }

  function updateRoom(roomId: string, checked: boolean) {
    setCampaignForm((current) => ({ ...current, roomIds: checked ? Array.from(new Set([...current.roomIds, roomId])) : current.roomIds.filter((item) => item !== roomId) }));
  }

  function useTemplate(templateId: string) {
    const template = store.templates.find((item) => item.id === templateId);
    setCampaignForm((current) => ({ ...current, templateId, message: template?.body ?? current.message }));
  }

  function createDraftCampaign() {
    const next = createCampaign(store, campaignForm, new Date());
    updateStore(next);
    setSelectedCampaignId(next.campaigns[0]?.id ?? selectedCampaignId);
    setStatusText("Campaign draft created locally");
  }

  function runDryRun(campaignId = selectedCampaign?.id) {
    if (!campaignId) return;
    const result = dryRunCampaign(store, campaignId, checklist, new Date());
    updateStore(result.store);
    setStatusText(result.blockedReason ? `Dry run warning: ${result.blockedReason}` : `Dry run previewed ${result.preview.length} recipients`);
  }

  function sendMock(campaignId = selectedCampaign?.id) {
    if (!campaignId) return;
    const result = sendMockCampaign(store, campaignId, checklist, new Date());
    updateStore(result.store);
    setStatusText(result.blockedReason ?? result.run?.summary ?? "Mock send finished");
  }

  function scheduleSelected(campaignId = selectedCampaign?.id) {
    if (!campaignId) return;
    updateStore(scheduleCampaign(store, campaignId, campaignForm.scheduledAt, new Date()));
    setStatusText("Campaign scheduled locally. No timer was started.");
  }

  function createLocalSegment() {
    const next = createSegment(store, { name: segmentForm.name, description: segmentForm.description, rules: [draftRule()] }, new Date());
    updateStore(next);
    setCampaignForm((current) => ({ ...current, segmentId: next.segments[0]?.id ?? current.segmentId }));
    setStatusText("Segment created locally");
  }

  function createOrEditTemplate() {
    const input = {
      name: templateForm.name,
      category: templateForm.category,
      body: templateForm.body,
      variables: splitList(templateForm.variables),
      tags: splitList(templateForm.tags)
    };
    const next = templateForm.id ? editTemplate(store, templateForm.id, input, new Date()) : createTemplate(store, input, new Date());
    updateStore(next);
    setStatusText(templateForm.id ? "Template updated locally" : "Template created locally");
  }

  function draftRule(): BroadcastSegmentRule {
    return { id: `rule-draft-${segmentForm.field}`, field: segmentForm.field, operator: segmentForm.operator, value: parseRuleValue(segmentForm.value, segmentForm.field) };
  }

  return (
    <main className="broadcastShell">
      <aside className="mainMenu" aria-label="Main menu">
        <div className="brandMark">AO</div>
        <span className="menuLabel">Main menu</span>
        <nav className="navStack">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={item.active ? "navIcon active" : "navIcon"} aria-label={item.label} title={item.label}>
              <item.icon size={19} />
            </Link>
          ))}
        </nav>
      </aside>

      <section className="broadcastPage">
        <header className="broadcastHeader">
          <div>
            <p className="eyebrow">Broadcast Campaigns</p>
            <h1>Mock campaigns, segmentation, preview, dry run, and local delivery events</h1>
            <p>Platform/account/room scopes stay separated. Send Mock never calls external APIs.</p>
          </div>
          <div className="broadcastStatus">
            <ShieldAlert size={16} />
            <span>{statusText}</span>
          </div>
        </header>

        {secretWarning.hasSecret && (
          <section className="warningBand">
            <strong>Secret guard warning</strong>
            <span>Matched: {secretWarning.matches.join(", ")}</span>
          </section>
        )}

        <section className="broadcastMetrics">
          <MiniStat label="Campaigns" value={analytics.totalCampaigns} />
          <MiniStat label="Scheduled" value={analytics.scheduled} />
          <MiniStat label="Sent mock" value={analytics.sentMock} />
          <MiniStat label="Recipients" value={analytics.totalRecipients} />
          <MiniStat label="sent_mock" value={analytics.sentMockCount} />
          <MiniStat label="Skipped" value={analytics.skippedCount} />
          <MiniStat label="failed_mock" value={analytics.failedMockCount} />
          <MiniStat label="Opt-out skipped" value={analytics.optOutSkippedCount} />
        </section>

        <section className="broadcastGrid">
          <section className="broadcastPanel campaignListPanel">
            <div className="blockHeader"><Radio size={18} /><h2>Campaign list</h2></div>
            <div className="campaignList">
              {store.campaigns.map((campaign) => {
                const segment = store.segments.find((item) => item.id === campaign.segmentId);
                const count = previewRecipients(campaign, store, contacts).length;
                return (
                  <article key={campaign.id} className={selectedCampaign?.id === campaign.id ? "campaignItem selected" : "campaignItem"}>
                    <button type="button" onClick={() => setSelectedCampaignId(campaign.id)}>
                      <strong>{campaign.name}</strong>
                      <span>{campaign.status} / {campaign.platformScope.join(", ")}</span>
                      <small>{segment?.name ?? campaign.segmentId} / {count} recipients / {campaign.scheduleType === "scheduled" ? campaign.scheduledAt : "now"}</small>
                      <small>{campaign.createdBy} / updated {new Date(campaign.updatedAt).toLocaleString("th-TH")}</small>
                    </button>
                    <div className="campaignActions">
                      <button type="button" onClick={() => setSelectedCampaignId(campaign.id)}><Eye size={13} /> Preview</button>
                      <button type="button" onClick={() => runDryRun(campaign.id)}><ClipboardCheck size={13} /> Dry Run</button>
                      <button type="button" onClick={() => scheduleSelected(campaign.id)}><CalendarClock size={13} /> Schedule</button>
                      <button type="button" onClick={() => sendMock(campaign.id)} disabled={!canSend}><Send size={13} /> Send Mock</button>
                      <button type="button" onClick={() => updateStore(pauseCampaign(store, campaign.id, new Date()))}><Pause size={13} /> Pause</button>
                      <button type="button" onClick={() => updateStore(resumeCampaign(store, campaign.id, new Date()))}><Play size={13} /> Resume</button>
                      <button type="button" onClick={() => updateStore(cancelCampaign(store, campaign.id, new Date()))}>Cancel</button>
                      <button type="button" onClick={() => updateStore(duplicateCampaign(store, campaign.id, new Date()))}><Copy size={13} /> Duplicate</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="broadcastPanel builderPanel">
            <div className="blockHeader"><Plus size={18} /><h2>Campaign builder</h2></div>
            <div className="broadcastFormGrid">
              <label>Name<input value={campaignForm.name} onChange={(event) => setCampaignForm({ ...campaignForm, name: event.target.value })} /></label>
              <label>Description<input value={campaignForm.description} onChange={(event) => setCampaignForm({ ...campaignForm, description: event.target.value })} /></label>
              <label>Segment<select value={campaignForm.segmentId} onChange={(event) => setCampaignForm({ ...campaignForm, segmentId: event.target.value })}>{store.segments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Template<select value={campaignForm.templateId} onChange={(event) => useTemplate(event.target.value)}>{store.templates.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Schedule<select value={campaignForm.scheduleType} onChange={(event) => setCampaignForm({ ...campaignForm, scheduleType: event.target.value as BroadcastCampaign["scheduleType"] })}><option value="now">now</option><option value="scheduled">scheduled</option></select></label>
              <label>Scheduled at<input value={campaignForm.scheduledAt} onChange={(event) => setCampaignForm({ ...campaignForm, scheduledAt: event.target.value })} /></label>
            </div>
            <div className="scopeMatrix">
              <strong>Platform scope</strong>
              {allBroadcastPlatforms.map((platform) => <label key={platform}><input type="checkbox" checked={campaignForm.platformScope.includes(platform)} onChange={(event) => updatePlatforms(platform, event.target.checked)} />{platform}</label>)}
            </div>
            <div className="scopeMatrix roomScope">
              <strong>Room scope</strong>
              {platformRooms.filter((room) => campaignForm.platformScope.includes(room.platform)).map((room) => <label key={room.id}><input type="checkbox" checked={campaignForm.roomIds.includes(room.id)} onChange={(event) => updateRoom(room.id, event.target.checked)} />{room.platformLabel} / {room.accountName}</label>)}
            </div>
            <label className="messageEditor">Message body<textarea value={campaignForm.message} onChange={(event) => setCampaignForm({ ...campaignForm, message: event.target.value })} /></label>
            <div className="checklistBox">
              <strong>Safety checklist</strong>
              {safetyChecklistLabels.map((item) => <label key={item.key}><input type="checkbox" checked={checklist[item.key]} onChange={(event) => setChecklist({ ...checklist, [item.key]: event.target.checked })} />{item.label}</label>)}
              {!isSafetyChecklistComplete(checklist) && <p>Send Mock is disabled until all checklist items are confirmed.</p>}
            </div>
            <div className="broadcastActionRow">
              <button type="button" onClick={createDraftCampaign}><Plus size={14} /> Create Draft</button>
              <button type="button" onClick={() => selectedCampaign && runDryRun(selectedCampaign.id)}><ClipboardCheck size={14} /> Dry Run Selected</button>
              <button type="button" onClick={() => selectedCampaign && sendMock(selectedCampaign.id)} disabled={!canSend}><Send size={14} /> Send Mock Selected</button>
            </div>
          </section>

          <section className="broadcastPanel">
            <div className="blockHeader"><Search size={18} /><h2>Segment builder</h2></div>
            <div className="broadcastFormGrid compact">
              <label>Name<input value={segmentForm.name} onChange={(event) => setSegmentForm({ ...segmentForm, name: event.target.value })} /></label>
              <label>Description<input value={segmentForm.description} onChange={(event) => setSegmentForm({ ...segmentForm, description: event.target.value })} /></label>
              <label>Field<select value={segmentForm.field} onChange={(event) => setSegmentForm({ ...segmentForm, field: event.target.value as BroadcastSegmentRule["field"] })}>{ruleFields.map((field) => <option key={field} value={field}>{field}</option>)}</select></label>
              <label>Operator<select value={segmentForm.operator} onChange={(event) => setSegmentForm({ ...segmentForm, operator: event.target.value as BroadcastSegmentRule["operator"] })}>{operators.map((operator) => <option key={operator} value={operator}>{operator}</option>)}</select></label>
              <label>Value<input value={segmentForm.value} onChange={(event) => setSegmentForm({ ...segmentForm, value: event.target.value })} /></label>
            </div>
            <div className="broadcastActionRow"><button type="button" onClick={createLocalSegment}><Plus size={14} /> Create Segment</button></div>
            <div className="miniList">
              <p>Preview count: {segmentPreview.length}</p>
              {segmentPreview.slice(0, 4).map((item) => <p key={item.id}>{item.displayName} / {item.platform} / {item.leadStatus}</p>)}
            </div>
          </section>

          <section className="broadcastPanel">
            <div className="blockHeader"><ClipboardCheck size={18} /><h2>Template manager</h2></div>
            <div className="broadcastFormGrid compact">
              <label>Name<input value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} /></label>
              <label>Category<input value={templateForm.category} onChange={(event) => setTemplateForm({ ...templateForm, category: event.target.value })} /></label>
              <label>Variables<input value={templateForm.variables} onChange={(event) => setTemplateForm({ ...templateForm, variables: event.target.value })} /></label>
              <label>Tags<input value={templateForm.tags} onChange={(event) => setTemplateForm({ ...templateForm, tags: event.target.value })} /></label>
            </div>
            <label className="messageEditor">Body<textarea value={templateForm.body} onChange={(event) => setTemplateForm({ ...templateForm, body: event.target.value })} /></label>
            <div className="broadcastActionRow"><button type="button" onClick={createOrEditTemplate}><Plus size={14} /> Save Template</button></div>
            <div className="templateList">
              {store.templates.map((template) => (
                <article key={template.id} className="templateItem">
                  <strong>{template.name}</strong>
                  <span>{template.category} / {template.isActive ? "active" : "inactive"}</span>
                  <small>{template.variables.join(", ")}</small>
                  <div className="campaignActions">
                    <button type="button" onClick={() => setTemplateForm({ id: template.id, name: template.name, category: template.category, body: template.body, variables: template.variables.join(", "), tags: template.tags.join(", ") })}>Edit</button>
                    <button type="button" onClick={() => updateStore(archiveTemplate(store, template.id, new Date()))}>Archive</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="broadcastPanel previewPanel">
          <div className="blockHeader"><Eye size={18} /><h2>Recipient preview</h2></div>
          <div className="analyticsTableWrap">
            <table className="analyticsTable">
              <thead><tr><th>Contact</th><th>Platform</th><th>Room/account</th><th>Tags</th><th>Lead</th><th>Owner</th><th>Rendered message</th><th>Skip reason</th></tr></thead>
              <tbody>
                {selectedPreview.map((recipient) => (
                  <tr key={recipient.id}>
                    <td>{recipient.displayName}</td>
                    <td>{recipient.platform}</td>
                    <td>{recipient.roomName}<small>{recipient.roomId}</small></td>
                    <td>{recipient.tags.join(", ")}</td>
                    <td>{recipient.leadStatus}</td>
                    <td>{recipient.ownerAgent}</td>
                    <td>{recipient.renderedMessage}</td>
                    <td>{recipient.reason ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="deliveryGrid">
            <section>
              <strong>Delivery events</strong>
              <div className="miniList">{store.events.slice(0, 8).map((event) => <p key={event.id}>{event.status} / {event.campaignId} / {event.message}</p>)}</div>
            </section>
            <section>
              <strong>Copy summary</strong>
              <p>{selectedCampaign ? buildBroadcastSummaryText(store, selectedCampaign.id) : "No campaign selected"}</p>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

function ApiBroadcastsPage() {
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [segments, setSegments] = useState<BroadcastSegment[]>([]);
  const [sendLogs, setSendLogs] = useState<BroadcastSendLog[]>([]);
  const [preview, setPreview] = useState<BroadcastAudiencePreviewRecipient[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Broadcast API mode loading");
  const [campaignForm, setCampaignForm] = useState({
    name: "API broadcast draft",
    description: "Persisted safe mock broadcast",
    channelPlatform: "webchat" as Platform,
    channelAccountId: "",
    segmentId: "",
    message: "Hi {{contact.firstName}}, this is a safe mock broadcast from {{roomName}}.",
    scheduleAt: "2026-05-23T04:00:00.000Z"
  });
  const [segmentForm, setSegmentForm] = useState({
    name: "API segment draft",
    description: "Persisted segment from API mode",
    field: "leadStatus" as BroadcastSegmentRule["field"],
    operator: "equals" as BroadcastSegmentRule["operator"],
    value: "interested"
  });

  const selectedCampaign = campaigns.find((item) => item.id === selectedCampaignId) ?? campaigns[0];
  const selectedLogs = selectedCampaign ? sendLogs.filter((log) => log.campaignId === selectedCampaign.id) : [];
  const apiMetrics = useMemo(() => ({
    totalCampaigns: campaigns.length,
    scheduled: campaigns.filter((campaign) => campaign.status === "scheduled").length,
    archived: campaigns.filter((campaign) => campaign.status === "archived").length,
    sentMock: sendLogs.filter((log) => log.status === "sent_mock").length,
    queuedMock: sendLogs.filter((log) => log.status === "queued_mock").length,
    skippedMock: sendLogs.filter((log) => log.status === "skipped_mock").length,
    failedMock: sendLogs.filter((log) => log.status === "failed_mock").length,
    previewCount: preview.length
  }), [campaigns, preview.length, sendLogs]);

  useEffect(() => {
    void refreshApiData();
  }, []);

  useEffect(() => {
    if (!selectedCampaign) return;
    setCampaignForm({
      name: selectedCampaign.name,
      description: selectedCampaign.description,
      channelPlatform: selectedCampaign.channelPlatform ?? selectedCampaign.platformScope[0] ?? "webchat",
      channelAccountId: selectedCampaign.channelAccountId ?? selectedCampaign.roomIds[0] ?? "",
      segmentId: selectedCampaign.segmentId ?? "",
      message: selectedCampaign.message,
      scheduleAt: selectedCampaign.scheduleAt ?? selectedCampaign.scheduledAt ?? "2026-05-23T04:00:00.000Z"
    });
  }, [selectedCampaign?.id]);

  async function refreshApiData(preferredCampaignId = selectedCampaignId) {
    setLoading(true);
    setError(null);
    try {
      const [apiCampaigns, apiSegments] = await Promise.all([
        getBroadcastCampaigns(),
        getBroadcastSegments()
      ]);
      const logs = (await Promise.all(apiCampaigns.map((campaign) => getBroadcastSendLogs(campaign.id)))).flat();
      setCampaigns(apiCampaigns);
      setSegments(apiSegments);
      setSendLogs(logs);
      const nextSelected = apiCampaigns.find((campaign) => campaign.id === preferredCampaignId)?.id ?? apiCampaigns[0]?.id ?? "";
      setSelectedCampaignId(nextSelected);
      setSelectedSegmentId((current) => apiSegments.find((segment) => segment.id === current)?.id ?? apiSegments[0]?.id ?? "");
      setStatusText(`API mode loaded ${apiCampaigns.length} campaigns and ${apiSegments.length} segments`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Broadcast API request failed";
      setError(message);
      setStatusText("Broadcast API mode error");
    } finally {
      setLoading(false);
    }
  }

  async function runApiAction(label: string, action: () => Promise<string | void>, refreshCampaignId = selectedCampaignId) {
    setWorking(true);
    setError(null);
    try {
      const message = await action();
      await refreshApiData(refreshCampaignId);
      setStatusText(message || label);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Broadcast API request failed";
      setError(message);
      setStatusText(`${label} failed`);
    } finally {
      setWorking(false);
    }
  }

  function campaignPayload(status: BroadcastCampaign["status"] = "draft") {
    return {
      name: campaignForm.name,
      description: campaignForm.description,
      status,
      channelPlatform: campaignForm.channelPlatform,
      channelAccountId: campaignForm.channelAccountId.trim() || null,
      segmentId: campaignForm.segmentId || null,
      contentJson: {
        message: campaignForm.message,
        safeMockOnly: true
      },
      scheduleAt: status === "scheduled" ? campaignForm.scheduleAt : null
    };
  }

  function draftRule(): BroadcastSegmentRule {
    return {
      id: `rule-api-${segmentForm.field}`,
      field: segmentForm.field,
      operator: segmentForm.operator,
      value: parseRuleValue(segmentForm.value, segmentForm.field)
    };
  }

  function selectSegment(segment: BroadcastSegment) {
    setSelectedSegmentId(segment.id);
    setSegmentForm({
      name: segment.name,
      description: segment.description,
      field: segment.rules[0]?.field ?? "leadStatus",
      operator: segment.rules[0]?.operator ?? "equals",
      value: String(segment.rules[0]?.value ?? "interested")
    });
  }

  async function previewSelected() {
    if (!selectedCampaign) return;
    setWorking(true);
    setError(null);
    try {
      const result = await previewBroadcastAudience(selectedCampaign.id, {
        platform: campaignForm.channelPlatform,
        channelAccountId: campaignForm.channelAccountId.trim() || null
      });
      setPreview(result.recipients);
      setStatusText(`Audience preview returned ${result.total} API recipient(s)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Audience preview failed";
      setError(message);
      setStatusText("Audience preview failed");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="broadcastShell">
      <aside className="mainMenu" aria-label="Main menu">
        <div className="brandMark">AO</div>
        <span className="menuLabel">Main menu</span>
        <nav className="navStack">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={item.active ? "navIcon active" : "navIcon"} aria-label={item.label} title={item.label}>
              <item.icon size={19} />
            </Link>
          ))}
        </nav>
      </aside>

      <section className="broadcastPage">
        <header className="broadcastHeader">
          <div>
            <p className="eyebrow">Broadcast Campaigns / API Mode</p>
            <h1>Persisted campaigns, segments, audience preview, and safe mock send logs</h1>
            <p>API mode reads and writes backend data. Send test and send now create mock logs only.</p>
          </div>
          <div className="broadcastStatus">
            <ShieldAlert size={16} />
            <span>{loading ? "Loading API broadcasts" : statusText}</span>
          </div>
        </header>

        {error && (
          <section className="errorBand">
            <strong>Broadcast API error</strong>
            <span>{error}</span>
          </section>
        )}

        <section className="broadcastMetrics">
          <MiniStat label="Campaigns" value={apiMetrics.totalCampaigns} />
          <MiniStat label="Scheduled" value={apiMetrics.scheduled} />
          <MiniStat label="Archived" value={apiMetrics.archived} />
          <MiniStat label="sent_mock" value={apiMetrics.sentMock} />
          <MiniStat label="queued_mock" value={apiMetrics.queuedMock} />
          <MiniStat label="skipped_mock" value={apiMetrics.skippedMock} />
          <MiniStat label="failed_mock" value={apiMetrics.failedMock} />
          <MiniStat label="Preview" value={apiMetrics.previewCount} />
        </section>

        <section className="broadcastGrid">
          <section className="broadcastPanel campaignListPanel">
            <div className="blockHeader"><Radio size={18} /><h2>API campaign list</h2></div>
            <div className="campaignList">
              {campaigns.map((campaign) => {
                const segment = segments.find((item) => item.id === campaign.segmentId);
                const count = sendLogs.filter((log) => log.campaignId === campaign.id).length;
                return (
                  <article key={campaign.id} className={selectedCampaign?.id === campaign.id ? "campaignItem selected" : "campaignItem"}>
                    <button type="button" onClick={() => setSelectedCampaignId(campaign.id)}>
                      <strong>{campaign.name}</strong>
                      <span>{campaign.status} / {campaign.channelPlatform ?? campaign.platformScope.join(", ")}</span>
                      <small>{segment?.name ?? campaign.segmentId ?? "No segment"} / {count} send logs / {campaign.scheduleAt ?? "not scheduled"}</small>
                      <small>updated {new Date(campaign.updatedAt).toLocaleString("th-TH")}</small>
                    </button>
                    <div className="campaignActions">
                      <button type="button" onClick={() => setSelectedCampaignId(campaign.id)}><Eye size={13} /> Select</button>
                      <button type="button" onClick={() => void previewSelected()} disabled={working || selectedCampaign?.id !== campaign.id}><Search size={13} /> Preview</button>
                      <button type="button" onClick={() => void runApiAction("Campaign duplicated", async () => {
                        const copy = await duplicateBroadcastCampaign(campaign.id);
                        setSelectedCampaignId(copy.id);
                        return "Campaign duplicated through API";
                      }, campaign.id)} disabled={working}><Copy size={13} /> Duplicate</button>
                      <button type="button" onClick={() => void runApiAction("Campaign paused", async () => {
                        await updateBroadcastCampaign(campaign.id, { status: "paused" });
                        return "Campaign paused through API";
                      }, campaign.id)} disabled={working}><Pause size={13} /> Pause</button>
                      <button type="button" onClick={() => void runApiAction("Campaign archived", async () => {
                        await deleteBroadcastCampaign(campaign.id);
                        return "Campaign archived through API";
                      }, campaign.id)} disabled={working}>Archive</button>
                    </div>
                  </article>
                );
              })}
              {!loading && campaigns.length === 0 && <p className="mutedText">No API campaigns returned.</p>}
            </div>
          </section>

          <section className="broadcastPanel builderPanel">
            <div className="blockHeader"><Plus size={18} /><h2>API campaign editor</h2></div>
            <div className="broadcastFormGrid">
              <label>Name<input value={campaignForm.name} onChange={(event) => setCampaignForm({ ...campaignForm, name: event.target.value })} /></label>
              <label>Description<input value={campaignForm.description} onChange={(event) => setCampaignForm({ ...campaignForm, description: event.target.value })} /></label>
              <label>Platform<select value={campaignForm.channelPlatform} onChange={(event) => setCampaignForm({ ...campaignForm, channelPlatform: event.target.value as Platform })}>{allBroadcastPlatforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label>
              <label>Channel account<input value={campaignForm.channelAccountId} onChange={(event) => setCampaignForm({ ...campaignForm, channelAccountId: event.target.value })} placeholder="optional channelAccountId" /></label>
              <label>Segment<select value={campaignForm.segmentId} onChange={(event) => setCampaignForm({ ...campaignForm, segmentId: event.target.value })}><option value="">No segment</option>{segments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Schedule at<input value={campaignForm.scheduleAt} onChange={(event) => setCampaignForm({ ...campaignForm, scheduleAt: event.target.value })} /></label>
            </div>
            <label className="messageEditor">Message body<textarea value={campaignForm.message} onChange={(event) => setCampaignForm({ ...campaignForm, message: event.target.value })} /></label>
            <div className="checklistBox">
              <strong>Safety state</strong>
              <p>API mode send-test and send-now create sent_mock, queued_mock, skipped_mock, or failed_mock logs only. No platform API calls are made.</p>
            </div>
            <div className="broadcastActionRow">
              <button type="button" onClick={() => void runApiAction("Campaign created", async () => {
                const created = await createBroadcastCampaign(campaignPayload("draft"));
                setSelectedCampaignId(created.id);
                return "Campaign created through API";
              })} disabled={working}><Plus size={14} /> Create</button>
              <button type="button" onClick={() => selectedCampaign && void runApiAction("Campaign updated", async () => {
                await updateBroadcastCampaign(selectedCampaign.id, campaignPayload(selectedCampaign.status));
                return "Campaign updated through API";
              }, selectedCampaign.id)} disabled={working || !selectedCampaign}><ClipboardCheck size={14} /> Update</button>
              <button type="button" onClick={() => selectedCampaign && void runApiAction("Campaign scheduled", async () => {
                await scheduleBroadcastCampaign(selectedCampaign.id, { scheduleAt: campaignForm.scheduleAt });
                return "Campaign scheduled through API; no send was triggered";
              }, selectedCampaign.id)} disabled={working || !selectedCampaign}><CalendarClock size={14} /> Schedule</button>
              <button type="button" onClick={() => void previewSelected()} disabled={working || !selectedCampaign}><Eye size={14} /> Audience Preview</button>
              <button type="button" onClick={() => selectedCampaign && void runApiAction("Send test logged", async () => {
                const result = await sendBroadcastTest(selectedCampaign.id, { platform: campaignForm.channelPlatform, payloadJson: { source: "ui" } });
                return `Send test created ${result.created} safe log(s)`;
              }, selectedCampaign.id)} disabled={working || !selectedCampaign}><ClipboardCheck size={14} /> Send Test</button>
              <button type="button" onClick={() => selectedCampaign && void runApiAction("Send now logged", async () => {
                const result = await sendBroadcastNow(selectedCampaign.id, { platform: campaignForm.channelPlatform, channelAccountId: campaignForm.channelAccountId.trim() || null });
                return `Send now created ${result.created} safe mock log(s)`;
              }, selectedCampaign.id)} disabled={working || !selectedCampaign}><Send size={14} /> Send Now</button>
            </div>
          </section>

          <section className="broadcastPanel">
            <div className="blockHeader"><Search size={18} /><h2>API segment editor</h2></div>
            <div className="broadcastFormGrid compact">
              <label>Name<input value={segmentForm.name} onChange={(event) => setSegmentForm({ ...segmentForm, name: event.target.value })} /></label>
              <label>Description<input value={segmentForm.description} onChange={(event) => setSegmentForm({ ...segmentForm, description: event.target.value })} /></label>
              <label>Field<select value={segmentForm.field} onChange={(event) => setSegmentForm({ ...segmentForm, field: event.target.value as BroadcastSegmentRule["field"] })}>{ruleFields.map((field) => <option key={field} value={field}>{field}</option>)}</select></label>
              <label>Operator<select value={segmentForm.operator} onChange={(event) => setSegmentForm({ ...segmentForm, operator: event.target.value as BroadcastSegmentRule["operator"] })}>{operators.map((operator) => <option key={operator} value={operator}>{operator}</option>)}</select></label>
              <label>Value<input value={segmentForm.value} onChange={(event) => setSegmentForm({ ...segmentForm, value: event.target.value })} /></label>
            </div>
            <div className="broadcastActionRow">
              <button type="button" onClick={() => void runApiAction("Segment created", async () => {
                const created = await createBroadcastSegment({ name: segmentForm.name, description: segmentForm.description, rules: [draftRule()], estimatedCount: 0 });
                setSelectedSegmentId(created.id);
                setCampaignForm((current) => ({ ...current, segmentId: created.id }));
                return "Segment created through API";
              })} disabled={working}><Plus size={14} /> Create Segment</button>
              <button type="button" onClick={() => selectedSegmentId && void runApiAction("Segment updated", async () => {
                await updateBroadcastSegment(selectedSegmentId, { name: segmentForm.name, description: segmentForm.description, rules: [draftRule()] });
                return "Segment updated through API";
              })} disabled={working || !selectedSegmentId}><ClipboardCheck size={14} /> Update Segment</button>
              <button type="button" onClick={() => selectedSegmentId && void runApiAction("Segment deleted", async () => {
                await deleteBroadcastSegment(selectedSegmentId);
                return "Segment deleted through API";
              })} disabled={working || !selectedSegmentId}>Delete Segment</button>
            </div>
            <div className="miniList">
              {segments.map((segment) => <p key={segment.id}><button type="button" onClick={() => selectSegment(segment)}>{segment.name}</button> / {segment.estimatedCount} estimated</p>)}
            </div>
          </section>

          <section className="broadcastPanel">
            <div className="blockHeader"><ClipboardCheck size={18} /><h2>Selected send logs</h2></div>
            <div className="miniList">
              {selectedLogs.slice(0, 10).map((log) => <p key={log.id}>{log.status} / {log.platform} / {log.reason ?? "-"}</p>)}
              {selectedLogs.length === 0 && <p>No send logs returned for selected campaign.</p>}
            </div>
          </section>
        </section>

        <section className="broadcastPanel previewPanel">
          <div className="blockHeader"><Eye size={18} /><h2>API audience preview and send logs</h2></div>
          <div className="analyticsTableWrap">
            <table className="analyticsTable">
              <thead><tr><th>Contact</th><th>Platform</th><th>Channel account</th><th>Tags</th><th>Lead</th><th>Rendered message</th><th>Reason</th></tr></thead>
              <tbody>
                {preview.map((recipient) => (
                  <tr key={`${recipient.contactId}-${recipient.contactIdentityId ?? "none"}`}>
                    <td>{recipient.displayName}</td>
                    <td>{recipient.platform}</td>
                    <td>{recipient.channelAccountId ?? "-"}</td>
                    <td>{recipient.tags.join(", ")}</td>
                    <td>{recipient.leadStatus}</td>
                    <td>{recipient.renderedMessage}</td>
                    <td>{recipient.reason ?? "-"}</td>
                  </tr>
                ))}
                {preview.length === 0 && <tr><td colSpan={7}>No API preview recipients loaded.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="deliveryGrid">
            <section>
              <strong>Recent API send logs</strong>
              <div className="miniList">{sendLogs.slice(0, 8).map((log) => <p key={log.id}>{log.status} / {log.campaignId} / {log.reason ?? "-"}</p>)}</div>
            </section>
            <section>
              <strong>API mode note</strong>
              <p>Refresh reloads persisted backend data only. API errors are shown above and do not load mock campaigns.</p>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="miniStat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseRuleValue(value: string, field: BroadcastSegmentRule["field"]) {
  if (field === "hasOpenTask") return value === "true";
  if (field === "lastSeenDays") return Number(value);
  if (value.includes(",")) return splitList(value);
  return value;
}
