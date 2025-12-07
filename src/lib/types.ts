export interface OrgClient {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignReport {
  id: string;
  orgClientId: string;
  reportDate: string;
  accountId: string;
  clientSpend: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TopupRecord {
  id: string;
  orgClientId: string;
  topupDate: string;
  jenis: string;
  clientTopup: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateOrgClientInput {
  code: string;
  name: string;
}

export interface CreateCampaignReportInput {
  orgClientId: string;
  reportDate: string;
  accountId: string;
  clientSpend: number;
}

export interface CreateTopupInput {
  orgClientId: string;
  topupDate: string;
  jenis: string;
  clientTopup: number;
}

export interface AdminCampaignReportParams {
  orgClientId: string;
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
}

export interface AdminTopupParams {
  orgClientId: string;
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
}

export interface ClientListParams {
  orgClientCode: string;
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
}

export interface ClientDashboardSummary {
  totalTopup: number;
  totalSpend: number;
  sisaSaldo: number;
  currency: string;
}

export interface ClientDashboardResponse {
  orgClient: {
    id: string;
    code: string;
    name: string;
  };
  summary: ClientDashboardSummary;
  latestCampaignReports: Array<{
    reportDate: string;
    accountId: string;
    clientSpend: number;
    currency?: string;
  }>;
  latestTopups: Array<{
    topupDate: string;
    jenis: string;
    clientTopup: number;
    currency?: string;
  }>;
}

export interface ApiValidationError {
  path?: string;
  message: string;
}
