"use client";

import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ClientNav } from "./client-nav";
import { Logo } from "@/components/sidebar-03/logo";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";

interface ClientSidebarProps {
  orgClientCode: string;
}

export function ClientSidebar({ orgClientCode }: ClientSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70"
    >
      <SidebarHeader className="space-y-3 border-b px-4 py-4">
        <div className="flex flex-col items-center gap-3">
          <Link
            href={`/client/${orgClientCode}`}
            className="flex flex-col items-center gap-2"
          >
            <Logo className="h-10 w-10 text-primary" />
            {!isCollapsed && (
              <div className="text-center leading-tight">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Client
                </p>
                <p className="text-base font-semibold break-all">
                  {orgClientCode}
                </p>
              </div>
            )}
          </Link>
          <SidebarTrigger
            className="h-10 w-10 rounded-full border p-0 flex items-center justify-center"
            aria-label="Toggle sidebar"
          />
        </div>
        {!isCollapsed && (
          <div className="rounded-lg border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
            <Info className="size-3.5" />
            Showing data scoped to <span className="font-medium">{orgClientCode}</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <ClientNav orgClientCode={orgClientCode} />
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-4">
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            asChild
          >
            <Link href="/admin/org-clients">
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="w-full gap-2">
            <Link href="/admin/org-clients">
              Back to Admin
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
