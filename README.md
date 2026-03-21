# Mining M&A — Acquisition Calculator

Web application for **mining sector M&A** workflows: company profiles, DCF-style valuation, multi-module calculators, and role-specific dashboards (analyst, executive, admin). **Production is hosted on [Vercel](https://vercel.com)** with [Neon](https://neon.tech/) Postgres.

**Repository:** [github.com/zan4yov/mining-mna](https://github.com/zan4yov/mining-mna)  
**Production (example):** `https://mining-mna.vercel.app`

### Accounts (where credentials live)

- **Passwords and user records are not documented in this repository.** They exist only in your Postgres database.
- After deployment, **super admins** sign in and manage **email, role, and active status** under **Admin → Users** in the running app. That screen is the authoritative place to see **who** can access the system (never commit passwords or shared demo accounts here).

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
| Hosting | [Vercel](https://vercel.com/) |
| API | [tRPC](https://trpc.io/) + [TanStack Query](https://tanstack.com/query) |
| Auth | [Auth.js](https://authjs.dev/) (NextAuth v5) |
| Database | [Neon](https://neon.tech/) Postgres + [Drizzle ORM](https://orm.drizzle.team/) |
| UI | Tailwind CSS, Radix, shadcn/ui–style components |
| AI (optional) | [Groq](https://groq.com/) for extraction endpoints |

Optional: Vercel Blob, Upstash Redis (see `.env.example`).

---

## Production deployment (Vercel) — primary workflow

The app is designed to **run on Vercel**; you do **not** need `npm run dev` for day-to-day use once deployed.

### 1. Connect GitHub

1. Push this repo to GitHub (`main` or your production branch).
2. In [Vercel](https://vercel.com): **Add New → Project** → import **`zan4yov/mining-mna`** (or your fork).
3. **Framework:** Next.js (default). **Build:** `npm run build` (default). **Install:** `npm install` (default).

### 2. Database (Neon)

**Recommended:** Vercel **Storage → Create Database → [Neon](https://neon.tech/)** and attach it to the project so `DATABASE_URL` is set automatically.

**Alternative:** Create a database in the [Neon console](https://console.neon.tech/), copy the connection string (`sslmode=require`), and add it in Vercel as **`DATABASE_URL`**.

### 3. Environment variables (Vercel)

**Project → Settings → Environment Variables** — set for **Production** (and **Preview** if you use preview deployments):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` — unique per environment |
| `AUTH_URL` | Yes | **Exact** public origin, e.g. `https://mining-mna.vercel.app` or your custom domain (`https://…`) |
| `NEXT_PUBLIC_APP_URL` | Yes | **Same value as `AUTH_URL`** |
| `GROQ_API_KEY` | If you use AI extraction | From [Groq console](https://console.groq.com/) |

Do **not** set `NODE_ENV=development` on Vercel. Do **not** use `http://localhost:3000` for `AUTH_URL` / `NEXT_PUBLIC_APP_URL` in production.

After any change to env vars, **Redeploy** so the build and Edge/runtime pick them up.

`next.config.mjs` maps **`AUTH_URL` → `NEXTAUTH_URL`** and **`AUTH_URL` → `NEXT_PUBLIC_APP_URL`** (when the latter is unset) so the client bundle matches deployment. Runtime code does **not** hardcode `localhost`; tRPC uses `lib/public-origin.ts`.

### 4. First deploy and database schema

1. Trigger a deployment (push to `main` or **Deploy** in Vercel).
2. Apply the Drizzle schema to **the same** Neon database Vercel uses (from any machine with Node — **no** `npm run dev` required):

   ```bash
   npm i -g vercel
   vercel link
   vercel env pull .env.local
   npm run db:push
   ```

   Optional **first super admin** (env-only; no credentials in the repo): set `SEED_ENABLE=true`, `SEED_SUPER_ADMIN_EMAIL`, and `SEED_SUPER_ADMIN_PASSWORD` in `.env.local` (or Vercel), then run `npm run db:bootstrap` once. Remove those variables after the account exists.

   `vercel env pull` writes secrets to `.env.local` (gitignored). `drizzle.config.ts` and scripts read it. Alternatively paste `DATABASE_URL` into `.env.local` manually.

### 5. URLs to use

| URL | Use |
|-----|-----|
| **Production domain** | e.g. `https://mining-mna.vercel.app` — share this with users |
| **Preview / branch URLs** | May return **401** if [Deployment Protection](https://vercel.com/docs/security/deployment-protection) is on — sign in with Vercel or disable protection for public QA |

### 6. Smoke test on production

Open your **`https://…`** origin, sign in, and verify `/analyst`, `/executive`, `/admin` with the appropriate roles. If auth misbehaves, re-check **`AUTH_URL`**, **`NEXT_PUBLIC_APP_URL`**, and **`AUTH_SECRET`** for that environment.

---

## Troubleshooting (production)

- **Login or redirects broken:** `AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match the URL in the browser (including `https://`). Redeploy after edits.
- **Companies/users empty, “Failed to fetch” on tRPC, or CORS to `localhost`:** The client bundle must not use `http://localhost` for `NEXT_PUBLIC_APP_URL` on Vercel. Set `NEXT_PUBLIC_APP_URL` and `AUTH_URL` to your production `https://…` origin, redeploy, and confirm `npm run build` was run with those vars. The app also falls back to `VERCEL_URL` when `VERCEL=1` and the configured origin is localhost (see `lib/public-origin.ts`).
- **Sign-out lands on wrong host:** The app uses `signOut({ redirect: false })` then navigates to `{origin}/login` so the server’s callback URL cannot send users to localhost.
- **Preview URL 401:** Deployment Protection — use the production domain or adjust protection in Vercel.
- **`DATABASE_URL` in scripts:** `drizzle.config.ts` loads `.env.local`; for one-off commands you can use `vercel env pull` or `dotenv-cli` pointing at a file that contains `DATABASE_URL`.

---

## Project layout

```
app/                 # Next.js routes (auth, analyst, executive, admin, API)
components/          # UI
server/              # Auth, DB, tRPC routers
lib/                 # Calculations, TRPC helpers, auth-client
scripts/bootstrap-admin.ts  # Optional first super_admin from SEED_* env (see above)
docs-requirement/    # Product/design reference
```

---

## Optional: local development

Only needed if you change code and want to run the app on your machine.

```bash
git clone https://github.com/zan4yov/mining-mna.git && cd mining-mna
npm install
cp .env.example .env.local   # fill DATABASE_URL, AUTH_SECRET, AUTH_URL=http://localhost:3000, NEXT_PUBLIC_APP_URL=http://localhost:3000
npm run db:push
npm run dev
```

Open `http://localhost:3000`. See `.env.example` for all keys.

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local dev server |
| `npm run build` / `npm run start` | Production-like run locally |
| `npm run db:push` / `db:bootstrap` / `db:studio` | Database |

---

## Design reference

- `docs-requirement/mining_mna_stage2.jsx` — prototype wireframe  
- `docs-requirement/CURSOR_CONTEXT.md` — design tokens  

---

## License

Private (`"private": true` in `package.json`). All rights reserved unless you add a license file.
