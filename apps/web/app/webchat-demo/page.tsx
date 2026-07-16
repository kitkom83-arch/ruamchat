"use client";

import { Bot, MessageCircle, Send, Sparkles, UserRoundCheck, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { createKnowledgeAwareMockAiDecision } from "@ai-omni/shared";
import { createWebchatMessage, getConversationMessages } from "../api-client";
import { getStoredKnowledgeItems, subscribeStoredKnowledgeItems } from "../ai-knowledge-store";
import { getApiBaseUrl, isApiMode, isMockMode } from "../data-mode";
import {
  appendStoredDemoMessage,
  getStoredDemoMessages,
  mapApiMessageToChatMessage,
  saveStoredDemoMessages,
  subscribeStoredDemoMessages,
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

  async function sendVisitorMessage(text = draft.trim()) {
    if (!text) return;
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
      return;
    }
    appendStoredDemoMessage("customer", text);
    setDraft("");
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

        <footer className="widgetComposer">
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
  return (
    <article className={`widgetBubble ${message.sender}`}>
      <div className="messageMeta">
        {message.sender === "customer" && <MessageCircle size={13} />}
        {message.sender === "agent" && <UserRoundCheck size={13} />}
        {(message.sender === "ai" || message.sender === "ai_draft") && <Bot size={13} />}
        <span>{message.sender}</span>
        <time>{message.time}</time>
      </div>
      <p>{message.body}</p>
    </article>
  );
}
