"use client";

import {
  BarChart3,
  Bot,
  ContactRound,
  Inbox,
  LogOut,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Settings,
  Workflow,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AUTH_ROLE_META, isPathAllowedForRole, type AuthRole, type AuthUser } from "../auth-data";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  /** Optional prefix used for active matching when it differs from href. */
  match?: string;
};

const navItems: NavItem[] = [
  { label: "แชท", icon: Inbox, href: "/" },
  { label: "วิเคราะห์", icon: BarChart3, href: "/analytics" },
  { label: "ผู้ติดต่อ", icon: ContactRound, href: "/contacts" },
  { label: "บรอดแคสต์", icon: Radio, href: "/broadcasts" },
  { label: "เอไอ", icon: Bot, href: "/ai-center" },
  { label: "บอท/โฟลว์", icon: Workflow, href: "/flows" },
  { label: "ทดสอบแชท", icon: MessageCircle, href: "/webchat-demo" },
  { label: "ตั้งค่า", icon: Settings, href: "/settings/channels", match: "/settings" }
];

const collapseStorageKey = "ao.sideNav.collapsed";

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  const base = item.match ?? item.href;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export default function SideNav({
  role,
  user,
  onLogout
}: {
  role: AuthRole;
  user: AuthUser;
  onLogout: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const stored = window.localStorage.getItem(collapseStorageKey);
      if (stored === "false") setCollapsed(false);
      if (stored === "true") setCollapsed(true);
    } catch {
      /* ignore storage access errors */
    }
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(collapseStorageKey, String(next));
      } catch {
        /* ignore storage access errors */
      }
      return next;
    });
  }

  const expanded = hydrated && !collapsed;
  const visibleItems = navItems.filter((item) => isPathAllowedForRole(role, item.match ?? item.href));

  return (
    <aside
      className={expanded ? "sideNav sideNavExpanded" : "sideNav"}
      aria-label="เมนูหลัก"
    >
      <div className="sideNavHeader">
        <img className="brandMark" src="/yindee-logo.png" alt="YINDEE" />
        {expanded && <span className="sideNavBrandText">YINDEE</span>}
        <button
          type="button"
          className="sideNavToggle"
          onClick={toggle}
          aria-label={expanded ? "ยุบเมนู" : "ขยายเมนู"}
          aria-pressed={expanded}
          title={expanded ? "ยุบเมนู" : "ขยายเมนู"}
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className="sideNavItems">
        {visibleItems.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "sideNavItem active" : "sideNavItem"}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              title={item.label}
            >
              <item.icon size={19} className="sideNavItemIcon" />
              {expanded && <span className="sideNavItemLabel">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sideNavFooter">
        {expanded && (
          <div className="sideNavUser">
            <strong>{user.displayName}</strong>
            <span>{AUTH_ROLE_META[role].label}</span>
          </div>
        )}
        <button
          type="button"
          className="sideNavLogout"
          onClick={onLogout}
          aria-label="ออกจากระบบ"
          title="ออกจากระบบ"
        >
          <LogOut size={18} />
          {expanded && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  );
}
