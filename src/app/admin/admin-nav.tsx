"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CreditCard, LineChart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/org-clients", label: "Clients", icon: Users },
  {
    href: "/admin/campaign-reports",
    label: "Campaign Reports",
    icon: LineChart,
  },
  { href: "/admin/topups", label: "Topups", icon: CreditCard },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href || pathname?.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
