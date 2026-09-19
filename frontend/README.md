# Frontend — Financial Analytics Dashboard

React 19 + TypeScript + Vite 8 SPA: JWT login, protected dashboard with
analytics charts, server-side transaction table, and configurable CSV export.
See the repository-root `README.md` for full setup and architecture docs.

## Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Vite dev server (http://localhost:5173)  |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run lint`  | oxlint                                   |
| `npm run preview` | Preview the production build           |

## Configuration

Copy `.env.example` to `.env`. `VITE_API_URL` must point at the backend API
(default `http://localhost:5000/api`).

## Layout

`api/` (one axios client + domain services), `context/` + `hooks/`
(auth state, debounced value, TanStack Query data hooks), `components/`
(dashboard, table, filters, export dialog), `pages/` (Login, Dashboard,
NotFound), `app/` (router), `types/` (backend-mirroring contracts),
`utils/` (formatting, download), `lib/` (MUI theme).
