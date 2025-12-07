"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  createAdminOrgClient,
  getAdminOrgClients,
  type ApiError,
} from "@/lib/api";
import type { OrgClient } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const emptyForm = {
  code: "",
  name: "",
};

export default function AdminOrgClientsPage() {
  const [clients, setClients] = useState<OrgClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formState, setFormState] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    { path?: string; message: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const items = await getAdminOrgClients();
      setClients(items);
      setFetchError(null);
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : "Failed to load clients."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.code || !formState.name) {
      setFormError("Both code and name are required.");
      return;
    }

    setFormError(null);
    setValidationErrors([]);
    setSaving(true);
    try {
      const newClient = await createAdminOrgClient({
        code: formState.code.trim(),
        name: formState.name.trim(),
      });
      setClients((previous) => [newClient, ...previous]);
      setFormState(emptyForm);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create client.";
      setFormError(message);
      if ((error as ApiError)?.errors?.length) {
        setValidationErrors((error as ApiError).errors ?? []);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-2">
        <h2 className="text-2xl font-semibold">Organization Clients</h2>
        <p className="text-sm text-muted-foreground">
          Register advertising clients and keep an eye on their activation
          status.
        </p>
      </div>

      <section className="w-full rounded-xl border bg-white p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium">Create New Client</h3>
            <p className="text-xs text-muted-foreground">
              Provide a unique code and readable display name.
            </p>
          </div>
          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="client-code">Client Code</Label>
                <Input
                  id="client-code"
                  name="code"
                  value={formState.code}
                  onChange={(event) =>
                    setFormState((state) => ({
                      ...state,
                      code: event.target.value,
                    }))
                  }
                  placeholder="e.g. ACME"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="client-name">Client Name</Label>
                <Input
                  id="client-name"
                  name="name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((state) => ({
                      ...state,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Acme Corporation"
                  autoComplete="off"
                />
              </div>
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
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
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create Client"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="w-full space-y-2">
        <h3 className="text-base font-medium">Client List</h3>
        <p className="text-xs text-muted-foreground">
          Pulls directly from the backend admin endpoint.
        </p>
        {fetchError && (
          <p className="text-sm text-destructive">{fetchError}</p>
        )}
        <div className="w-full overflow-x-auto rounded-xl border bg-white">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Code</th>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Created</th>
                  <th className="px-4 py-2 text-right font-medium">
                    Quick Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-muted-foreground"
                      colSpan={5}
                    >
                      No clients found yet.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{client.code}</td>
                      <td className="px-4 py-3">{client.name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                          {client.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <OrgClientActions code={client.code} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function OrgClientActions({ code }: { code: string }) {
  const router = useRouter();
  const [value, setValue] = useState<string | undefined>(undefined);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const handleChange = async (selection: string) => {
    if (selection === "client-view") {
      router.push(`/client/${code}`);
    }
    if (selection === "copy-link") {
      const url = `${window.location.origin}/client/${code}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopyStatus("copied");
        setTimeout(() => setCopyStatus("idle"), 1500);
      } catch {
        // swallow clipboard errors
      }
    }
    setValue(undefined);
  };

  return (
    <div className="inline-flex items-center gap-2 justify-end">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Select action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="client-view">View client dashboard</SelectItem>
          <SelectItem value="copy-link">Copy dashboard link</SelectItem>
        </SelectContent>
      </Select>
      {copyStatus === "copied" && (
        <span className="text-xs text-muted-foreground">Copied!</span>
      )}
    </div>
  );
}
