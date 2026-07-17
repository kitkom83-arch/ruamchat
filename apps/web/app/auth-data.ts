// Front-end auth prototype (mock, localStorage-backed).
// Consistent with DATA_MODE=mock: no backend calls, no messaging/SSE changes.
// Two roles only:
//   - main_admin: like the account owner, can configure everything AND manage keys/users.
//   - chat_admin: can only reach the chat page + chat-related menus, cannot manage keys.

export type AuthRole = "main_admin" | "chat_admin";

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  /** Plaintext is acceptable here because this is a mock/local prototype only. */
  password: string;
  role: AuthRole;
  /** When false, this account is not allowed to reset its password. */
  passwordResetEnabled: boolean;
  createdAt: string;
  /** Per-admin settings bag, editable on that admin's own settings page. */
  settings: Record<string, string>;
};

export type AuthStore = {
  users: AuthUser[];
  currentUserId: string | null;
};

export const authStoreStorageKey = "ai-omni-auth-store-v1";

export const AUTH_ROLE_META: Record<AuthRole, { label: string; description: string }> = {
  main_admin: {
    label: "แอดมินหลัก",
    description: "ตั้งค่าได้ทั้งหมด และเพิ่ม/ลบคีย์ผู้ใช้"
  },
  chat_admin: {
    label: "แอดมินตอบแชท",
    description: "เข้าถึงเฉพาะหน้าแชทและเมนูที่เกี่ยวกับแชท"
  }
};

// Paths a chat_admin is allowed to open. Everything else is main_admin only.
export const CHAT_ADMIN_ALLOWED_PATHS = ["/", "/contacts", "/webchat-demo"] as const;

export function isPathAllowedForRole(role: AuthRole, pathname: string): boolean {
  if (role === "main_admin") return true;
  return CHAT_ADMIN_ALLOWED_PATHS.some(
    (base) => (base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`))
  );
}

export function createDefaultAuthStore(): AuthStore {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "user-owner",
        username: "owner",
        displayName: "เจ้าของบัญชี",
        password: "owner1234",
        role: "main_admin",
        passwordResetEnabled: true,
        createdAt: now,
        settings: {}
      }
    ],
    currentUserId: null
  };
}

function normaliseStore(raw: Partial<AuthStore> | null | undefined): AuthStore {
  const base = createDefaultAuthStore();
  if (!raw || !Array.isArray(raw.users) || raw.users.length === 0) return base;
  const users = raw.users.map((user) => ({
    ...user,
    passwordResetEnabled: user.passwordResetEnabled ?? true,
    settings: user.settings ?? {}
  }));
  const currentUserId = users.some((user) => user.id === raw.currentUserId) ? raw.currentUserId ?? null : null;
  return { users, currentUserId };
}

export function getStoredAuthStore(): AuthStore {
  if (typeof window === "undefined") return createDefaultAuthStore();
  try {
    const raw = window.localStorage.getItem(authStoreStorageKey);
    return raw ? normaliseStore(JSON.parse(raw) as AuthStore) : createDefaultAuthStore();
  } catch {
    return createDefaultAuthStore();
  }
}

export function saveStoredAuthStore(store: AuthStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(authStoreStorageKey, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(authStoreStorageKey, { detail: store }));
}

export function subscribeAuthStore(callback: (store: AuthStore) => void) {
  if (typeof window === "undefined") return () => {};
  const notify = () => callback(getStoredAuthStore());
  const handleStorage = (event: StorageEvent) => {
    if (event.key === authStoreStorageKey) notify();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(authStoreStorageKey, notify);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(authStoreStorageKey, notify);
  };
}

export function getCurrentUser(store: AuthStore): AuthUser | null {
  if (!store.currentUserId) return null;
  return store.users.find((user) => user.id === store.currentUserId) ?? null;
}

export type LoginResult = { ok: true; store: AuthStore } | { ok: false; error: string };

export function login(store: AuthStore, username: string, password: string): LoginResult {
  const normalised = username.trim().toLowerCase();
  const match = store.users.find((user) => user.username.toLowerCase() === normalised);
  if (!match || match.password !== password) {
    return { ok: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }
  return { ok: true, store: { ...store, currentUserId: match.id } };
}

export function logout(store: AuthStore): AuthStore {
  return { ...store, currentUserId: null };
}

export type CreateUserInput = {
  username: string;
  displayName: string;
  password: string;
  role: AuthRole;
};

export type CreateUserResult = { ok: true; store: AuthStore } | { ok: false; error: string };

export function createUser(store: AuthStore, input: CreateUserInput): CreateUserResult {
  const username = input.username.trim();
  if (!username) return { ok: false, error: "กรุณากรอกชื่อผู้ใช้" };
  if (!input.password.trim()) return { ok: false, error: "กรุณากรอกรหัสผ่าน" };
  if (store.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: "มีชื่อผู้ใช้นี้อยู่แล้ว" };
  }
  const user: AuthUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    username,
    displayName: input.displayName.trim() || username,
    password: input.password,
    role: input.role,
    passwordResetEnabled: true,
    createdAt: new Date().toISOString(),
    settings: {}
  };
  return { ok: true, store: { ...store, users: [...store.users, user] } };
}

export function removeUser(store: AuthStore, userId: string): AuthStore {
  // Never remove the last main admin.
  const target = store.users.find((user) => user.id === userId);
  if (!target) return store;
  if (target.role === "main_admin") {
    const remainingMainAdmins = store.users.filter((user) => user.role === "main_admin" && user.id !== userId);
    if (remainingMainAdmins.length === 0) return store;
  }
  const users = store.users.filter((user) => user.id !== userId);
  const currentUserId = store.currentUserId === userId ? null : store.currentUserId;
  return { ...store, users, currentUserId };
}

export function setPasswordResetEnabled(store: AuthStore, userId: string, enabled: boolean): AuthStore {
  return {
    ...store,
    users: store.users.map((user) => (user.id === userId ? { ...user, passwordResetEnabled: enabled } : user))
  };
}

export type ResetPasswordResult = { ok: true; store: AuthStore } | { ok: false; error: string };

export function resetPassword(store: AuthStore, userId: string, newPassword: string): ResetPasswordResult {
  const target = store.users.find((user) => user.id === userId);
  if (!target) return { ok: false, error: "ไม่พบผู้ใช้" };
  if (!target.passwordResetEnabled) return { ok: false, error: "การรีเซ็ตรหัสผ่านถูกปิดสำหรับผู้ใช้นี้" };
  if (!newPassword.trim()) return { ok: false, error: "กรุณากรอกรหัสผ่านใหม่" };
  return {
    ok: true,
    store: {
      ...store,
      users: store.users.map((user) => (user.id === userId ? { ...user, password: newPassword } : user))
    }
  };
}

export function updateUserSettings(store: AuthStore, userId: string, settings: Record<string, string>): AuthStore {
  return {
    ...store,
    users: store.users.map((user) => (user.id === userId ? { ...user, settings } : user))
  };
}
