import type { ReactNode } from "react";

import { AdminNav } from "./admin-nav";
import { ClientPreviewSwitcher } from "./client-preview-switcher";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px,1fr]">
          <aside className="w-full rounded-xl border bg-white p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Admin
                </p>
                <p className="text-lg font-semibold">Ads Client Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Manage org clients, campaign reports, and topups.
                </p>
              </div>
              <AdminNav />
              <ClientPreviewSwitcher />
            </div>
          </aside>
          <main className="min-w-0 flex flex-col space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
