"use client";

import { use, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClientDashboard, type ApiError } from "@/lib/api";
import type { ClientDashboardResponse } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DateFilterState {
  fromDate: string;
  toDate: string;
}

export default function ClientDashboardPage({
  params,
}: {
  params: { orgClientCode: string };
}) {
  const { orgClientCode } = use(params);
  const [data, setData] = useState<ClientDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [filters, setFilters] = useState<DateFilterState>({
    fromDate: "",
    toDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<DateFilterState>({
    fromDate: "",
    toDate: "",
  });
  const [filterError, setFilterError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await getClientDashboard(
          orgClientCode,
          appliedFilters.fromDate || undefined,
          appliedFilters.toDate || undefined
        );
        if (!ignore) {
          setData(response);
          setError(null);
        }
      } catch (error) {
        if (!ignore) {
          const apiError = error as ApiError;
          setError({
            message:
              apiError?.message ??
              (error instanceof Error
                ? error.message
                : "Failed to load dashboard."),
            status: apiError?.status,
          });
          if (apiError?.status === 404) {
            setData(null);
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [orgClientCode, appliedFilters]);

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      filters.fromDate &&
      filters.toDate &&
      filters.fromDate > filters.toDate
    ) {
      setFilterError("From date must be before To date.");
      return;
    }
    setFilterError(null);
    setAppliedFilters(filters);
  };

  const summary = data?.summary;
  const isNotFound = error?.status === 404;

  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-2">
        <h2 className="text-2xl font-semibold">
          {data?.orgClient.name ?? "Client Dashboard"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Org Code: {data?.orgClient.code ?? orgClientCode}
        </p>
      </div>

      <section className="w-full rounded-xl border bg-white p-6 space-y-4">
        <div>
          <h3 className="text-base font-medium">Filter Summary Window</h3>
          <p className="text-xs text-muted-foreground">
            Choose an optional date range to refine totals.
          </p>
        </div>
        <form className="w-full space-y-4" onSubmit={handleFilterSubmit}>
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="from-date">From date</Label>
              <Input
                id="from-date"
                type="date"
                value={filters.fromDate}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    fromDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to-date">To date</Label>
              <Input
                id="to-date"
                type="date"
                value={filters.toDate}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    toDate: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          {filterError && (
            <p className="text-sm text-destructive">{filterError}</p>
          )}
          <Button type="submit">Apply Filters</Button>
        </form>
      </section>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive space-y-1">
          <p>{error.message}</p>
          {isNotFound && (
            <p className="text-xs text-destructive/80">
              Confirm the code exists or use the switcher above to open another
              org client.
            </p>
          )}
        </div>
      )}

      {!isNotFound && (
        <>
      <section className="w-full space-y-4">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-xl border bg-white p-4">
                <p className="text-xs text-muted-foreground">Total Topup</p>
                <p className="text-2xl font-semibold">
                  {summary
                    ? formatCurrency(summary.totalTopup, summary.currency)
                    : "—"}
                </p>
              </div>
          <div className="flex flex-col justify-between rounded-xl border bg-white p-4">
                <p className="text-xs text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-semibold">
                  {summary
                    ? formatCurrency(summary.totalSpend, summary.currency)
                    : "—"}
                </p>
              </div>
          <div className="flex flex-col justify-between rounded-xl border bg-white p-4">
                <p className="text-xs text-muted-foreground">Sisa Saldo</p>
                <p className="text-2xl font-semibold">
                  {summary
                    ? formatCurrency(summary.sisaSaldo, summary.currency)
                    : "—"}
                </p>
              </div>
            </div>
            {loading && (
              <p className="text-sm text-muted-foreground">
                Loading dashboard...
              </p>
            )}
          </section>

          <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="w-full space-y-2">
              <h3 className="text-base font-medium">Latest Campaign Reports</h3>
              <p className="text-xs text-muted-foreground">
                Most recent spends returned by the backend.
              </p>
              <div className="w-full overflow-x-auto rounded-xl border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">
                        Account
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Spend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data || data.latestCampaignReports.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          No reports to display.
                        </td>
                      </tr>
                    ) : (
                      data.latestCampaignReports.map((report) => (
                        <tr
                          key={`${report.accountId}-${report.reportDate}`}
                          className="border-t"
                        >
                          <td className="px-4 py-3">
                            {formatDate(report.reportDate)}
                          </td>
                          <td className="px-4 py-3">{report.accountId}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(
                              report.clientSpend,
                              report.currency ?? summary?.currency ?? "USD"
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="w-full space-y-2">
              <h3 className="text-base font-medium">Latest Topups</h3>
              <p className="text-xs text-muted-foreground">
                Recent balance increases logged by admins.
              </p>
              <div className="w-full overflow-x-auto rounded-xl border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Jenis</th>
                      <th className="px-4 py-2 text-right font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data || data.latestTopups.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          No topups to display.
                        </td>
                      </tr>
                    ) : (
                      data.latestTopups.map((topup) => (
                        <tr key={`${topup.jenis}-${topup.topupDate}`} className="border-t">
                          <td className="px-4 py-3">
                            {formatDate(topup.topupDate)}
                          </td>
                          <td className="px-4 py-3">{topup.jenis}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(
                              topup.clientTopup,
                              topup.currency ?? summary?.currency ?? "USD"
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
