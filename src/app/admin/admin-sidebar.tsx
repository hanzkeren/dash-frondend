"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./admin-nav";
import { ClientPreviewSwitcher } from "./client-preview-switcher";
import { NotificationsPopover } from "@/components/sidebar-03/nav-notifications";
import { TeamSwitcher } from "@/components/sidebar-03/team-switcher";
import { Logo } from "@/components/sidebar-03/logo";
import { ExternalLink, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "Dentoto updated spend.",
    time: "Just now",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "JL",
    text: "New topup recorded.",
    time: "15m ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "HH",
    text: "Sakura Digital requested access.",
    time: "2h ago",
  },
];

const teams = [
  { name: "Ads Client Dashboard", logo: Logo, plan: "Production" },
  { name: "Staging", logo: Logo, plan: "Sandbox" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70"
    >
      <SidebarHeader className="space-y-4 border-b px-4 py-4">
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/admin/org-clients"
            className="flex flex-col items-center gap-2"
          >
            <Logo className="h-10 w-10 text-primary" />
            {!isCollapsed && (
              <div className="text-center leading-tight">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Admin
                </p>
                <p className="text-base font-semibold">Ads Dashboard</p>
              </div>
            )}
          </Link>
          <SidebarTrigger
            className="h-10 w-10 rounded-full border p-0 flex items-center justify-center"
            aria-label="Toggle sidebar"
          />
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <TeamSwitcher teams={teams} />
            </div>
            <NotificationsPopover notifications={sampleNotifications} />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <AdminNav />
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-4">
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.push("/client/yakuza-dentoto")}
            title="Open client dashboard"
          >
            <Users2 className="size-5" />
          </Button>
        ) : (
          <div className="space-y-3">
            <ClientPreviewSwitcher />
            <Button
              variant="outline"
              size="sm"
              className={cn("w-full justify-between")}
              onClick={() => router.push("/")}
            >
              Back to landing
              <ExternalLink className="size-3.5" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
