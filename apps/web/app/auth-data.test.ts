import { describe, expect, it } from "vitest";
import {
  createDefaultAuthStore,
  createUser,
  getCurrentUser,
  isPathAllowedForRole,
  login,
  logout,
  removeUser,
  resetPassword,
  setPasswordResetEnabled,
  updateUserSettings
} from "./auth-data";

describe("auth-data", () => {
  it("creates a default store with a single main admin owner", () => {
    const store = createDefaultAuthStore();
    expect(store.users).toHaveLength(1);
    expect(store.users[0].role).toBe("main_admin");
    expect(store.currentUserId).toBeNull();
  });

  it("logs in with correct credentials and rejects wrong ones", () => {
    const store = createDefaultAuthStore();
    const bad = login(store, "owner", "nope");
    expect(bad.ok).toBe(false);
    const good = login(store, "owner", "owner1234");
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(getCurrentUser(good.store)?.username).toBe("owner");
      expect(getCurrentUser(logout(good.store))).toBeNull();
    }
  });

  it("restricts chat_admin to chat-related paths only", () => {
    expect(isPathAllowedForRole("chat_admin", "/")).toBe(true);
    expect(isPathAllowedForRole("chat_admin", "/contacts")).toBe(true);
    expect(isPathAllowedForRole("chat_admin", "/webchat-demo")).toBe(true);
    expect(isPathAllowedForRole("chat_admin", "/analytics")).toBe(false);
    expect(isPathAllowedForRole("chat_admin", "/settings/channels")).toBe(false);
    expect(isPathAllowedForRole("main_admin", "/settings/channels")).toBe(true);
  });

  it("creates users and blocks duplicate usernames", () => {
    let store = createDefaultAuthStore();
    const created = createUser(store, { username: "may", displayName: "May", password: "pw", role: "chat_admin" });
    expect(created.ok).toBe(true);
    if (created.ok) store = created.store;
    expect(store.users).toHaveLength(2);
    const dup = createUser(store, { username: "may", displayName: "May 2", password: "pw", role: "chat_admin" });
    expect(dup.ok).toBe(false);
  });

  it("never removes the last main admin but removes others", () => {
    let store = createDefaultAuthStore();
    const owner = store.users[0].id;
    store = removeUser(store, owner);
    expect(store.users.some((user) => user.id === owner)).toBe(true);

    const added = createUser(store, { username: "chat", displayName: "Chat", password: "pw", role: "chat_admin" });
    if (added.ok) store = added.store;
    const chatId = store.users.find((user) => user.username === "chat")!.id;
    store = removeUser(store, chatId);
    expect(store.users.some((user) => user.id === chatId)).toBe(false);
  });

  it("respects the password-reset toggle", () => {
    let store = createDefaultAuthStore();
    const owner = store.users[0].id;
    store = setPasswordResetEnabled(store, owner, false);
    const blocked = resetPassword(store, owner, "new");
    expect(blocked.ok).toBe(false);
    store = setPasswordResetEnabled(store, owner, true);
    const allowed = resetPassword(store, owner, "newpw");
    expect(allowed.ok).toBe(true);
    if (allowed.ok) {
      expect(login(allowed.store, "owner", "newpw").ok).toBe(true);
    }
  });

  it("stores per-user settings", () => {
    let store = createDefaultAuthStore();
    const owner = store.users[0].id;
    store = updateUserSettings(store, owner, { brandName: "ruamchat" });
    expect(getCurrentUser({ ...store, currentUserId: owner })?.settings.brandName).toBe("ruamchat");
  });
});
