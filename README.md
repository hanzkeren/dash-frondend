# Ads Client Dashboard Backend

Backend service for the Ads Client Dashboard. Provides REST APIs for both admin management and client-facing dashboards built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Stack

- Node.js 18+, Express 5, TypeScript.
- PostgreSQL accessed via Prisma ORM.
- Authentication: simple admin bearer token for `/api/admin/*` routes (`ADMIN_TOKEN`).

## Getting Started

```bash
npm install
npm run prisma:migrate   # run migrations
npm run prisma:seed      # optional sample data
npm run dev              # start dev server at http://localhost:4000
```

Environment variables (`.env`):

```
DATABASE_URL=postgresql://...
PORT=4000
ADMIN_TOKEN=super-secret-admin-token
CURRENCY=USD
```

## Data Model

- **OrgClient** – client organizations (`code`, `name`, `isActive`, timestamps).
- **CampaignReport** – daily spend per org/account; unique on `(orgClientId, reportDate, accountId)`.
- **TopupRecord** – topup history per org (`topupDate`, `jenis`, `clientTopup`).
- **Admin** – single admin user (seeded `hanzkeren`).

Summary metrics are computed at query time: `totalTopup = Σ clientTopup`, `totalSpend = Σ clientSpend`, `sisaSaldo = totalTopup - totalSpend`. Currency defaults to USD (override via `CURRENCY`).

## API Overview (Base `/api`)

### Auth

- All `/api/admin/*` routes require header `Authorization: Bearer <ADMIN_TOKEN>`.
- `/api/client/*` routes are public but require `orgClientCode` query param.

### Admin Routes

1. `POST /admin/org-clients`
   - Body `{ code, name }`. Creates new org client. 409 on duplicate `code`.

2. `GET /admin/org-clients?search=&isActive=true`
   - Filters by `code`/`name` (contains) and `isActive`. Returns `{ items: OrgClient[] }`.

3. `POST /admin/campaign-reports`
   - Body `{ orgClientId, reportDate: 'YYYY-MM-DD', accountId, clientSpend }`.
   - 404 if org missing. 409 if unique constraint violated.

4. `GET /admin/campaign-reports?orgClientId=UUID&fromDate=&toDate=&page=1&pageSize=20`
   - Mandatory `orgClientId`, optional date range, pagination. Returns `{ items, total, page, pageSize }`.

5. `POST /admin/topups`
   - Body `{ orgClientId, topupDate: 'YYYY-MM-DD', jenis, clientTopup }`.

6. `GET /admin/topups?orgClientId=UUID&fromDate=&toDate=&page=1&pageSize=20`
   - Same filtering/pagination shape as reports.

Validation errors respond with `400 { message, errors: [{ path, message }] }`; missing/invalid token → `401`; not found → `404`.

### Client Routes

1. `GET /client/dashboard?orgClientCode=CODE&fromDate=&toDate=`
   ```json
   {
     "orgClient": { "id": "...", "code": "...", "name": "..." },
     "summary": { "totalTopup": 5000000, "totalSpend": 3200000, "sisaSaldo": 1800000, "currency": "USD" },
     "latestCampaignReports": [{ "reportDate": "2025-12-05", "accountId": "123-456", "clientSpend": 500000, "currency": "USD" }],
     "latestTopups": [{ "topupDate": "2025-12-04", "jenis": "Transfer BCA", "clientTopup": 1000000, "currency": "USD" }]
   }
   ```
   - Use for summary cards + recent activity lists.

2. `GET /client/campaign-reports?orgClientCode=CODE&fromDate=&toDate=&page=&pageSize=`
   - Same payload as admin list for rendering paginated tables.

3. `GET /client/topups?orgClientCode=CODE&fromDate=&toDate=&page=&pageSize=`
   - Paginated topup data.

All `fromDate`/`toDate` params must be `YYYY-MM-DD` and `fromDate <= toDate`.

## Frontend Integration Notes

- Centralize API base URL (`/api`). Attach admin token for management UI requests.
- Pagination responses already include `total`, `page`, `pageSize` → plug directly into table controls.
- Money fields now include a `currency` flag (default USD). Format client-side as needed.
- Leverage admin list endpoint for select inputs (e.g., choose org client).
- Surface validation errors from backend (`errors` array) in forms.
- Seed script creates sample clients (`yakuza-dentoto`, `sakura-digital`) for immediate UI testing.

Need an OpenAPI/Swagger file next? Let me know!
