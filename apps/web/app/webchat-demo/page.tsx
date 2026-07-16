"use client";

import { Bot, MessageCircle, Paperclip, Send, Sparkles, Trash2, UserRoundCheck, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createKnowledgeAwareMockAiDecision, validateMediaUpload } from "@ai-omni/shared";
import { createWebchatMessage, getConversationMessages } from "../api-client";
import { getStoredKnowledgeItems, subscribeStoredKnowledgeItems } from "../ai-knowledge-store";
import { getApiBaseUrl, isApiMode, isMockMode } from "../data-mode";
import {
  appendStoredDemoMessage,
  getStoredDemoMessages,
  mapApiMessageToChatMessage,
  saveStoredDemoMessages,
  subscribeStoredDemoMessages,
  type ChatAttachment,
  type ChatMessage
} from "../inbox-data";

const visitorPrompts = [
  "สนใจแพ็กเกจสำหรับทีมขายครับ",
  "อยากดู demo ระบบรวมแชท",
  "ขอให้แอดมินติดต่อกลับหน่อยครับ"
];
const apiConversationStorageKey = "ai-omni-webchat-demo-api-conversation-id";

export default function WebchatDemoPage() {
  const apiMode = isApiMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [aiDraft, setAiDraft] = useState("AI draft mock: แนะนำให้แอดมินทักทายและถามความต้องการของลูกค้า");
  const [apiConversationId, setApiConversationId] = useState("");
  const [apiError, setApiError] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<ChatAttachment[]>([]);
  const attachInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isMockMode()) return;
    const updateAiDraft = (nextMessages: ChatMessage[]) => {
      const latestCustomerText = [...nextMessages].reverse().find((message) => message.sender === "customer")?.body ?? "";
      const decision = createKnowledgeAwareMockAiDecision(latestCustomerText, getStoredKnowledgeItems());
      setAiDraft(decision.matchedKnowledge?.[0] ? `AI draft mock from KB: ${decision.reply}` : "AI draft mock: แนะนำให้แอดมินทักทายและถามความต้องการของลูกค้า");
    };
    const initialMessages = getStoredDemoMessages();
    setMessages(initialMessages);
    updateAiDraft(initialMessages);
    const unsubscribeMessages = subscribeStoredDemoMessages((nextMessages) => {
      setMessages(nextMessages);
      updateAiDraft(nextMessages);
    });
    const unsubscribeKnowledge = subscribeStoredKnowledgeItems(() => updateAiDraft(getStoredDemoMessages()));
    return () => {
      unsubscribeMessages();
      unsubscribeKnowledge();
    };
  }, []);

  useEffect(() => {
    if (!apiMode) return;
    const storedConversationId = window.localStorage.getItem(apiConversationStorageKey) ?? "";
    setApiConversationId(storedConversationId);
    if (!storedConversationId) return;

    const loadMessages = () => {
      void getConversationMessages(storedConversationId)
        .then((items) => {
          setMessages(items.map(mapApiMessageToChatMessage));
          setApiError("");
        })
        .catch((error) => setApiError(readableApiError(error)));
    };

    loadMessages();

    // Poll baseline keeps the widget correct even if realtime is unavailable
    // (e.g. SSE disabled, or admin replies while provider outbound is off).
    const timer = window.setInterval(loadMessages, 2500);

    // Realtime accelerator: the worker publishes webchat replies over Redis
    // pub/sub, the API relays them via SSE, and we refresh immediately so the
    // customer sees admin/AI replies without waiting for the next poll.
    let source: EventSource | undefined;
    if (typeof window !== "undefined" && typeof window.EventSource !== "undefined") {
      try {
        source = new EventSource(`${getApiBaseUrl()}/webchat/stream/${encodeURIComponent(storedConversationId)}`);
        source.addEventListener("message", () => loadMessages());
      } catch {
        source = undefined;
      }
    }

    return () => {
      window.clearInterval(timer);
      source?.close();
    };
  }, [apiMode]);

  function handleAttach(files: FileList | null) {
    if (!files || files.length === 0) return;
    setApiError("");
    const next: ChatAttachment[] = [];
    for (const file of Array.from(files)) {
      const check = validateMediaUpload({ mimeType: file.type, sizeBytes: file.size, filename: file.name });
      if (!check.ok) {
        setApiError(check.reason);
        continue;
      }
      next.push({
        id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: check.type,
        url: URL.createObjectURL(file),
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size
      });
    }
    if (next.length > 0) setDraftAttachments((current) => [...current, ...next]);
  }

  function removeDraftAttachment(id: string) {
    setDraftAttachments((current) => current.filter((item) => item.id !== id));
  }

  async function sendVisitorMessage(text = draft.trim()) {
    if (!text && draftAttachments.length === 0) return;
    if (apiMode) {
      try {
        const result = await createWebchatMessage({
          visitorId: "visitor-demo",
          sessionId: apiConversationId || "webchat-demo-session",
          messageId: `webchat-demo-${Date.now()}`,
          text,
          timestamp: new Date().toISOString(),
          name: "Visitor Demo"
        });
        setApiConversationId(result.conversationId);
        window.localStorage.setItem(apiConversationStorageKey, result.conversationId);
        const nextMessages = await getConversationMessages(result.conversationId);
        setMessages(nextMessages.map(mapApiMessageToChatMessage));
        setApiError("");
      } catch (error) {
        setApiError(readableApiError(error));
      }
      setDraft("");
      setDraftAttachments([]);
      return;
    }
    appendStoredDemoMessage("customer", text, draftAttachments.length > 0 ? draftAttachments : undefined);
    setDraft("");
    setDraftAttachments([]);
  }

  function resetDemo() {
    if (apiMode) {
      setMessages([]);
      setApiConversationId("");
      window.localStorage.removeItem(apiConversationStorageKey);
      return;
    }
    saveStoredDemoMessages([]);
  }

  return (
    <main className="widgetDemoPage">
      <section className="demoIntro">
        <div>
          <p className="eyebrow">Webchat Demo</p>
          <h1>Visitor Demo</h1>
          <p className="demoCopy">{apiMode ? "API mode posts visitor messages to the backend and polls for agent replies." : "Local demo mode uses browser storage only. Send a visitor message here, then open Inbox and select Webchat / Main Website."}</p>
        </div>
        <div className="indicatorRow">
          <span><Wifi size={14} /> Webchat connected</span>
          <span><Sparkles size={14} /> {apiMode ? "API mode" : "Demo mode"}</span>
          <span><MessageCircle size={14} /> Visitor online</span>
        </div>
      </section>

      <section className="floatingWidget" aria-label="Webchat demo widget">
        <header className="widgetHeader">
          <div className="widgetAvatar">VD</div>
          <div>
            <h2>Visitor Demo</h2>
            <p>Main Website webchat</p>
          </div>
        </header>

        <div className="widgetIndicators">
          <span>Webchat connected</span>
          <span>{apiMode ? "API mode" : "Demo mode"}</span>
          <span>Visitor online</span>
        </div>

        {apiError && <div className="collisionBanner"><Wifi size={14} /> {apiError}</div>}

        <div className="widgetMessages">
          {messages.length === 0 ? (
            <div className="widgetEmpty">
              <Bot size={20} />
              <strong>ยังไม่มีข้อความ</strong>
              <p>พิมพ์ข้อความแรกเพื่อสร้าง conversation ใน Inbox</p>
            </div>
          ) : (
            messages.map((message) => <WidgetBubble key={message.id} message={message} />)
          )}
          <WidgetBubble
            message={{
              id: "ai-draft-demo",
              sender: "ai_draft",
              body: aiDraft,
              time: "Demo"
            }}
          />
        </div>

        <div className="visitorPrompts">
          {visitorPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => sendVisitorMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        {draftAttachments.length > 0 ? (
          <div className="composerAttachments" aria-label="Pending attachments">
            {draftAttachments.map((item) => (
              <div key={item.id} className="composerAttachmentChip">
                {item.type === "image" && item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.filename ?? "image"} className="composerAttachmentThumb" />
                ) : (
                  <Paperclip size={14} />
                )}
                <span className="composerAttachmentName">{item.filename}</span>
                <button
                  type="button"
                  className="composerAttachmentRemove"
                  onClick={() => removeDraftAttachment(item.id)}
                  aria-label={`Remove ${item.filename}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <footer className="widgetComposer">
          <input
            ref={attachInputRef}
            type="file"
            accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
            multiple
            hidden
            onChange={(event) => {
              handleAttach(event.target.files);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className="composerAttachButton"
            onClick={() => attachInputRef.current?.click()}
            aria-label="Attach file or image"
            title="Attach file or image"
          >
            <Paperclip size={16} />
          </button>
          <input
            aria-label="Visitor message"
            placeholder="พิมพ์ข้อความถึงแอดมิน"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendVisitorMessage();
            }}
          />
          <button type="button" onClick={() => sendVisitorMessage()} aria-label="Send visitor message">
            <Send size={16} />
          </button>
        </footer>
        <button className="resetDemoButton" type="button" onClick={resetDemo}>Reset demo chat</button>
      </section>
    </main>
  );
}

function readableApiError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "API request failed. Check that the backend server is running and NEXT_PUBLIC_API_BASE_URL is correct.";
}

function WidgetBubble({ message }: { message: ChatMessage }) {
  const attachments = message.attachments ?? [];
  return (
    <article className={`widgetBubble ${message.sender}`}>
      <div className="messageMeta">
        {message.sender === "customer" && <MessageCircle size={13} />}
        {message.sender === "agent" && <UserRoundCheck size={13} />}
        {(message.sender === "ai" || message.sender === "ai_draft") && <Bot size={13} />}
        <span>{message.sender}</span>
        <time>{message.time}</time>
      </div>
      {message.body ? <p>{message.body}</p> : null}
      {attachments.length > 0 ? (
        <div className="messageAttachments">
          {attachments.map((attachment) =>
            attachment.type === "image" && attachment.url ? (
              <a key={attachment.id} className="messageImageLink" href={attachment.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachment.url} alt={attachment.filename ?? "image"} loading="lazy" />
              </a>
            ) : attachment.type === "audio" && attachment.url ? (
              <audio key={attachment.id} className="messageAudio" src={attachment.url} controls preload="none" />
            ) : (
              <a
                key={attachment.id}
                className="messageFileLink"
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                download={attachment.filename}
              >
                <span className="messageFileChip">
                  <Paperclip size={14} />
                  <span className="messageFileName">{attachment.filename ?? "Attachment"}</span>
                </span>
              </a>
            )
          )}
        </div>
      ) : null}
    </article>
  );
}
