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
  "page.channels.h1": { th: "ช่องทาง", en: "Channels" }
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
