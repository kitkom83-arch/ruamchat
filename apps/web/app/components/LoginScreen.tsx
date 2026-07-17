"use client";

import { LogIn } from "lucide-react";
import { useState } from "react";
import { login, type AuthStore } from "../auth-data";

export default function LoginScreen({
  store,
  onAuthenticated
}: {
  store: AuthStore;
  onAuthenticated: (store: AuthStore) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = login(store, username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    onAuthenticated(result.store);
  }

  return (
    <div className="loginScreen">
      <form className="loginCard" onSubmit={submit}>
        <div className="loginBrand">
          <img className="brandMark" src="/yindee-logo.png" alt="YINDEE" />
          <div>
            <h1>YINDEE</h1>
            <p>เข้าสู่ระบบเพื่อจัดการแชทและตั้งค่า</p>
          </div>
        </div>

        <label className="loginField">
          <span>ชื่อผู้ใช้</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="owner"
            autoComplete="username"
          />
        </label>

        <label className="loginField">
          <span>รหัสผ่าน</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {error ? (
          <p className="loginError" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="loginButton">
          <LogIn size={17} /> เข้าสู่ระบบ
        </button>

        <p className="loginHint">เริ่มต้น: owner / owner1234</p>
      </form>
    </div>
  );
}
