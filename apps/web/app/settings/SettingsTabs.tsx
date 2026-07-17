"use client";

import { Radio, UsersRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang, type TranslationKey } from "../i18n-data";

type SettingsTab = {
  labelKey: TranslationKey;
  href: string;
  icon: LucideIcon;
};

const settingsTabs: SettingsTab[] = [
  { labelKey: "settings.tab.channels", href: "/settings/channels", icon: Radio },
  { labelKey: "settings.tab.team", href: "/settings/team", icon: UsersRound }
];

export default function SettingsTabs() {
  const pathname = usePathname() ?? "";
  const { t } = useLang();

  return (
    <nav className="settingsTabs" aria-label={t("settings.tabs.aria")}>
      {settingsTabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const label = t(tab.labelKey);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "settingsTab active" : "settingsTab"}
            aria-current={active ? "page" : undefined}
          >
            <tab.icon size={16} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
