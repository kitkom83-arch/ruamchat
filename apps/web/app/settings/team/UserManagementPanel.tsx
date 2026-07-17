"use client";

import { KeyRound, Plus, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AUTH_ROLE_META,
  createUser,
  getCurrentUser,
  getStoredAuthStore,
  removeUser,
  resetPassword,
  saveStoredAuthStore,
  setPasswordResetEnabled,
  subscribeAuthStore,
  updateUserSettings,
  type AuthRole,
  type AuthStore
} from "../../auth-data";

const roleOptions: AuthRole[] = ["main_admin", "chat_admin"];

export default function UserManagementPanel() {
  const [store, setStore] = useState<AuthStore | null>(null);
  const [draft, setDraft] = useState({ username: "", displayName: "", password: "", role: "chat_admin" as AuthRole });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetDrafts, setResetDrafts] = useState<Record<string, string>>({});
  const [settingsDraft, setSettingsDraft] = useState({ brandName: "", supportEmail: "", signature: "" });

  useEffect(() => {
    const initial = getStoredAuthStore();
    setStore(initial);
    const current = getCurrentUser(initial);
    if (current) {
      setSettingsDraft({
        brandName: current.settings.brandName ?? "",
        supportEmail: current.settings.supportEmail ?? "",
        signature: current.settings.signature ?? ""
      });
    }
    return subscribeAuthStore(setStore);
  }, []);

  if (!store) return null;
  const currentUser = getCurrentUser(store);
  if (!currentUser || currentUser.role !== "main_admin") return null;

  function persist(next: AuthStore) {
    setStore(next);
    saveStoredAuthStore(next);
  }

  function submitNewUser(event: React.FormEvent) {
    event.preventDefault();
    if (!store) return;
    const result = createUser(store, draft);
    if (!result.ok) {
      setError(result.error);
      setNotice("");
      return;
    }
    persist(result.store);
    setDraft({ username: "", displayName: "", password: "", role: "chat_admin" });
    setError("");
    setNotice(`เพิ่มคีย์ผู้ใช้ “${draft.username}” แล้ว`);
  }

  function handleReset(userId: string) {
    if (!store) return;
    const next = resetDrafts[userId] ?? "";
    const result = resetPassword(store, userId, next);
    if (!result.ok) {
      setError(result.error);
      setNotice("");
      return;
    }
    persist(result.store);
    setResetDrafts((current) => ({ ...current, [userId]: "" }));
    setError("");
    setNotice("รีเซ็ตรหัสผ่านแล้ว");
  }

  function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    if (!store || !currentUser) return;
    persist(updateUserSettings(store, currentUser.id, { ...settingsDraft }));
    setNotice("บันทึกค่าตั้งค่าของแอดมินหลักแล้ว");
    setError("");
  }

  return (
    <section className="userMgmtGrid">
      <article className="channelPanel">
        <div className="channelPanelTop">
          <UserCog size={20} />
          <div>
            <h2>ผู้ใช้และคีย์เข้าระบบ</h2>
            <p>สร้างคีย์ให้ทีม — แอดมินหลักตั้งค่าได้ทั้งหมด, แอดมินตอบแชทเข้าได้เฉพาะหน้าแชท</p>
          </div>
        </div>

        {error ? <p className="userMgmtError" role="alert">{error}</p> : null}
        {notice ? <p className="userMgmtNotice">{notice}</p> : null}

        <form className="userMgmtForm" onSubmit={submitNewUser}>
          <label className="settingsInlineField">
            <span>ชื่อผู้ใช้</span>
            <input value={draft.username} onChange={(event) => setDraft((c) => ({ ...c, username: event.target.value }))} placeholder="เช่น may" />
          </label>
          <label className="settingsInlineField">
            <span>ชื่อที่แสดง</span>
            <input value={draft.displayName} onChange={(event) => setDraft((c) => ({ ...c, displayName: event.target.value }))} placeholder="เช่น เมย์" />
          </label>
          <label className="settingsInlineField">
            <span>รหัสผ่าน</span>
            <input type="password" value={draft.password} onChange={(event) => setDraft((c) => ({ ...c, password: event.target.value }))} placeholder="รหัสผ่าน" />
          </label>
          <label className="settingsInlineField">
            <span>ประเภทคีย์</span>
            <select value={draft.role} onChange={(event) => setDraft((c) => ({ ...c, role: event.target.value as AuthRole }))}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{AUTH_ROLE_META[role].label}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="userMgmtAddButton"><Plus size={15} /> เพิ่มคีย์</button>
        </form>

        <div className="userMgmtList">
          {store.users.map((user) => (
            <div key={user.id} className="userMgmtRow">
              <div className="userMgmtRowMain">
                <strong>{user.displayName} <span className="userMgmtUsername">@{user.username}</span></strong>
                <span className={`userMgmtRole ${user.role}`}>
                  {user.role === "main_admin" ? <ShieldCheck size={13} /> : <KeyRound size={13} />}
                  {AUTH_ROLE_META[user.role].label}
                </span>
              </div>
              <div className="userMgmtRowActions">
                <label className="userMgmtToggle" title="เปิด/ปิด การรีเซ็ตรหัสผ่าน">
                  <input
                    type="checkbox"
                    checked={user.passwordResetEnabled}
                    onChange={(event) => persist(setPasswordResetEnabled(store, user.id, event.target.checked))}
                  />
                  <span>รีรหัส</span>
                </label>
                <input
                  type="password"
                  className="userMgmtResetInput"
                  placeholder="รหัสใหม่"
                  value={resetDrafts[user.id] ?? ""}
                  disabled={!user.passwordResetEnabled}
                  onChange={(event) => setResetDrafts((current) => ({ ...current, [user.id]: event.target.value }))}
                />
                <button type="button" onClick={() => handleReset(user.id)} disabled={!user.passwordResetEnabled}>รีเซ็ต</button>
                <button
                  type="button"
                  className="userMgmtDelete"
                  onClick={() => persist(removeUser(store, user.id))}
                  disabled={user.id === currentUser.id}
                  title={user.id === currentUser.id ? "ลบตัวเองไม่ได้" : "ลบผู้ใช้"}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="channelPanel">
        <div className="channelPanelTop">
          <ShieldCheck size={20} />
          <div>
            <h2>ค่าตั้งค่าของแอดมินหลัก</h2>
            <p>ค่าเหล่านี้เก็บแยกของแต่ละแอดมินหลัก (ของใครของมัน)</p>
          </div>
        </div>
        <form className="userMgmtForm" onSubmit={saveSettings}>
          <label className="settingsInlineField">
            <span>ชื่อแบรนด์</span>
            <input value={settingsDraft.brandName} onChange={(event) => setSettingsDraft((c) => ({ ...c, brandName: event.target.value }))} placeholder="ruamchat" />
          </label>
          <label className="settingsInlineField">
            <span>อีเมลซัพพอร์ต</span>
            <input value={settingsDraft.supportEmail} onChange={(event) => setSettingsDraft((c) => ({ ...c, supportEmail: event.target.value }))} placeholder="support@example.com" />
          </label>
          <label className="settingsInlineField">
            <span>ลายเซ็นข้อความ</span>
            <input value={settingsDraft.signature} onChange={(event) => setSettingsDraft((c) => ({ ...c, signature: event.target.value }))} placeholder="ทีมงาน ruamchat" />
          </label>
          <button type="submit" className="userMgmtAddButton">บันทึกค่า</button>
        </form>
      </article>
    </section>
  );
}
