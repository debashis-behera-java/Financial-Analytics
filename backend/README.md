# Backend — Financial Analytics API

Express 4 + Mongoose 9 API for the Financial Analytics Dashboard.
See the repository-root `README.md` for full setup, API, and architecture docs.

## Scripts

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Start with hot-reload (`tsx watch src/server.ts`) |
| `npm run build`    | Compile TypeScript to `dist/`                    |
| `npm start`        | Run the compiled server (`node dist/server.js`)  |
| `npm run typecheck`| Type-check without emitting (`tsc --noEmit`)    |
| `npm run seed`     | Upsert 300 transactions from `data/transactions.json` |
| `npm run seed:user`| Upsert the demo login user from env vars        |

## Configuration

Copy `.env.example` to `.env`. `JWT_SECRET` has no default and is required;
`DEMO_USER_PASSWORD` is required for `seed:user`. Never commit real secrets
(`.env` is gitignored).

## Layout

`routes/` → `controllers/` → `services/` → `models/`, with `validation/`
(zod), `middleware/` (Bearer JWT auth, errors), `utils/` (JWT, CSV, errors),
`config/` (validated env, DB connection), and `scripts/` (seeds).
