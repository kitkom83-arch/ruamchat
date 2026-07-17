"use client";

import {
  BarChart3,
  Bot,
  ContactRound,
  Inbox,
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

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  /** Optional prefix used for active matching when it differs from href. */
  match?: string;
};

const navItems: NavItem[] = [
  { label: "Inbox", icon: Inbox, href: "/" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Contacts", icon: ContactRound, href: "/contacts" },
  { label: "Broadcasts", icon: Radio, href: "/broadcasts" },
  { label: "AI Center", icon: Bot, href: "/ai-center" },
  { label: "Flows", icon: Workflow, href: "/flows" },
  { label: "Webchat Demo", icon: MessageCircle, href: "/webchat-demo" },
  { label: "Settings", icon: Settings, href: "/settings/channels", match: "/settings" }
];

const collapseStorageKey = "ao.sideNav.collapsed";

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  const base = item.match ?? item.href;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export default function SideNav() {
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

  return (
    <aside
      className={expanded ? "sideNav sideNavExpanded" : "sideNav"}
      aria-label="Main menu"
    >
      <div className="sideNavHeader">
        <img className="brandMark" src="/yindee-logo.png" alt="YINDEE" />
        {expanded && <span className="sideNavBrandText">YINDEE</span>}
        <button
          type="button"
          className="sideNavToggle"
          onClick={toggle}
          aria-label={expanded ? "Collapse menu" : "Expand menu"}
          aria-pressed={expanded}
          title={expanded ? "Collapse menu" : "Expand menu"}
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className="sideNavItems">
        {navItems.map((item) => {
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
    </aside>
  );
}
