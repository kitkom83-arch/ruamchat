"use client";

import type { ReactNode } from "react";
import SideNav from "./SideNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="appLayout">
      <SideNav />
      <div className="appMain">{children}</div>
    </div>
  );
}
