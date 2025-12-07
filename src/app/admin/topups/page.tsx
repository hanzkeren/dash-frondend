"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminTopup,
  getAdminOrgClients,
  getAdminTopups,
  type ApiError,
} from "@/lib/api";
import type { OrgClient, TopupRecord } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const pageSize = 10;

export default function AdminTopupsPage() {
  const [clients, setClients] = useState<OrgClient[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [clientsLoading, setClientsLoading] = useState(true);
  const [topups, setTopups] = useState<TopupRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    { path?: string; message: string }[]
  >([]);
  const [topupDate, setTopupDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [jenis, setJenis] = useState("");
  const [clientTopup, setClientTopup] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      setClientsLoading(true);
      try {
        const items = await getAdminOrgClients({ isActive: true });
        setClients(items);
        if (items.length > 0) {
          setSelectedOrgId(items[0].id);
        }
      } catch (error) {
        setTableError(
          error instanceof Error
            ? error.message
            : "Failed to load organization clients."
        );
      } finally {
        setClientsLoading(false);
      }
    };

    loadClients();
  }, []);

  useEffect(() => {
    if (!selectedOrgId) return;
    loadTopups(selectedOrgId, page);
  }, [selectedOrgId, page]);

  const loadTopups = async (orgId: string, pageNumber: number) => {
    setTableLoading(true);
    try {
      const response = await getAdminTopups({
        orgClientId: orgId,
        page: pageNumber,
        pageSize,
      });
      setTopups(response.items);
      setTotal(response.total);
      setTableError(null);
    } catch (error) {
      setTableError(
        error instanceof Error ? error.message : "Failed to load topups."
      );
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrgId) {
      setFormError("Select an organization to record a topup.");
      return;
    }
    if (!topupDate || !jenis || !clientTopup) {
      setFormError("All fields are required.");
      return;
    }

    setFormError(null);
    setValidationErrors([]);
    setSaving(true);
    try {
      await createAdminTopup({
        orgClientId: selectedOrgId,
        topupDate,
        jenis: jenis.trim(),
        clientTopup: Number(clientTopup),
      });
      setJenis("");
      setClientTopup("");
      await loadTopups(selectedOrgId, 1);
      setPage(1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save topup.";
      setFormError(message);
      if ((error as ApiError)?.errors?.length) {
        setValidationErrors((error as ApiError).errors ?? []);
      }
    } finally {
      setSaving(false);
    }
  };

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total]
  );

  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-2">
        <h2 className="text-2xl font-semibold">Topup Records</h2>
        <p className="text-sm text-muted-foreground">
          Keep every credit addition documented alongside campaign spend.
        </p>
      </div>

      <section className="w-full space-y-4 rounded-xl border bg-white p-6">
        <div>
          <h3 className="text-base font-medium">New Topup</h3>
          <p className="text-xs text-muted-foreground">
            Record the date, type, and amount credited to the client.
          </p>
        </div>
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Org Client</Label>
              <Select
                value={selectedOrgId}
                disabled={clients.length === 0 || clientsLoading}
                onValueChange={(value) => {
                  setSelectedOrgId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="topup-date">Topup Date</Label>
              <Input
                id="topup-date"
                type="date"
                value={topupDate}
                onChange={(event) => setTopupDate(event.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jenis">Jenis / Method</Label>
              <Input
                id="jenis"
                value={jenis}
                onChange={(event) => setJenis(event.target.value)}
                placeholder="Transfer BCA"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="client-topup">Client Topup</Label>
              <Input
                id="client-topup"
                type="number"
                min="0"
                step="0.01"
                value={clientTopup}
                onChange={(event) => setClientTopup(event.target.value)}
                placeholder="1000"
                inputMode="decimal"
              />
            </div>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {validationErrors.length > 0 && (
            <ul className="space-y-1 text-sm text-destructive">
              {validationErrors.map((error, index) => (
                <li
                  key={`${error.path ?? "general"}-${error.message}-${index}`}
                >
                  {error.path ? `${error.path}: ` : ""}
                  {error.message}
                </li>
              ))}
            </ul>
          )}
          <Button type="submit" disabled={saving || !selectedOrgId}>
            {saving ? "Saving..." : "Add Topup"}
          </Button>
        </form>
      </section>

      <section className="w-full space-y-2">
        <div className="flex w-full flex-col gap-1">
          <h3 className="text-base font-medium">Topup History</h3>
          <p className="text-xs text-muted-foreground">
            Monitor balances alongside campaign spend.
          </p>
        </div>
        {tableError && <p className="text-sm text-destructive">{tableError}</p>}
        <div className="w-full overflow-x-auto rounded-xl border bg-white">
          {tableLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
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
                {!selectedOrgId ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Select an org client to see topups.
                    </td>
                  </tr>
                ) : topups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No topup records found.
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
              disabled={page === 1 || !selectedOrgId}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page === pageCount || !selectedOrgId}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
