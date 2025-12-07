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
  createAdminCampaignReport,
  getAdminCampaignReports,
  getAdminOrgClients,
  type ApiError,
} from "@/lib/api";
import type { CampaignReport, OrgClient } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const pageSize = 10;

export default function AdminCampaignReportsPage() {
  const [clients, setClients] = useState<OrgClient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [reports, setReports] = useState<CampaignReport[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    { path?: string; message: string }[]
  >([]);
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [accountId, setAccountId] = useState("");
  const [clientSpend, setClientSpend] = useState("");

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
    loadReports(selectedOrgId, page);
  }, [selectedOrgId, page]);

  const loadReports = async (orgId: string, pageNumber: number) => {
    setTableLoading(true);
    try {
      const response = await getAdminCampaignReports({
        orgClientId: orgId,
        page: pageNumber,
        pageSize,
      });
      setReports(response.items);
      setTotal(response.total);
      setTableError(null);
    } catch (error) {
      setTableError(
        error instanceof Error ? error.message : "Failed to load reports."
      );
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrgId) {
      setFormError("Select an organization to record a report.");
      return;
    }
    if (!reportDate || !accountId || !clientSpend) {
      setFormError("All fields are required.");
      return;
    }

    setFormError(null);
    setValidationErrors([]);
    setSaving(true);
    try {
      await createAdminCampaignReport({
        orgClientId: selectedOrgId,
        reportDate,
        accountId: accountId.trim(),
        clientSpend: Number(clientSpend),
      });
      setAccountId("");
      setClientSpend("");
      await loadReports(selectedOrgId, 1);
      setPage(1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save report.";
      setFormError(message);
      if ((error as ApiError)?.errors?.length) {
        setValidationErrors((error as ApiError).errors ?? []);
      }
    } finally {
      setSaving(false);
    }
  };

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total]);

  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-2">
        <h2 className="text-2xl font-semibold">Campaign Reports</h2>
        <p className="text-sm text-muted-foreground">
          Capture daily spend per account and review paginated history.
        </p>
      </div>

      <section className="w-full space-y-4 rounded-xl border bg-white p-6">
        <div>
          <h3 className="text-base font-medium">New Campaign Report</h3>
          <p className="text-xs text-muted-foreground">
            Required fields: org client, report date, account ID, and spend.
          </p>
        </div>
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Org Client</Label>
              <Select
                value={selectedOrgId}
                onValueChange={(value) => {
                  setSelectedOrgId(value);
                  setPage(1);
                }}
                disabled={clients.length === 0 || clientsLoading}
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
              <Label htmlFor="report-date">Report Date</Label>
              <Input
                id="report-date"
                type="date"
                value={reportDate}
                onChange={(event) => setReportDate(event.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="account-id">Account ID</Label>
              <Input
                id="account-id"
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                placeholder="123-456"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="client-spend">Client Spend</Label>
              <Input
                id="client-spend"
                type="number"
                min="0"
                step="0.01"
                value={clientSpend}
                onChange={(event) => setClientSpend(event.target.value)}
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
            {saving ? "Saving..." : "Add Report"}
          </Button>
        </form>
      </section>

      <section className="w-full space-y-2">
        <div className="flex w-full flex-col gap-1">
          <h3 className="text-base font-medium">Recent Reports</h3>
          <p className="text-xs text-muted-foreground">
            Data refreshes immediately after submissions.
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
                  <th className="px-4 py-2 text-left font-medium">
                    Account ID
                  </th>
                  <th className="px-4 py-2 text-right font-medium">Spend</th>
                </tr>
              </thead>
              <tbody>
                {!selectedOrgId ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Select an org client to see reports.
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No campaign reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="border-t">
                      <td className="px-4 py-3">
                        {formatDate(report.reportDate)}
                      </td>
                      <td className="px-4 py-3">{report.accountId}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(
                          report.clientSpend,
                          report.currency ?? "USD"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm">
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
