"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  getCurrentUser,
  getStoredAuthStore,
  isPathAllowedForRole,
  saveStoredAuthStore,
  subscribeAuthStore,
  type AuthStore
} from "../auth-data";
import LoginScreen from "./LoginScreen";
import SideNav from "./SideNav";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [store, setStore] = useState<AuthStore | null>(null);

  useEffect(() => {
    setStore(getStoredAuthStore());
    return subscribeAuthStore(setStore);
  }, []);

  function persist(next: AuthStore) {
    setStore(next);
    saveStoredAuthStore(next);
  }

  // Before hydration we render children without chrome to avoid a login flash.
  if (!store) {
    return (
      <div className="appLayout">
        <div className="appMain">{children}</div>
      </div>
    );
  }

  const currentUser = getCurrentUser(store);

  if (!currentUser) {
    return <LoginScreen store={store} onAuthenticated={persist} />;
  }

  const allowed = isPathAllowedForRole(currentUser.role, pathname);

  return (
    <div className="appLayout">
      <SideNav
        role={currentUser.role}
        user={currentUser}
        onLogout={() => persist({ ...store, currentUserId: null })}
      />
      <div className="appMain">
        {allowed ? (
          children
        ) : (
          <div className="accessDenied">
            <h1>ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
            <p>บัญชี “แอดมินตอบแชท” เข้าถึงได้เฉพาะหน้าแชทและเมนูที่เกี่ยวกับแชทเท่านั้น</p>
          </div>
        )}
      </div>
    </div>
  );
}
