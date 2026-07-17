"use client";

import {
  BarChart3,
  Bot,
  ContactRound,
  Inbox,
  Languages,
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
import { useLang, type TranslationKey } from "../i18n-data";

type NavItem = {
  labelKey: TranslationKey;
  icon: LucideIcon;
  href: string;
  /** Optional prefix used for active matching when it differs from href. */
  match?: string;
};

const navItems: NavItem[] = [
  { labelKey: "nav.chat", icon: Inbox, href: "/" },
  { labelKey: "nav.analytics", icon: BarChart3, href: "/analytics" },
  { labelKey: "nav.contacts", icon: ContactRound, href: "/contacts" },
  { labelKey: "nav.broadcasts", icon: Radio, href: "/broadcasts" },
  { labelKey: "nav.ai", icon: Bot, href: "/ai-center" },
  { labelKey: "nav.flows", icon: Workflow, href: "/flows" },
  { labelKey: "nav.webchat", icon: MessageCircle, href: "/webchat-demo" },
  { labelKey: "nav.settings", icon: Settings, href: "/settings/channels", match: "/settings" }
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
  const { lang, setLang, t } = useLang();
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
      aria-label={t("nav.menuLabel")}
    >
      <div className="sideNavHeader">
        <img className="brandMark" src="/yindee-logo.png" alt="YINDEE" />
        {expanded && <span className="sideNavBrandText">YINDEE</span>}
        <button
          type="button"
          className="sideNavToggle"
          onClick={toggle}
          aria-label={expanded ? t("nav.collapse") : t("nav.expand")}
          aria-pressed={expanded}
          title={expanded ? t("nav.collapse") : t("nav.expand")}
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className="sideNavItems">
        {visibleItems.map((item) => {
          const active = isActive(pathname, item);
          const label = t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "sideNavItem active" : "sideNavItem"}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              title={label}
            >
              <item.icon size={19} className="sideNavItemIcon" />
              {expanded && <span className="sideNavItemLabel">{label}</span>}
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
          className="sideNavLang"
          onClick={() => setLang(lang === "th" ? "en" : "th")}
          aria-label={t("lang.toggle")}
          title={t("lang.toggle")}
        >
          <Languages size={18} />
          {expanded && (
            <span className="sideNavLangValue">
              <span className={lang === "th" ? "langOn" : "langOff"}>TH</span>
              <span className="langSep">/</span>
              <span className={lang === "en" ? "langOn" : "langOff"}>EN</span>
            </span>
          )}
        </button>
        <button
          type="button"
          className="sideNavLogout"
          onClick={onLogout}
          aria-label={t("nav.logout")}
          title={t("nav.logout")}
        >
          <LogOut size={18} />
          {expanded && <span>{t("nav.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
