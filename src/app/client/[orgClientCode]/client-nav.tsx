"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { LayoutDashboard, LineChart, Wallet } from "lucide-react";

const navItems = [
  { segment: "", label: "Dashboard", icon: LayoutDashboard },
  {
    segment: "/campaign-reports",
    label: "Campaign Reports",
    icon: LineChart,
  },
  { segment: "/topups", label: "Topups", icon: Wallet },
];

export function ClientNav({ orgClientCode }: { orgClientCode?: string }) {
  const pathname = usePathname();
  const params = useParams<{ orgClientCode?: string }>();
  const codeFromParams = typeof params?.orgClientCode === "string" ? params.orgClientCode : "";
  const code = orgClientCode ?? codeFromParams;

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const href = `/client/${code}${item.segment}`;
        const isActive =
          pathname === href ||
          (item.segment && pathname?.startsWith(`${href}`));
        const Icon = item.icon;
        return (
          <Link
            key={href}
            href={href}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="size-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
