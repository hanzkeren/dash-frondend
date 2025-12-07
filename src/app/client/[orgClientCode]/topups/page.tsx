"use client";

import { use, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClientTopups, type ApiError } from "@/lib/api";
import type { TopupRecord } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const pageSize = 10;

export default function ClientTopupsPage({
  params,
}: {
  params: { orgClientCode: string };
}) {
  const { orgClientCode } = use(params);
  const [topups, setTopups] = useState<TopupRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [filters, setFilters] = useState({ fromDate: "", toDate: "" });
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "",
    toDate: "",
  });
  const [filterError, setFilterError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await getClientTopups({
          orgClientCode,
          page,
          pageSize,
          fromDate: appliedFilters.fromDate || undefined,
          toDate: appliedFilters.toDate || undefined,
        });
        if (!ignore) {
          setTopups(response.items);
          setTotal(response.total);
          setError(null);
        }
      } catch (error) {
        if (!ignore) {
          const apiError = error as ApiError;
          setError({
            message:
              apiError?.message ??
              (error instanceof Error ? error.message : "Failed to load topups."),
            status: apiError?.status,
          });
          if (apiError?.status === 404) {
            setTopups([]);
            setTotal(0);
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
  }, [orgClientCode, page, appliedFilters]);

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
    setPage(1);
  };

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total]
  );
  const isNotFound = error?.status === 404;

  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-2">
        <h2 className="text-2xl font-semibold">Topup Ledger</h2>
        <p className="text-sm text-muted-foreground">
          Every recorded balance addition for this org code.
        </p>
      </div>

      <section className="w-full space-y-4 rounded-xl border p-4">
        <div>
          <h3 className="text-base font-medium">Filter</h3>
          <p className="text-xs text-muted-foreground">
            Narrow the list with a from/to date.
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
              Confirm the org code or pick another client via the switcher.
            </p>
          )}
        </div>
      )}

      <section className="space-y-2">
        <h3 className="text-base font-medium">Topup Records</h3>
        <div className="w-full overflow-x-auto rounded-xl border bg-white">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : isNotFound ? (
            <div className="p-4 text-sm text-muted-foreground">
              Org client code not found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Jenis</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No topup rows match the selected filters.
                    </td>
                  </tr>
                ) : (
                  topups.map((topup) => (
                    <tr key={topup.id} className="border-t">
                      <td className="px-4 py-3">{formatDate(topup.topupDate)}</td>
                      <td className="px-4 py-3">{topup.jenis}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(
                          topup.clientTopup,
                          topup.currency ?? "USD"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || isNotFound}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page === pageCount || isNotFound}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
