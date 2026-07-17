import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, dictionary, getStoredLang, t, type Lang, type TranslationKey } from "./i18n-data";

describe("i18n-data", () => {
  it("defaults to Thai", () => {
    expect(DEFAULT_LANG).toBe("th");
  });

  it("returns the Thai string for th and the English string for en", () => {
    expect(t("th", "nav.chat")).toBe("แชท");
    expect(t("en", "nav.chat")).toBe("Chat");
    expect(t("th", "nav.logout")).toBe("ออกจากระบบ");
    expect(t("en", "nav.logout")).toBe("Log out");
  });

  it("provides both languages for every dictionary entry", () => {
    for (const [key, entry] of Object.entries(dictionary)) {
      expect(entry.th, `${key} th`).toBeTruthy();
      expect(entry.en, `${key} en`).toBeTruthy();
    }
  });

  it("covers all eight SideNav menu labels", () => {
    const navKeys: TranslationKey[] = [
      "nav.chat",
      "nav.analytics",
      "nav.contacts",
      "nav.broadcasts",
      "nav.ai",
      "nav.flows",
      "nav.webchat",
      "nav.settings"
    ];
    for (const key of navKeys) {
      for (const lang of ["th", "en"] as Lang[]) {
        expect(t(lang, key)).toBeTruthy();
      }
    }
  });

  it("falls back to Thai default when localStorage is unavailable (SSR)", () => {
    expect(getStoredLang()).toBe("th");
  });
});
