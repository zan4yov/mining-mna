# Mining M&A — Acquisition Calculator

Web application for **mining sector M&A** workflows: company profiles, DCF-style valuation, multi-module calculators, and role-specific dashboards (analyst, executive, admin). Built as a production Next.js stack aligned with the design spec in `docs-requirement/`.

**Repository:** [github.com/zan4yov/mining-mna](https://github.com/zan4yov/mining-mna)

---

## Features

| Area | Description |
|------|-------------|
| **Analyst** | Company list, document extraction (AI-assisted), calculator workspace with **nine modules** (M1–M9): profile, reserves, pit-to-port, valuation, sensitivity, scenarios, deal structure, synergies, risk & regulatory. |
| **Executive** | Portfolio-style view: watchlist, NPV highlights, scenarios, and comparison tables. |
| **Admin** | User management and system-oriented views (super admin). |
| **Auth** | Email/password sign-in with role-based routing and middleware protection. |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js](https://nextjs.org/) 14 (App Router), React 18, TypeScript |
| API | [tRPC](https://trpc.io/) + [TanStack Query](https://tanstack.com/query) |
| Auth | [Auth.js](https://authjs.dev/) (NextAuth v5) + Drizzle adapter |
| Database | [Neon](https://neon.tech/) Postgres + [Drizzle ORM](https://orm.drizzle.team/) |
| UI | Tailwind CSS, [Radix](https://www.radix-ui.com/) primitives, [shadcn/ui](https://ui.shadcn.com/)-style components |
| AI (optional) | [Groq](https://groq.com/) for extraction endpoints |

Optional integrations (see `.env.example`): Vercel Blob, Upstash Redis.

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- A **PostgreSQL** database URL (Neon is the default target; any Postgres-compatible URL works for local experiments)

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/zan4yov/mining-mna.git
cd mining-mna
npm install
```

### 2. Environment

Copy the example env file and fill in secrets:

```bash
cp .env.example .env.local
```

Never commit `.env.local`. Required for a working app:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string (SSL for Neon) |
| `AUTH_SECRET` | Random secret — e.g. `openssl rand -base64 32` |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | App base URL (e.g. `http://localhost:3000`) |
| `GROQ_API_KEY` | For AI extraction (if you use that feature) |

See `.env.example` for optional keys.

### 3. Database schema and seed

`npm run db:push` reads `.env.local` via `drizzle.config.ts`. `npm run db:seed` loads `.env.local` when present (see `package.json` script).

```bash
npm run db:push
npm run db:seed
```

`db:push` applies the Drizzle schema to your database. `db:seed` creates demo users and sample companies (skips if already seeded).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` for protected routes.

---

## Demo users (after seed)

Use these **only in development**; change passwords before any real deployment.

| Role | Email | Password |
|------|--------|----------|
| Super admin | `admin@local.test` | `Admin123!` |
| Analyst | `analyst@local.test` | `team123` |
| Executive | `exec@local.test` | `board456` |

Routing: executives land on `/executive`, analysts on `/analyst`, super admins on `/admin`.

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema to DB (good for local/dev) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed demo data |

---

## Project layout (high level)

```
app/                 # Next.js routes (auth, analyst, executive, admin, API)
components/          # UI: analyst calculator, executive, admin, shared UI
server/              # Auth, DB client, tRPC routers
lib/                 # Calculations, validations, TRPC client helpers
scripts/seed.ts      # Database seed
docs-requirement/    # Product/design reference (prototype + Cursor context)
```

---

## Design reference

- `docs-requirement/mining_mna_stage2.jsx` — original UI prototype and calculation reference
- `docs-requirement/CURSOR_CONTEXT.md` — design tokens and component notes

---

## Troubleshooting

- **`DATABASE_URL` missing when running `db:push` or `db:seed`:** Confirm `.env.local` exists in the project root and contains `DATABASE_URL`. For CI or shells without `.env.local`, export `DATABASE_URL` in the environment.
- **Build warnings about `DATABASE_URL`:** A placeholder may be used at build time; runtime must use a real URL on your host.

---

## License

This project is **private** (`"private": true` in `package.json`). All rights reserved unless you add an explicit license file.
