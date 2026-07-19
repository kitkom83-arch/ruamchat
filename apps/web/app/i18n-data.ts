"use client";

import { useCallback, useEffect, useState } from "react";

export type Lang = "th" | "en";

export const DEFAULT_LANG: Lang = "th";
export const langStorageKey = "ao.lang";

function isLang(value: unknown): value is Lang {
  return value === "th" || value === "en";
}

/** Read the persisted language (SSR-safe). Falls back to Thai. */
export function getStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(langStorageKey);
    return isLang(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

/** Persist the language and notify same-tab + cross-tab listeners. */
export function saveLang(lang: Lang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(langStorageKey, lang);
    window.dispatchEvent(new CustomEvent(langStorageKey, { detail: lang }));
  } catch {
    /* ignore storage access errors */
  }
}

/** Subscribe to language changes (both same-tab custom event and cross-tab storage). */
export function subscribeLang(callback: (lang: Lang) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handleCustom = (event: Event) => {
    const detail = (event as CustomEvent<Lang>).detail;
    if (isLang(detail)) callback(detail);
    else callback(getStoredLang());
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === langStorageKey) callback(getStoredLang());
  };
  window.addEventListener(langStorageKey, handleCustom as EventListener);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(langStorageKey, handleCustom as EventListener);
    window.removeEventListener("storage", handleStorage);
  };
}

type Entry = { th: string; en: string };

export const dictionary = {
  // ---- SideNav ----
  "nav.chat": { th: "แชท", en: "Chat" },
  "nav.analytics": { th: "วิเคราะห์", en: "Analytics" },
  "nav.contacts": { th: "ผู้ติดต่อ", en: "Contacts" },
  "nav.broadcasts": { th: "บรอดแคสต์", en: "Broadcasts" },
  "nav.ai": { th: "เอไอ", en: "AI" },
  "nav.flows": { th: "บอท/โฟลว์", en: "Bots / Flows" },
  "nav.webchat": { th: "ทดสอบแชท", en: "Webchat Demo" },
  "nav.settings": { th: "ตั้งค่า", en: "Settings" },
  "nav.logout": { th: "ออกจากระบบ", en: "Log out" },
  "nav.menuLabel": { th: "เมนูหลัก", en: "Main menu" },
  "nav.collapse": { th: "ยุบเมนู", en: "Collapse menu" },
  "nav.expand": { th: "ขยายเมนู", en: "Expand menu" },
  "nav.brandTagline": { th: "แพลตฟอร์มแชทออมนิแชนเนล", en: "Omnichannel chat platform" },
  "lang.toggle": { th: "สลับภาษา", en: "Switch language" },

  // ---- Chat / Inbox (page.tsx) ----
  "page.chat.eyebrow": { th: "ห้องแชท", en: "Inbox Rooms" },
  "page.chat.h1": { th: "ห้องแชททุกแพลตฟอร์ม", en: "Platform Rooms" },

  // ---- Analytics ----
  "page.analytics.eyebrow": { th: "แดชบอร์ดวิเคราะห์", en: "Analytics Dashboard" },
  "page.analytics.h1": {
    th: "ภาพรวม ประสิทธิภาพ AI และผลงานของแอดมิน",
    en: "Overview, AI performance, admin productivity"
  },
  "page.analytics.lead": {
    th: "ข้อมูลวิเคราะห์แบบจำลอง/ในเครื่อง สร้างจาก Inbox, CRM, เครื่องมือแอดมิน, SLA, บันทึกการตรวจสอบ และฐานความรู้",
    en: "Mock/local analytics generated from Inbox, CRM, Admin Tools, SLA, audit logs, and Knowledge Base data."
  },
  "page.analytics.h1Api": {
    th: "ข้อมูลวิเคราะห์จริงจาก backend API",
    en: "Persisted analytics from backend API"
  },
  "page.analytics.leadApi": {
    th: "โหมด API อ่านข้อมูลบทสนทนา ข้อความ สถานะ SLA งาน บันทึกการตรวจสอบ และจำนวนฐานความรู้ตามขอบเขต tenant",
    en: "API mode reads tenant-scoped persisted conversations, messages, SLA state, tasks, audit logs, and knowledge base counts."
  },

  // ---- Contacts ----
  "page.contacts.eyebrow": { th: "ระบบลูกค้าสัมพันธ์ (CRM)", en: "CRM" },
  "page.contacts.h1": { th: "ผู้ติดต่อ", en: "Contacts" },

  // ---- Broadcasts ----
  "page.broadcasts.eyebrow": { th: "แคมเปญบรอดแคสต์", en: "Broadcast Campaigns" },
  "page.broadcasts.h1": {
    th: "แคมเปญจำลอง การแบ่งกลุ่ม พรีวิว ดรายรัน และบันทึกการส่งในเครื่อง",
    en: "Mock campaigns, segmentation, preview, dry run, and local delivery events"
  },
  "page.broadcasts.lead": {
    th: "ขอบเขตแพลตฟอร์ม/บัญชี/ห้องแยกจากกัน การส่งแบบจำลองจะไม่เรียก API ภายนอก",
    en: "Platform/account/room scopes stay separated. Send Mock never calls external APIs."
  },
  "page.broadcasts.eyebrowApi": { th: "แคมเปญบรอดแคสต์ / โหมด API", en: "Broadcast Campaigns / API Mode" },
  "page.broadcasts.h1Api": {
    th: "แคมเปญ กลุ่มเป้าหมาย พรีวิว และบันทึกการส่งจำลองที่บันทึกไว้",
    en: "Persisted campaigns, segments, audience preview, and safe mock send logs"
  },
  "page.broadcasts.leadApi": {
    th: "โหมด API อ่านและเขียนข้อมูล backend การส่งทดสอบและส่งจริงจะสร้างบันทึกจำลองเท่านั้น",
    en: "API mode reads and writes backend data. Send test and send now create mock logs only."
  },

  // ---- AI Center ----
  "page.ai.eyebrow": { th: "ศูนย์เอไอ", en: "AI Center" },
  "page.ai.h1": { th: "ฐานความรู้", en: "Knowledge Base" },
  "page.ai.lead": {
    th: "จัดการข้อมูล demo ที่ AI ใช้ตอบลูกค้าใน Inbox และ Webchat โหมดจำลอง",
    en: "Manage demo data the AI uses to answer customers in Inbox and Webchat mock mode."
  },
  "page.ai.leadApi": {
    th: "โหมด backend API สำหรับฐานความรู้ เอกสาร ชิ้นส่วนข้อมูล และนโยบาย AI ของห้อง",
    en: "Backend API mode for knowledge bases, documents, chunks, and room AI policy."
  },

  // ---- Flows ----
  "page.flows.eyebrow": { th: "ตัวสร้างโฟลว์", en: "Flow Builder" },
  "page.flows.h1": {
    th: "กฎอัตโนมัติสำหรับห้องแยกตามแพลตฟอร์ม",
    en: "Automation rules for separated platform rooms"
  },
  "page.flows.lead": {
    th: "ตัวสร้างแบบจำลอง/ในเครื่องสำหรับ Webchat, Telegram, LINE, Facebook และ Instagram การทดสอบจะไม่เรียก API ภายนอก",
    en: "Mock/local builder for Webchat, Telegram, LINE, Facebook, and Instagram. Tests never call external APIs."
  },
  "page.flows.h1Api": {
    th: "กฎอัตโนมัติที่บันทึกไว้จาก backend API",
    en: "Persisted automation rules from backend API"
  },
  "page.flows.leadApi": {
    th: "โหมด API อ่านและเขียนโฟลว์ตามขอบเขต tenant การทดสอบเป็นแบบดรายรันเท่านั้น และไม่เรียก OpenAI หรือแพลตฟอร์มภายนอก",
    en: "API mode reads and writes tenant-scoped flows. Test runs are dry-run only and never call OpenAI or external platforms."
  },

  // ---- Webchat Demo ----
  "page.webchat.eyebrow": { th: "ทดสอบเว็บแชท", en: "Webchat Demo" },
  "page.webchat.h1": { th: "ทดสอบฝั่งผู้เยี่ยมชม", en: "Visitor Demo" },
  "page.webchat.lead": {
    th: "โหมดสาธิตในเครื่องใช้ที่เก็บข้อมูลของเบราว์เซอร์เท่านั้น ส่งข้อความผู้เยี่ยมชมที่นี่ แล้วเปิด Inbox เลือก Webchat / เว็บไซต์หลัก",
    en: "Local demo mode uses browser storage only. Send a visitor message here, then open Inbox and select Webchat / Main Website."
  },
  "page.webchat.leadApi": {
    th: "โหมด API ส่งข้อความผู้เยี่ยมชมไปยัง backend และดึงคำตอบของแอดมินมาแสดง",
    en: "API mode posts visitor messages to the backend and polls for agent replies."
  },

  // ---- Settings / Channels ----
  "page.settings.eyebrow": { th: "ตั้งค่า", en: "Settings" },
  "page.channels.h1": { th: "ช่องทาง", en: "Channels" },

  // ---- Settings / Channels / Telegram diagnostics ----
  "channels.telegram.section": { th: "การเชื่อมต่อบอท Telegram", en: "Telegram bot connection" },
  "channels.telegram.botLabel": { th: "บอทจริง", en: "Live bot" },
  "channels.telegram.botId": { th: "Bot ID", en: "Bot ID" },
  "channels.telegram.loadingBot": { th: "กำลังโหลดข้อมูลบอท…", en: "Loading bot info…" },
  "channels.telegram.botUnknown": { th: "ยังไม่ทราบข้อมูลบอท (ตั้งค่า token แล้วกดทดสอบ)", en: "Bot info unknown (set token then test)" },
  "channels.telegram.testButton": { th: "ทดสอบการเชื่อมต่อ", en: "Test connection" },
  "channels.telegram.testing": { th: "กำลังทดสอบ…", en: "Testing…" },
  "channels.telegram.setWebhookButton": { th: "ตั้ง webhook อัตโนมัติ", en: "Set webhook automatically" },
  "channels.telegram.settingWebhook": { th: "กำลังตั้ง webhook…", en: "Setting webhook…" },
  "channels.telegram.tokenOk": { th: "Token ถูกต้อง", en: "Token valid" },
  "channels.telegram.tokenFail": { th: "Token ไม่ถูกต้อง", en: "Token invalid" },
  "channels.telegram.webhookOk": { th: "Webhook ตรงกับระบบ", en: "Webhook matches" },
  "channels.telegram.webhookFail": { th: "Webhook ยังไม่ตรง", en: "Webhook mismatch" },
  "channels.telegram.expectedWebhook": { th: "URL ที่ระบบคาดหวัง", en: "Expected webhook URL" },
  "channels.telegram.currentWebhook": { th: "URL ปัจจุบัน", en: "Current webhook URL" },
  "channels.telegram.currentWebhookNone": { th: "ยังไม่ได้ตั้ง webhook", en: "No webhook set" },
  "channels.telegram.pendingUpdates": { th: "อัปเดตค้างส่ง", en: "Pending updates" },
  "channels.telegram.lastError": { th: "ข้อผิดพลาดล่าสุด", en: "Last error" },
  "channels.telegram.setWebhookOk": { th: "ตั้ง webhook สำเร็จ", en: "Webhook set successfully" },
  "channels.telegram.setWebhookFail": { th: "ตั้ง webhook ไม่สำเร็จ", en: "Failed to set webhook" },
  "channels.telegram.testFail": { th: "ทดสอบการเชื่อมต่อไม่สำเร็จ", en: "Connection test failed" },

  // ---- Settings sub-navigation tabs ----
  "settings.tab.channels": { th: "ช่องทาง", en: "Channels" },
  "settings.tab.team": { th: "จัดการผู้ใช้", en: "User Management" },
  "settings.tabs.aria": { th: "เมนูตั้งค่า", en: "Settings navigation" },

  // ---- Settings / Team ----
  "page.team.eyebrow": { th: "ตั้งค่าทีม", en: "Team Settings" },
  "page.team.h1": {
    th: "แอดมิน นโยบาย SLA และข้อความสำเร็จรูป",
    en: "Agents, SLA policies, canned replies"
  },

  // ---- Inbox page (phase 2) ----
  "inbox.common.loading": { th: "กำลังโหลด...", en: "Loading..." },
  "inbox.common.yes": { th: "ใช่", en: "Yes" },
  "inbox.common.no": { th: "ไม่", en: "No" },
  "inbox.val.all": { th: "ทั้งหมด", en: "all" },

  // Rooms rail
  "inbox.rooms.rail": { th: "ห้อง", en: "Rooms" },
  "inbox.rooms.search": { th: "ค้นหาห้อง", en: "Search room" },
  "inbox.rooms.conversations": { th: "บทสนทนา", en: "conversations" },
  "inbox.rooms.expand": { th: "ขยายห้องแพลตฟอร์ม", en: "Expand Platform Rooms" },
  "inbox.rooms.collapse": { th: "ยุบห้องแพลตฟอร์ม", en: "Collapse Platform Rooms" },
  "inbox.rooms.refresh": { th: "รีเฟรชห้อง", en: "Refresh mock rooms" },

  // Queue
  "inbox.queue.title": { th: "คิวบทสนทนา", en: "Conversation Queue" },
  "inbox.queue.rail": { th: "คิว", en: "Queue" },
  "inbox.queue.expand": { th: "ขยายคิวบทสนทนา", en: "Expand Conversation Queue" },
  "inbox.queue.collapse": { th: "ยุบคิวบทสนทนา", en: "Collapse Conversation Queue" },
  "inbox.queue.loadingApi": { th: "กำลังโหลดข้อมูล API...", en: "Loading API data..." },
  "inbox.queue.apiConnected": { th: "เชื่อมต่อโหมด API ผ่าน", en: "API mode connected via" },
  "inbox.queue.loadMore": { th: "โหลดเพิ่ม", en: "Load more" },
  "inbox.search.conversations": { th: "ค้นหาบทสนทนา", en: "Search conversations" },

  // Human / Bot tabs
  "inbox.tab.human": { th: "คน", en: "Human" },
  "inbox.tab.bot": { th: "บอท", en: "Bot" },

  // Filter chips
  "inbox.filter.all": { th: "ทั้งหมด", en: "All" },
  "inbox.filter.my": { th: "กล่องของฉัน", en: "My Inbox" },
  "inbox.filter.unassigned": { th: "ยังไม่มอบหมาย", en: "Unassigned" },
  "inbox.filter.sla_warning": { th: "เตือน SLA", en: "SLA Warning" },
  "inbox.filter.sla_breached": { th: "เกิน SLA", en: "SLA Breached" },
  "inbox.filter.ai_active": { th: "เอไอทำงาน", en: "AI Active" },
  "inbox.filter.need_human": { th: "ต้องใช้คน", en: "Need Human" },
  "inbox.filter.unread": { th: "ยังไม่อ่าน", en: "Unread" },
  "inbox.filter.unreplied": { th: "ยังไม่ตอบ", en: "Unreplied" },
  "inbox.filter.follow_up": { th: "ติดตาม", en: "Follow Up" },
  "inbox.filter.closed": { th: "ปิดแล้ว", en: "Closed" },
  "inbox.filter.spam": { th: "สแปม", en: "Spam" },

  // Queue select filters
  "inbox.select.agent": { th: "แอดมิน", en: "Agent" },
  "inbox.select.allAgents": { th: "แอดมินทั้งหมด", en: "All agents" },
  "inbox.select.status": { th: "สถานะ", en: "Status" },
  "inbox.select.priority": { th: "ความสำคัญ", en: "Priority" },
  "inbox.select.read": { th: "การอ่าน", en: "Read" },
  "inbox.select.sort": { th: "เรียงลำดับ", en: "Sort" },
  "inbox.read.unread": { th: "ยังไม่อ่าน", en: "unread" },
  "inbox.read.read": { th: "อ่านแล้ว", en: "read" },
  "inbox.sort.latestDesc": { th: "ล่าสุดก่อน", en: "latest first" },
  "inbox.sort.latestAsc": { th: "เก่าสุดก่อน", en: "latest last" },
  "inbox.sort.updatedDesc": { th: "อัปเดตล่าสุดก่อน", en: "updated first" },
  "inbox.sort.updatedAsc": { th: "อัปเดตเก่าสุดก่อน", en: "updated last" },

  // Status / priority / sla / ai display values
  "inbox.status.open": { th: "เปิด", en: "open" },
  "inbox.status.pending": { th: "รอดำเนินการ", en: "pending" },
  "inbox.status.follow_up": { th: "ติดตาม", en: "follow up" },
  "inbox.status.resolved": { th: "แก้ไขแล้ว", en: "resolved" },
  "inbox.status.closed": { th: "ปิดแล้ว", en: "closed" },
  "inbox.status.spam": { th: "สแปม", en: "spam" },
  "inbox.priority.low": { th: "ต่ำ", en: "low" },
  "inbox.priority.medium": { th: "กลาง", en: "medium" },
  "inbox.priority.high": { th: "สูง", en: "high" },
  "inbox.priority.urgent": { th: "ด่วน", en: "urgent" },
  "inbox.sla.ok": { th: "ปกติ", en: "ok" },
  "inbox.sla.warning": { th: "เตือน", en: "warning" },
  "inbox.sla.breached": { th: "เกิน", en: "breached" },
  "inbox.ai.off": { th: "ปิดเอไอ", en: "AI Off" },
  "inbox.ai.suggest": { th: "แนะนำ", en: "Suggest" },
  "inbox.ai.active": { th: "เอไอทำงาน", en: "AI Active" },
  "inbox.ai.needHuman": { th: "ต้องใช้คน", en: "Need Human" },
  "inbox.ai.humanTaken": { th: "คนรับช่วง", en: "Human Taken" },
  "inbox.ai.closed": { th: "ปิดแล้ว", en: "Closed" },

  // Empty states
  "inbox.empty.noConversations": { th: "ไม่มีบทสนทนาในมุมมองนี้", en: "No conversations in this view" },
  "inbox.empty.webchatBody": {
    th: "เปิด /webchat-demo แล้วส่งข้อความผู้เยี่ยมชมเพื่อสร้างบทสนทนาทดสอบ Webchat",
    en: "Open /webchat-demo and send a visitor message to create a Webchat demo conversation."
  },
  "inbox.empty.roomHasNo": { th: "ไม่มีบทสนทนา", en: "has no" },
  "inbox.empty.convFor": { th: "สำหรับตัวกรอง", en: "conversations for" },
  "inbox.empty.selectConversation": { th: "เลือกบทสนทนา", en: "Select a conversation" },
  "inbox.empty.selectConversationBody": {
    th: "รายการบทสนทนาจะจำกัดตามห้องแพลตฟอร์มและบัญชีที่เลือก",
    en: "Conversation list is scoped to the selected platform room and account."
  },

  // Chat header + collision
  "inbox.chat.noConversationSelected": { th: "ยังไม่ได้เลือกบทสนทนา", en: "No conversation selected" },
  "inbox.chat.unassigned": { th: "ยังไม่มอบหมาย", en: "Unassigned" },
  "inbox.chat.softWarning": { th: "การแจ้งเตือนแบบซอฟต์", en: "Soft warning" },
  "inbox.chat.lockedByAssignment": { th: "ล็อกโดยการมอบหมาย", en: "Locked by assignment" },

  // Action buttons
  "inbox.action.takeOver": { th: "รับช่วงต่อ", en: "Take Over" },
  "inbox.action.returnToAi": { th: "คืนให้เอไอ", en: "Return to AI" },
  "inbox.action.assignToMe": { th: "มอบหมายให้ฉัน", en: "Assign to Me" },
  "inbox.action.unassign": { th: "ยกเลิกมอบหมาย", en: "Unassign" },
  "inbox.action.followUp": { th: "ติดตาม", en: "Follow Up" },
  "inbox.action.resolved": { th: "แก้ไขแล้ว", en: "Resolved" },
  "inbox.action.reopen": { th: "เปิดใหม่", en: "Reopen" },
  "inbox.action.read": { th: "อ่านแล้ว", en: "Read" },
  "inbox.action.replied": { th: "ตอบแล้ว", en: "Replied" },
  "inbox.action.slaSoon": { th: "ใกล้ครบ SLA", en: "SLA Soon" },
  "inbox.action.createTask": { th: "สร้างงาน", en: "Create Task" },
  "inbox.action.addNote": { th: "เพิ่มโน้ต", en: "Add Note" },
  "inbox.action.copySummary": { th: "คัดลอกสรุป", en: "Copy Summary" },
  "inbox.action.assign": { th: "มอบหมาย", en: "Assign" },
  "inbox.action.transfer": { th: "โอนย้าย", en: "Transfer" },

  // Composer
  "inbox.composer.searchCanned": { th: "ค้นหาข้อความสำเร็จรูป", en: "Search canned replies" },
  "inbox.composer.cannedCategory": { th: "หมวดหมู่ข้อความสำเร็จรูป", en: "Canned reply category" },
  "inbox.composer.allCategories": { th: "ทุกหมวดหมู่", en: "All categories" },
  "inbox.composer.general": { th: "ทั่วไป", en: "General" },
  "inbox.composer.sales": { th: "การขาย", en: "Sales" },
  "inbox.composer.support": { th: "ซัพพอร์ต", en: "Support" },
  "inbox.composer.reply": { th: "ตอบในบัญชีห้องที่เลือก", en: "Reply in the selected room account" },
  "inbox.composer.send": { th: "ส่ง", en: "Send" },
  "inbox.composer.sending": { th: "กำลังส่ง...", en: "Sending..." },
  "inbox.composer.uploading": { th: "กำลังอัปโหลด...", en: "Uploading..." },
  "inbox.composer.attach": { th: "แนบไฟล์หรือรูปภาพ", en: "Attach file or image" },
  "inbox.composer.remove": { th: "ลบ", en: "Remove" },
  "inbox.composer.sendFailed": { th: "ส่งไม่สำเร็จ", en: "Send failed" },
  "inbox.composer.cannedError": { th: "ข้อผิดพลาด API ข้อความสำเร็จรูป", en: "Canned replies API error" },
  "inbox.composer.noCanned": { th: "ไม่มีข้อความสำเร็จรูปที่บันทึกไว้", en: "No persisted canned replies" },

  // Customer rail + panel
  "inbox.customer.rail": { th: "ลูกค้า", en: "Customer" },
  "inbox.customer.expand": { th: "ขยายแผงลูกค้า", en: "Expand Customer panel" },
  "inbox.customer.collapse": { th: "ยุบแผงลูกค้า", en: "Collapse Customer panel" },
  "inbox.customer.title": { th: "ลูกค้า 360", en: "Customer 360" },
  "inbox.customer.noSelected": { th: "ยังไม่ได้เลือกลูกค้า", en: "No customer selected" },
  "inbox.customer.noSelectedBody": {
    th: "เลือกบทสนทนาเพื่อดูข้อมูลลูกค้า 360 และบริบทเอไอ",
    en: "Select a conversation to see Customer 360 and AI context."
  },
  "inbox.customer.loadingTitle": { th: "กำลังโหลดลูกค้า 360", en: "Loading Customer 360" },
  "inbox.customer.loadingBody": {
    th: "กำลังดึงข้อมูลผู้ติดต่อและตัวตนจาก API",
    en: "Fetching persisted contact and identity data from the API."
  },
  "inbox.customer.errorTitle": { th: "ข้อผิดพลาด API ลูกค้า 360", en: "Customer 360 API error" },
  "inbox.customer.name": { th: "ชื่อ", en: "Name" },
  "inbox.customer.email": { th: "อีเมล", en: "Email" },
  "inbox.customer.phone": { th: "เบอร์โทร", en: "Phone" },
  "inbox.customer.owner": { th: "เจ้าของ", en: "Owner" },
  "inbox.customer.priority": { th: "ความสำคัญ", en: "Priority" },
  "inbox.customer.noSla": { th: "ไม่มี SLA", en: "No SLA" },
  "inbox.customer.status": { th: "สถานะ", en: "Status" },
  "inbox.customer.leadStatus": { th: "สถานะลูกค้าเป้าหมาย", en: "Lead status" },
  "inbox.customer.openFullContact": { th: "เปิดข้อมูลลูกค้าเต็ม", en: "Open Full Contact" },
  "inbox.customer.linkIdentity": { th: "เชื่อมตัวตน", en: "Link Identity" },
  "inbox.customer.createNewContact": { th: "สร้างผู้ติดต่อใหม่", en: "Create New Contact" },
  "inbox.customer.unlinkIdentity": { th: "ยกเลิกเชื่อมตัวตน", en: "Unlink Identity" },
  "inbox.customer.setPrimary": { th: "ตั้งเป็นหลัก", en: "Set Primary" },
  "inbox.customer.setFollowUp": { th: "ตั้งการติดตาม", en: "Set Follow Up" },

  // Broadcast history block
  "inbox.bcast.title": { th: "ประวัติบรอดแคสต์", en: "Broadcast history" },
  "inbox.bcast.optOut": { th: "ยกเลิกรับข่าว", en: "Opt-out" },
  "inbox.bcast.lastCampaign": { th: "แคมเปญล่าสุด", en: "Last campaign" },
  "inbox.bcast.externalCalls": { th: "การเรียกภายนอก", en: "External calls" },
  "inbox.bcast.allow": { th: "อนุญาตบรอดแคสต์", en: "Allow broadcast" },
  "inbox.bcast.optOutBtn": { th: "ยกเลิกรับบรอดแคสต์", en: "Opt out broadcast" },
  "inbox.bcast.note": {
    th: "ข้อมูลความยินยอมและประวัติบรอดแคสต์โหลดจาก API สำหรับ tenant นี้ การส่งออกของผู้ให้บริการยังปิดอยู่",
    en: "Broadcast consent and history are loaded from the API for this tenant. Provider outbound remains disabled."
  },
  "inbox.bcast.noneApi": { th: "ยังไม่มีประวัติบรอดแคสต์จาก API", en: "No persisted API broadcast history yet" },
  "inbox.bcast.none": { th: "ยังไม่มีประวัติบรอดแคสต์", en: "No broadcast history yet" },

  // Quick actions block
  "inbox.quick.title": { th: "การทำงานด่วน", en: "Quick actions" },
  "inbox.quick.markFollowUp": { th: "ทำเครื่องหมายติดตาม", en: "Mark Follow Up" },
  "inbox.quick.markResolved": { th: "ทำเครื่องหมายแก้ไขแล้ว", en: "Mark Resolved" },
  "inbox.quick.markRead": { th: "ทำเครื่องหมายอ่านแล้ว", en: "Mark Read" },
  "inbox.quick.markReplied": { th: "ทำเครื่องหมายตอบแล้ว", en: "Mark Replied" },
  "inbox.quick.slaDueSoon": { th: "SLA ใกล้ครบ", en: "SLA Due Soon" },

  // Mini analytics
  "inbox.mini.title": { th: "วิเคราะห์ย่อ", en: "Mini analytics" },
  "inbox.mini.conversations": { th: "บทสนทนา", en: "Conversations" },
  "inbox.mini.lastResponse": { th: "ตอบกลับล่าสุด", en: "Last response" },
  "inbox.mini.currentSla": { th: "SLA ปัจจุบัน", en: "Current SLA" },
  "inbox.mini.aiConfidence": { th: "ความมั่นใจเอไอ", en: "AI confidence" },
  "inbox.mini.handoffHistory": { th: "ประวัติการส่งต่อ", en: "Handoff history" },

  // Linked identities / tags
  "inbox.identities.title": { th: "ตัวตนที่เชื่อม", en: "Linked identities" },
  "inbox.tags.title": { th: "แท็ก", en: "Tags" },
  "inbox.tags.addVip": { th: "เพิ่มแท็ก vip", en: "Add vip tag" },

  // Internal notes
  "inbox.notes.title": { th: "โน้ตภายใน", en: "Internal notes" },
  "inbox.notes.placeholder": { th: "เขียนโน้ตภายใน...", en: "Write an internal note..." },
  "inbox.notes.team": { th: "ทีม", en: "Team" },
  "inbox.notes.supervisor": { th: "หัวหน้างาน", en: "Supervisor" },
  "inbox.notes.pin": { th: "ปักหมุด", en: "Pin" },
  "inbox.notes.edit": { th: "แก้ไข", en: "Edit" },
  "inbox.notes.delete": { th: "ลบ", en: "Delete" },
  "inbox.notes.loadingWorkflow": { th: "กำลังโหลดข้อมูลเวิร์กโฟลว์...", en: "Loading workflow data..." },

  // Open tasks
  "inbox.openTasks.title": { th: "งานที่เปิดอยู่", en: "Open tasks" },
  "inbox.openTasks.none": { th: "ไม่มีงานที่เปิดอยู่", en: "No open tasks" },
  "inbox.openTasks.markFirstDone": { th: "ทำงานแรกให้เสร็จ", en: "Mark first task done" },

  // Related conversations
  "inbox.related.title": { th: "บทสนทนาที่เกี่ยวข้อง", en: "Related conversations" },
  "inbox.related.none": { th: "ยังไม่มีบทสนทนาที่เชื่อมโยง", en: "No linked conversations yet" },

  // Audit log / status history
  "inbox.audit.title": { th: "บันทึกการตรวจสอบ", en: "Audit log" },
  "inbox.audit.error": { th: "ข้อผิดพลาด API บันทึกการตรวจสอบ", en: "Audit log API error" },
  "inbox.audit.none": { th: "ยังไม่มีบันทึกการตรวจสอบ", en: "No audit logs yet" },
  "inbox.statusHistory.title": { th: "ประวัติสถานะ", en: "Status history" },
  "inbox.statusHistory.error": { th: "ข้อผิดพลาด API ประวัติสถานะ", en: "Status history API error" },
  "inbox.statusHistory.none": { th: "ยังไม่มีการเปลี่ยนสถานะ", en: "No status changes yet" },

  // Matching automations
  "inbox.autom.title": { th: "ระบบอัตโนมัติที่ตรงกัน", en: "Matching Automations" },
  "inbox.autom.allScoped": { th: "ทุกห้องในขอบเขต", en: "all scoped rooms" },
  "inbox.autom.runFlow": { th: "รันโฟลว์", en: "Run Flow" },
  "inbox.autom.viewFlow": { th: "ดูโฟลว์", en: "View Flow" },
  "inbox.autom.noMatch": {
    th: "ไม่มีระบบอัตโนมัติที่ตรงกับบทสนทนานี้",
    en: "No active automation matches this selected conversation."
  },
  "inbox.autom.recentRuns": { th: "การรันโฟลว์ล่าสุด", en: "Recent Flow Runs" },
  "inbox.autom.noRecent": {
    th: "ไม่มีการรันโฟลว์ล่าสุดของบทสนทนานี้",
    en: "No recent flow runs for this conversation"
  },
  "inbox.autom.lastSteps": { th: "ขั้นตอนการรันล่าสุด", en: "Last run steps" },
  "inbox.autom.steps": { th: "ขั้นตอน", en: "steps" },
  "inbox.autom.auditCreated": { th: "บันทึกการตรวจสอบที่สร้าง", en: "Audit logs created" },

  // AI Summary
  "inbox.aiSummary.title": { th: "สรุปโดยเอไอ", en: "AI Summary" },
  "inbox.aiSummary.loading": { th: "กำลังโหลดคำแนะนำเอไอจาก API...", en: "Loading AI suggestion from API..." },
  "inbox.aiSummary.errorTitle": { th: "ข้อผิดพลาด API คำแนะนำเอไอ", en: "AI suggestion API error" },
  "inbox.aiSummary.decision": { th: "การตัดสินใจเอไอ", en: "AI Decision" },
  "inbox.aiSummary.intent": { th: "เจตนา", en: "Intent" },
  "inbox.aiSummary.confidence": { th: "ความมั่นใจ", en: "Confidence" },
  "inbox.aiSummary.riskLevel": { th: "ระดับความเสี่ยง", en: "Risk level" },
  "inbox.aiSummary.nextAction": { th: "การดำเนินการถัดไป", en: "Next action" },
  "inbox.aiSummary.suggestedReply": { th: "คำตอบที่แนะนำ", en: "Suggested reply" },
  "inbox.aiSummary.requiresHuman": { th: "ต้องใช้คน", en: "Requires human" },
  "inbox.aiSummary.externalCalls": { th: "การเรียกภายนอก", en: "External calls" },
  "inbox.aiSummary.knowledgeSources": { th: "แหล่งความรู้", en: "Knowledge Sources" },
  "inbox.aiSummary.noKnowledge": { th: "ไม่มีความรู้ที่ตรงกัน", en: "No active knowledge matched." },
  "inbox.aiSummary.viewSource": { th: "ดูแหล่งข้อมูล", en: "View Source" },
  "inbox.aiSummary.copySuggested": { th: "คัดลอกคำตอบที่แนะนำ", en: "Copy Suggested Reply" },
  "inbox.aiSummary.useDraft": { th: "ใช้ร่างเอไอ", en: "Use AI Draft" },
  "inbox.aiSummary.markWrong": { th: "ทำเครื่องหมายว่าผิด", en: "Mark as Wrong" },
  "inbox.aiSummary.regenerate": { th: "สร้างร่างใหม่", en: "Regenerate Draft" },

  // Task dashboard
  "inbox.task.title": { th: "แดชบอร์ดงาน", en: "Task Dashboard" },
  "inbox.task.openWord": { th: "เปิด", en: "open" },
  "inbox.task.completedWord": { th: "เสร็จ", en: "completed" },
  "inbox.task.refresh": { th: "รีเฟรชแดชบอร์ดงาน", en: "Refresh task dashboard" },
  "inbox.task.due": { th: "กำหนดส่ง", en: "Due" },
  "inbox.task.assignee": { th: "ผู้รับผิดชอบ", en: "Assignee" },
  "inbox.due.due": { th: "ครบกำหนด", en: "due" },
  "inbox.due.dueSoon": { th: "ใกล้ครบ", en: "due soon" },
  "inbox.due.overdue": { th: "เกินกำหนด", en: "overdue" },
  "inbox.due.upcoming": { th: "กำลังจะถึง", en: "upcoming" },
  "inbox.due.followUp": { th: "ติดตาม", en: "follow-up" },
  "inbox.task.apiError": { th: "ข้อผิดพลาด API งาน", en: "Task API error" },
  "inbox.task.loadingPersisted": { th: "กำลังโหลดงานที่บันทึกไว้...", en: "Loading persisted tasks..." },
  "inbox.task.noPersisted": { th: "ไม่มีงานที่บันทึกไว้", en: "No persisted tasks returned" },
  "inbox.task.noLocal": { th: "ไม่มีงานในเครื่องในมุมมองนี้", en: "No local tasks in this view" },
  "inbox.task.noDue": { th: "ไม่มีวันครบกำหนด", en: "No due date" },
  "inbox.task.priorityPrefix": { th: "ความสำคัญ", en: "Priority" },
  "inbox.task.dueDate": { th: "วันครบกำหนด", en: "Due date" },
  "inbox.task.clear": { th: "ล้าง", en: "Clear" },
  "inbox.task.open": { th: "เปิด", en: "Open" },
  "inbox.task.done": { th: "เสร็จสิ้น", en: "Done" },
  "inbox.task.saving": { th: "กำลังบันทึก", en: "Saving" },
  "inbox.task.statusCompleted": { th: "เสร็จ", en: "completed" },
  "inbox.task.statusOpen": { th: "เปิด", en: "open" },

  // Workflow editor
  "inbox.workflow.saving": { th: "กำลังบันทึก...", en: "Saving..." },
  "inbox.workflow.creating": { th: "กำลังสร้าง...", en: "Creating..." },

  // Message sender labels
  "inbox.sender.ai": { th: "เอไอ", en: "ai" },
  "inbox.sender.ai_draft": { th: "ร่างเอไอ", en: "ai draft" },
  "inbox.sender.automation": { th: "อัตโนมัติ", en: "automation" },
  "inbox.sender.system": { th: "ระบบ", en: "system" },
  "inbox.sender.agent": { th: "แอดมิน", en: "agent" },
  "inbox.sender.customer": { th: "ลูกค้า", en: "customer" }
} satisfies Record<string, Entry>;

export type TranslationKey = keyof typeof dictionary;

/** Translate a key for a given language. */
export function t(lang: Lang, key: TranslationKey): string {
  const entry = dictionary[key];
  if (!entry) return key;
  return entry[lang] ?? entry.th ?? key;
}

/** React hook exposing the current language, a setter, and a bound translator. */
export function useLang(): {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
} {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    setLangState(getStoredLang());
    return subscribeLang(setLangState);
  }, []);

  const setLang = useCallback((next: Lang) => {
    saveLang(next);
    setLangState(next);
  }, []);

  const translate = useCallback((key: TranslationKey) => t(lang, key), [lang]);

  return { lang, setLang, t: translate };
}
