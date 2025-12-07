import type {
  AdminCampaignReportParams,
  AdminTopupParams,
  ApiValidationError,
  CampaignReport,
  ClientDashboardResponse,
  ClientListParams,
  CreateCampaignReportInput,
  CreateOrgClientInput,
  CreateTopupInput,
  OrgClient,
  PaginatedResponse,
  TopupRecord,
} from "./types";

const API_BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/$/, "") ?? "";
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";

export type ApiError = Error & {
  status?: number;
  errors?: ApiValidationError[];
};

const ensureBaseUrl = () => {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL is not configured. Please set it in your environment."
    );
  }
};

const withAdminHeaders = (headers: Headers) => {
  if (!ADMIN_TOKEN) {
    throw new Error(
      "NEXT_PUBLIC_ADMIN_TOKEN is not configured. Please set it in your environment."
    );
  }
  headers.set("Authorization", `Bearer ${ADMIN_TOKEN}`);
};

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  { isAdmin = false }: { isAdmin?: boolean } = {}
): Promise<T> {
  ensureBaseUrl();

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (isAdmin) {
    withAdminHeaders(headers);
  }

  const url = `${API_BASE}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        error.message || "Unable to reach the backend service. Please try again."
      );
    }
    throw error;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let validationErrors: ApiValidationError[] | undefined;

    try {
      const payload = await response.json();
      message = payload?.message ?? message;
      validationErrors = payload?.errors;
    } catch {
      // ignore body parse issues
    }

    const error = new Error(message) as ApiError;
    error.status = response.status;
    error.errors = validationErrors;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getAdminOrgClients(params?: {
  search?: string;
  isActive?: boolean;
}): Promise<OrgClient[]> {
  const query = buildQuery({
    search: params?.search,
    isActive: params?.isActive,
  });
  const data = await request<{ items: OrgClient[] }>(
    `/admin/org-clients${query}`,
    {},
    { isAdmin: true }
  );
  return data.items;
}

export async function createAdminOrgClient(
  input: CreateOrgClientInput
): Promise<OrgClient> {
  return request<OrgClient>(
    "/admin/org-clients",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { isAdmin: true }
  );
}

export async function getAdminCampaignReports(
  params: AdminCampaignReportParams
): Promise<PaginatedResponse<CampaignReport>> {
  const { orgClientId, page, pageSize, fromDate, toDate } = params;
  const query = buildQuery({
    orgClientId,
    page,
    pageSize,
    fromDate,
    toDate,
  });
  return request<PaginatedResponse<CampaignReport>>(
    `/admin/campaign-reports${query}`,
    {},
    { isAdmin: true }
  );
}

export async function createAdminCampaignReport(
  input: CreateCampaignReportInput
): Promise<CampaignReport> {
  return request<CampaignReport>(
    "/admin/campaign-reports",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { isAdmin: true }
  );
}

export async function getAdminTopups(
  params: AdminTopupParams
): Promise<PaginatedResponse<TopupRecord>> {
  const { orgClientId, page, pageSize, fromDate, toDate } = params;
  const query = buildQuery({
    orgClientId,
    page,
    pageSize,
    fromDate,
    toDate,
  });
  return request<PaginatedResponse<TopupRecord>>(
    `/admin/topups${query}`,
    {},
    { isAdmin: true }
  );
}

export async function createAdminTopup(
  input: CreateTopupInput
): Promise<TopupRecord> {
  return request<TopupRecord>(
    "/admin/topups",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { isAdmin: true }
  );
}

export async function getClientDashboard(
  orgClientCode: string,
  fromDate?: string,
  toDate?: string
): Promise<ClientDashboardResponse> {
  const query = buildQuery({
    orgClientCode,
    fromDate,
    toDate,
  });
  return request<ClientDashboardResponse>(`/client/dashboard${query}`);
}

export async function getClientCampaignReports(
  params: ClientListParams
): Promise<PaginatedResponse<CampaignReport>> {
  const { orgClientCode, page, pageSize, fromDate, toDate } = params;
  const query = buildQuery({
    orgClientCode,
    page,
    pageSize,
    fromDate,
    toDate,
  });
  return request<PaginatedResponse<CampaignReport>>(
    `/client/campaign-reports${query}`
  );
}

export async function getClientTopups(
  params: ClientListParams
): Promise<PaginatedResponse<TopupRecord>> {
  const { orgClientCode, page, pageSize, fromDate, toDate } = params;
  const query = buildQuery({
    orgClientCode,
    page,
    pageSize,
    fromDate,
    toDate,
  });
  return request<PaginatedResponse<TopupRecord>>(
    `/client/topups${query}`
  );
}
