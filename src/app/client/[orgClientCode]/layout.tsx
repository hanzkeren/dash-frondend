import type { ReactNode } from "react";

import { ClientNav } from "./client-nav";

export default function ClientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { orgClientCode: string };
}) {
  const { orgClientCode } = params;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px,1fr]">
          <aside className="w-full rounded-xl border bg-white p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Client Portal
                </p>
                <p className="text-lg font-semibold">{orgClientCode}</p>
                <p className="text-sm text-muted-foreground">
                  Review balances, campaign reports, and topups in real time.
                </p>
              </div>
              <ClientNav orgClientCode={orgClientCode} />
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Signed in as <span className="font-medium">{orgClientCode}</span>
              </div>
            </div>
          </aside>
          <main className="min-w-0 flex flex-col space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
