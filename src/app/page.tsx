import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOrgClients } from "@/lib/api";
import type { OrgClient } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let sampleClients: OrgClient[] = [];
  try {
    const clients = await getAdminOrgClients({
      isActive: true,
    });
    sampleClients = clients.slice(0, 3);
  } catch {
    sampleClients = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Welcome</p>
          <h1 className="text-2xl font-semibold">Ads Client Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Use the quick entry points below to manage org clients, campaign
            spend, and topups or to preview the client-facing experience.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="h-full w-full">
            <CardHeader>
              <CardTitle>Admin Portal</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage organization clients, record campaign reports, and track
                topups.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Start with the client list to add a company, then switch to the
                other tabs using the built-in navigation.
              </p>
              <Button asChild>
                <Link href="/admin/org-clients">Go to Admin</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full w-full">
            <CardHeader>
              <CardTitle>Client Portal</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share read-only dashboards and ledgers filtered by client code.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Replace <code className="rounded bg-muted px-1 py-0.5">CODE</code>{" "}
                in the link with a real org client code from your database.
              </p>
              <Button variant="outline" asChild>
                <Link href="/client/CODE">Preview Client View</Link>
              </Button>
              {sampleClients.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Sample codes (active)
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {sampleClients.map((client) => (
                      <Link
                        key={client.id}
                        href={`/client/${client.code}`}
                        className="rounded-full border px-3 py-1 text-muted-foreground hover:border-foreground hover:text-foreground"
                      >
                        {client.name} ({client.code})
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use any code listed inside the Admin &gt; Clients page.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
