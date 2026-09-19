# Financial Analytics Dashboard

Full-stack financial analytics application: an Express + MongoDB backend serving
transaction, analytics, and CSV-export APIs, and a React + Material UI frontend
with JWT authentication, a metrics/charts dashboard, and a server-side
transaction table (search, filters, sorting, pagination, configurable export).

## Features

- **JWT authentication** — login, session restore via `/me`, logout, protected
  routes, expired/invalid-token handling.
- **Dashboard** — total revenue, total expenses, net balance, transaction count;
  monthly revenue-vs-expenses bar chart; category donut with totals and shares.
- **Transaction table** — server-side search (debounced), category / status /
  user / date-range / amount-range filters, sortable columns, page sizes
  10 / 25 / 50. The browser never filters, sorts, or paginates locally.
- **Configurable CSV export** — choose columns, exports **all** records matching
  the current search/filters/sort (never just the visible page). Generated
  server-side with BOM + CRLF, field escaping, and formula-injection protection.

## Architecture

```
Financial Analysis/
├── docker-compose.yml        # MongoDB 7 (financial-mongo, :27017)
├── backend/                  # Express API (port 5000)
│   └── src/
│       ├── routes/           # auth, transactions, analytics, health
│       ├── controllers/      # thin handlers (JSON or CSV responses)
│       ├── services/         # filter builders, aggregations, export queries
│       ├── validation/       # zod schemas (shared filter refinements)
│       ├── models/           # User (passwordHash never selected), Transaction
│       ├── middleware/       # requireAuth (Bearer JWT), error handler
│       ├── utils/            # jwt, csv generation, AppError
│       ├── scripts/          # seed (transactions), seed-user (demo login)
│       └── config/           # env (validated), db
└── frontend/                 # React SPA (Vite dev port 5173)
    └── src/
        ├── api/              # one axios client + per-domain services
        ├── context/ + hooks/ # auth state, debounced value, react-query hooks
        ├── components/       # dashboard cards/charts, table, filters, export dialog
        ├── pages/            # Login, Dashboard, NotFound
        ├── routes|app/       # router (/login public, / protected)
        └── types/ + utils/   # API contracts, formatting, download helper
```

Route → controller → service → model on the backend; components consume
TanStack Query hooks (never raw axios) on the frontend.

## Technology stack

| Layer    | Stack                                                        |
| -------- | ------------------------------------------------------------ |
| Backend  | Node 20, Express 4, Mongoose 9, MongoDB 7, jsonwebtoken, bcrypt, zod 4 |
| Frontend | React 19, TypeScript, Vite 8, MUI 9, React Router 7, TanStack Query 5, Recharts 3, axios |

## Prerequisites

- Node.js 20+
- Docker Desktop (for MongoDB), or a local MongoDB 7 on `:27017`
- npm

## Installation

```powershell
# Backend
cd backend
npm install
Copy-Item .env.example .env   # then set JWT_SECRET + DEMO_USER_PASSWORD

# Frontend (second terminal)
cd frontend
npm install
Copy-Item .env.example .env   # VITE_API_URL defaults to http://localhost:5000/api
```

## Environment variables

Backend (`backend/.env`, see `.env.example` — never commit real secrets):

| Variable            | Required | Default                                   |
| ------------------- | -------- | ----------------------------------------- |
| `PORT`              | no       | `5000`                                    |
| `CORS_ORIGIN`       | no       | `http://localhost:5173`                   |
| `NODE_ENV`          | no       | `development`                             |
| `MONGODB_URI`       | no       | `mongodb://localhost:27017/financial_analytics` |
| `JWT_SECRET`        | **yes**  | — (no default; app refuses to start)      |
| `JWT_EXPIRES_IN`    | no       | `7d`                                      |
| `DEMO_USER_EMAIL`   | no       | `demo@example.com`                        |
| `DEMO_USER_PASSWORD`| yes (for `seed:user`) | —                            |
| `DEMO_USER_ROLE`    | no       | `admin`                                   |

Frontend (`frontend/.env`):

| Variable         | Default                      |
| ---------------- | ---------------------------- |
| `VITE_API_URL`   | `http://localhost:5000/api`  |
| `VITE_APP_NAME`  | `Financial Analytics Dashboard` |

## MongoDB setup

```powershell
# From the repository root — starts financial-mongo with persisted volume
docker compose up -d mongo
```

## Seed data

```powershell
cd backend
npm run seed         # upserts 300 transactions from data/transactions.json (duplicate-safe)
npm run seed:user    # upserts the demo login user from DEMO_USER_* env vars
```

Dataset: 300 transactions spanning 2024-01 → 2024-12; categories `Revenue` /
`Expense`; statuses `Paid` / `Pending`; all amounts are positive magnitudes
(money direction comes from `category`, never from the sign).

## Startup

```powershell
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev        # or: npm run build; npm start

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Demo login: `demo@example.com` / password from `DEMO_USER_PASSWORD`
(`DemoPass123!` in the local dev `.env`).

## API overview

Errors use `{ message, status }`. Unless noted, endpoints require
`Authorization: Bearer <JWT>` (401 without/invalid/expired token).

### `GET /api/health`

- **Auth:** none. **Purpose:** liveness probe.
- **Response 200:** `{ status: "ok" }`.

### `POST /api/auth/login`

- **Auth:** none. **Purpose:** authenticate and issue a Bearer token.
- **Body:** `{ email: string, password: string }`.
- **Response 200:** `{ token, tokenType: "Bearer", expiresIn, user }`
  (`user` never contains a password hash).
- **Status codes:** `400` validation failure, `401` invalid credentials
  (generic message, no hint which field was wrong).

### `GET /api/auth/me`

- **Auth:** required. **Purpose:** resolve the stored token to the current user.
- **Response 200:** `{ user }`.
- **Status codes:** `401` missing/invalid/expired token.

### `POST /api/auth/logout`

- **Auth:** none (stateless). **Purpose:** consistent logout call; the client
  always discards the token itself.
- **Response 200:** `{ message }`.

### `GET /api/transactions`

- **Auth:** required. **Purpose:** paginated transaction list; all search,
  filtering, sorting, and pagination execute in MongoDB.
- **Query params:** `page` (default 1), `limit` (default 10, max 100),
  `search` (case-insensitive over `category`, `status`, `user_id`,
  `user_profile`, plus numeric `id` match), `startDate`, `endDate`
  (date-only `endDate` is inclusive to end-of-day UTC), `minAmount`,
  `maxAmount`, `category`, `status`, `user_id`, `sortBy`
  (`id|date|amount|category|status|user_id`, default `date`), `sortOrder`
  (`asc|desc`, default `desc`).
- **Response 200:** `{ data: [{ id, date, amount, category, status, user_id,
  user_profile }], pagination: { page, limit, total, totalPages } }`.
- **Status codes:** `400` invalid params/range, `401` unauthorized.

### `GET /api/transactions/:id`

- **Auth:** required. **Purpose:** single transaction by numeric `id`
  (or Mongo ObjectId).
- **Response 200:** `{ data }` (no `_id`/`__v` internals).
- **Status codes:** `400` malformed id, `401` unauthorized, `404` not found.

### `GET /api/transactions/export`

- **Auth:** required. **Purpose:** CSV of **all** records matching the given
  filters/search/sort — same semantics as the list endpoint but with **no**
  `page`/`limit`, so the file never represents just the visible page.
- **Query params:** same filters/search/sort as `GET /api/transactions`,
  plus required `columns` (comma-separated whitelist subset of
  `id,date,amount,category,status,user_id,user_profile`, at least one).
- **Response 200:** `text/csv; charset=utf-8` with
  `Content-Disposition: attachment;
  filename="financial-transactions-YYYY-MM-DD.csv"`, UTF-8 BOM + CRLF,
  header row of the selected columns.
- **Status codes:** `400` invalid filters or columns, `401` unauthorized.

### `GET /api/analytics/summary`

- **Auth:** required. **Purpose:** financial totals over the (optionally
  filtered) dataset, aggregated in MongoDB.
- **Query params:** same filters as the transaction list (no pagination).
- **Response 200:** `{ totalRevenue, totalExpenses, netBalance,
  transactionCount }`.
- **Status codes:** `400` invalid filters, `401` unauthorized.

### `GET /api/analytics/revenue-expense`

- **Auth:** required. **Purpose:** monthly time series for the revenue chart.
- **Query params:** same filters as the transaction list.
- **Response 200:** `{ data: [{ period ("YYYY-MM"), revenue, expenses,
  count }] }`, ascending; only months present in the data.
- **Status codes:** `400` invalid filters, `401` unauthorized.

### `GET /api/analytics/categories`

- **Auth:** required. **Purpose:** per-category totals for the breakdown chart.
- **Query params:** same filters as the transaction list.
- **Response 200:** `{ data: [{ category, total, count }] }`, largest total
  first.
- **Status codes:** `400` invalid filters, `401` unauthorized.

## Authentication flow

Stateless Bearer JWT (`jsonwebtoken`, secret from `JWT_SECRET`, default 7-day
expiry). `requireAuth` verifies the token, reloads the user from MongoDB
(deleted users lose access immediately), and attaches a hash-free user object.
The frontend stores the token in `localStorage`, attaches it via an axios
interceptor, restores the session with `GET /me` on load, and clears the token
plus redirects to `/login` on any non-login 401. Logout calls the backend
best-effort and always discards the token locally.

## Analytics

MongoDB aggregation pipelines (`$match` on the shared filter builder so
indexes apply, then `$group/$sort/$project`). Revenue = sum of `amount` where
`category === "Revenue"`; expenses likewise for `"Expense"`; net = difference.
Monthly buckets (`%Y-%m`) for the time series; per-category totals for the donut.
Only periods/categories present in the (filtered) data are returned.

## Transaction filtering / search / sorting

All executed in MongoDB. Search is a case-insensitive regex over a fixed
whitelist (`category`, `status`, `user_id`, `user_profile`, plus numeric `id`
match) combined with other filters via `$and`. Dates use real `Date`
comparisons (date-only `endDate` is inclusive to end-of-day UTC). Sort fields
and order are enum-validated; regex input is escaped.

## CSV export

`GET /api/transactions/export` reuses the list endpoint's filter/search/sort
semantics with **no pagination** and a required whitelisted `columns`
parameter. The server returns `text/csv; charset=utf-8` with
`Content-Disposition: attachment; filename="financial-transactions-YYYY-MM-DD.csv"`,
UTF-8 BOM + CRLF line endings, RFC-4180 quoting, and single-quote prefixing of
string cells starting with `= + - @` (numeric `id`/`amount` pass through
untouched). The UI dialog shows the matching-record total explicitly so the
"all pages, not the current page" scope is never ambiguous.

## Testing

No test runner is configured; verification is deterministic and scripted:

```powershell
cd backend
npm run typecheck
npm run build

cd ../frontend
npx tsc -b
npm run lint
npm run build
```

API behavior is verified with short-timeout HTTP checks (login valid/invalid,
`/me`, list pagination/search/filters/sort, analytics totals, export headers +
row counts + escaping, 401 matrix) plus direct MongoDB counts. Expected live
values: 300 transactions; summary revenue `339803.25`, expenses `206605`,
net `133198.25`.

## Project structure decisions

- One axios instance; 401s (except login) clear the token and emit a
  single `auth:session-expired` event — routing stays in one place.
- One filter serializer shared by the table query and the CSV export, so the
  exported dataset can never drift from the viewed dataset.
- Pure CSV helpers (`backend/src/utils/csv.ts`) with no DB/Express coupling.
- Verified category/status values (`Revenue|Expense`, `Paid|Pending`) back the
  UI selects instead of invented options.

## Known limitations

- Analytics dashboard shows unfiltered snapshots (backend supports filters;
  UI controls not yet added).
- CSV export loads the full filtered result set in one query — fine for the
  current scale; extremely large datasets would want cursor/streaming.
- Auth tokens are `localStorage`-stored Bearer JWTs with no refresh or
  server-side revocation (documented in the logout contract).
#   F i n a n c i a l - A n a l y t i c s  
 