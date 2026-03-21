# Mining M&A Intelligence Platform — Stage II
## Cursor Development Brief · Full-Stack Vercel Native

> **How to use this document**
> Open this file in Cursor. Work through each section in order. Copy each prompt block
> directly into Cursor Composer (`Cmd+I`). Execute, review, then move to the next prompt.
> Do not skip sections — each builds on the previous.

---

## 0. Project Overview

**What we are building:**
An internal enterprise web application for M&A analysts and executives in the mining sector. Analysts upload financial and geological documents, an AI engine extracts structured data, and analysts use a 9-module DCF calculator to build valuation snapshots per target company. Executives log in to a separate read-only dashboard showing aggregated results.

**Three user roles, completely separated by route:**
- `super_admin` → `/admin/*` — user management, system overview, audit logs
- `analyst` → `/analyst/*` — full calculator, AI extraction, snapshot management
- `executive` → `/executive/*` — read-only dashboard, company watchlist, portfolio comparison

**Role hierarchy:** Super admin creates and manages all users. Analysts and executives cannot create accounts themselves — all access is provisioned by the super admin.

**Core IP:** Every saved calculation snapshot is stored as versioned company data. This is the firm's proprietary valuation library.

---

## 1. Stack & Technology Decisions

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Vercel native, RSC, zero-config deploy |
| Language | TypeScript (strict) | End-to-end type safety |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, accessible components |
| API | tRPC v11 | Type-safe RPC, no REST boilerplate |
| Validation | Zod | Runtime + compile-time schema safety |
| Auth | Auth.js v5 (NextAuth) | RBAC, JWT, Edge Middleware support |
| ORM | Drizzle ORM | Type-safe Postgres, lightweight |
| Database | Neon Postgres (Vercel integration) | Serverless, scales to zero |
| File Storage | Vercel Blob | PDF uploads, serverless |
| Cache / Session | Upstash Redis (Vercel Marketplace) | Replaces sunset Vercel KV, same Redis API |
| AI — Extraction | Groq (llama-3.3-70b-versatile) | Free tier, fast, JSON mode, swap-ready |
| AI — Upgrade Path | Anthropic Claude claude-sonnet-4-6 | Production upgrade — change 1 env var |
| AI — SDK | Vercel AI SDK + @ai-sdk/groq | Streaming, provider-agnostic |
| Deployment | Vercel | Native, preview deploys, Edge runtime |

---

## 2. Environment Variables

Create `.env.local` in the project root. **Never commit this file.**

```env
# Database — Neon Postgres
# Get from: Vercel Dashboard → Storage → Neon → .env.local
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# Auth.js
# Generate: openssl rand -base64 32
AUTH_SECRET=your-random-secret-here
AUTH_URL=http://localhost:3000

# AI Extraction — Groq (free tier)
# Get free key: console.groq.com → API Keys
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...

# Future upgrade to Claude (leave blank until ready)
# AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Vercel Blob
# Get from: Vercel Dashboard → Storage → Blob → .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Upstash Redis (replaces sunset Vercel KV)
# Get from: Vercel Dashboard → Storage → Marketplace → Upstash → KV → .env.local
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 3. Project Structure

```
mining-mna/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                  # Login page (all roles)
│   ├── admin/
│   │   ├── layout.tsx                    # Admin shell + nav
│   │   ├── page.tsx                      # Admin dashboard (system overview)
│   │   └── users/
│   │       ├── page.tsx                  # User list + management
│   │       └── [userId]/
│   │           └── page.tsx              # Individual user detail + edit
│   ├── analyst/
│   │   ├── layout.tsx                    # Analyst shell + nav
│   │   ├── page.tsx                      # Company workspace list
│   │   ├── [companyId]/
│   │   │   ├── extract/
│   │   │   │   └── page.tsx              # AI extraction view
│   │   │   └── calculator/
│   │   │       ├── layout.tsx            # 9-module sidebar shell
│   │   │       └── [module]/
│   │   │           └── page.tsx          # Dynamic module page (1–9)
│   ├── executive/
│   │   ├── layout.tsx                    # Executive shell
│   │   └── page.tsx                      # Executive dashboard
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts              # Auth.js handler
│       ├── trpc/
│       │   └── [trpc]/
│       │       └── route.ts              # tRPC handler
│       └── ai/
│           ├── extract/
│           │   └── route.ts              # Claude extraction endpoint
│           └── stream/
│               └── route.ts              # Streaming responses
├── components/
│   ├── ui/                               # shadcn/ui primitives
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   ├── UserFormModal.tsx
│   │   ├── UserStatusBadge.tsx
│   │   ├── SystemStatsBar.tsx
│   │   └── AuditLogFeed.tsx
│   ├── analyst/
│   │   ├── CompanyCard.tsx
│   │   ├── ModuleNav.tsx
│   │   ├── NPVBadge.tsx
│   │   └── modules/
│   │       ├── M1CompanyProfile.tsx
│   │       ├── M2ReserveEvaluation.tsx
│   │       ├── M3PitToPort.tsx
│   │       ├── M4FinancialValuation.tsx
│   │       ├── M5SensitivityAnalysis.tsx
│   │       ├── M6ScenarioSimulation.tsx
│   │       ├── M7DealStructuring.tsx
│   │       ├── M8SynergyEstimation.tsx
│   │       └── M9RiskRegulatory.tsx
│   └── executive/
│       ├── WatchlistSidebar.tsx
│       ├── HeroNPV.tsx
│       ├── ScenarioStrip.tsx
│       ├── HistoryTable.tsx
│       └── PortfolioComparison.tsx
├── server/
│   ├── db/
│   │   ├── index.ts                      # Drizzle client
│   │   └── schema.ts                     # All table definitions
│   ├── trpc/
│   │   ├── index.ts                      # tRPC router root
│   │   ├── context.ts                    # Request context + auth
│   │   └── routers/
│   │       ├── admin.ts                  # User management (super_admin only)
│   │       ├── company.ts                # Company CRUD
│   │       ├── snapshot.ts               # Snapshot save/list
│   │       └── user.ts                   # User management
│   └── auth.ts                           # Auth.js config
├── lib/
│   ├── calculations.ts                   # DCF engine (pure functions)
│   ├── extraction.ts                     # Claude prompt + parser
│   ├── audit.ts                          # Audit log helpers
│   └── validations.ts                    # Shared Zod schemas
├── middleware.ts                         # Edge route protection
├── drizzle.config.ts
├── tailwind.config.ts
└── next.config.ts
```

---

## 4. Database Schema

Reference this when Cursor generates the Drizzle schema.

```
users
  id            uuid PK
  name          text
  email         text UNIQUE
  password      text (hashed, bcrypt)
  role          enum('super_admin', 'analyst', 'executive')
  team          text
  is_active     boolean DEFAULT true
  created_by    uuid FK → users.id (nullable — null for the first super_admin)
  last_login_at timestamp (nullable)
  created_at    timestamp
  updated_at    timestamp

companies
  id          uuid PK
  name        text
  ticker      text
  location    text
  type        text  (e.g. 'Thermal Coal')
  iup         text
  entity_type text
  listed_on   text
  mineral_class text
  share_gov   integer (0–100 %)
  share_public integer
  share_foreign integer
  status      enum('active', 'watchlist', 'archived')
  created_by  uuid FK → users.id
  created_at  timestamp
  updated_at  timestamp

snapshots
  id             uuid PK
  company_id     uuid FK → companies.id
  analyst_id     uuid FK → users.id
  date           date
  -- DCF parameters (all stored as numeric)
  coal_price     numeric
  disc_rate      numeric
  annual_prod    numeric
  mine_life      integer
  cash_cost      numeric
  royalty_rate   numeric
  tax_rate       numeric
  capex          numeric
  measured_mt    numeric
  indicated_mt   numeric
  inferred_mt    numeric
  measured_gar   integer
  indicated_gar  integer
  inferred_gar   integer
  recovery_rate  numeric
  strip_ratio    numeric
  hauling_dist   numeric
  barge_dist     numeric
  crush_cost     numeric
  port_handling  numeric
  acquisition_cost numeric
  debt_pct       numeric
  debt_cost      numeric
  loan_tenor     integer
  shared_infra   integer
  ga_consolidation numeric
  proc_savings   numeric
  -- Compliance flags
  iup_valid      boolean
  cert_clean     boolean
  amdal          boolean
  ppa            boolean
  dmb            boolean
  -- Computed outputs (pre-calculated on save)
  npv            numeric
  irr            numeric
  payback        numeric
  bear_npv       numeric
  bull_npv       numeric
  dd_score       numeric
  synergy        numeric
  recommendation enum('proceed', 'monitor', 'avoid')
  notes          text
  created_at     timestamp

documents
  id           uuid PK
  company_id   uuid FK → companies.id
  uploaded_by  uuid FK → users.id
  filename     text
  blob_url     text  (Vercel Blob URL)
  doc_type     enum('annual_report', 'geological', 'iup', 'financial', 'other')
  extracted    boolean DEFAULT false
  extraction_result jsonb  (raw Claude output)
  uploaded_at  timestamp

audit_log
  id           uuid PK
  actor_id     uuid FK → users.id  (who performed the action)
  action       enum('user_created', 'user_updated', 'user_deactivated', 'user_reactivated',
                    'user_deleted', 'password_reset', 'login_success', 'login_failed',
                    'snapshot_saved', 'company_created', 'document_uploaded', 'extraction_run')
  target_type  text  (e.g. 'user', 'company', 'snapshot')
  target_id    uuid (nullable — the affected record ID)
  metadata     jsonb (nullable — extra context, e.g. old/new values for updates)
  ip_address   text (nullable)
  created_at   timestamp
```

---

## 5. Cursor Prompts — Execute in Order

---

### PROMPT 01 — Project Scaffold

```
Create a new Next.js 14 project called "mining-mna" with the following setup:

1. Run: npx create-next-app@latest mining-mna --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

2. Install all dependencies:
   npm install @trpc/server @trpc/client @trpc/next @trpc/react-query @tanstack/react-query
   npm install drizzle-orm drizzle-kit @neondatabase/serverless
   npm install next-auth@beta @auth/drizzle-adapter
   npm install @vercel/blob @upstash/redis
   npm install ai @anthropic-ai/sdk
   npm install zod superjson
   npm install bcryptjs
   npm install @types/bcryptjs --save-dev

3. Install shadcn/ui:
   npx shadcn@latest init
   When prompted: TypeScript=yes, style=Default, base color=Slate, CSS variables=yes

4. Add these shadcn components:
   npx shadcn@latest add button input label select slider card badge separator tabs
   npx shadcn@latest add table dialog dropdown-menu toast avatar progress

5. Create the full folder structure as defined in the project brief:
   - app/(auth)/login/
   - app/analyst/[companyId]/extract/
   - app/analyst/[companyId]/calculator/[module]/
   - app/executive/
   - app/api/auth/[...nextauth]/
   - app/api/trpc/[trpc]/
   - app/api/ai/extract/
   - components/analyst/modules/
   - components/executive/
   - server/db/
   - server/trpc/routers/
   - lib/

6. Create .env.local from the template in the project brief (leave values as placeholders).

7. Create next.config.ts with:
   - images.domains: ['vercel-storage.com']
   - experimental.serverComponentsExternalPackages: ['@neondatabase/serverless']

Confirm the folder structure is created and all packages are installed successfully.
```

---

### PROMPT 02 — Database Schema

```
Create the Drizzle ORM schema for the Mining M&A application.

File: server/db/schema.ts

Requirements:
- Use drizzle-orm/pg-core imports
- Define all 5 tables: users, companies, snapshots, documents, audit_log
- Use pgTable, uuid, text, numeric, integer, boolean, timestamp, pgEnum, jsonb
- Generate UUIDs with crypto.randomUUID() as default
- Set created_at and updated_at with defaultNow()
- Define role enum: 'super_admin' | 'analyst' | 'executive'
- Define status enum: 'active' | 'watchlist' | 'archived'
- Define recommendation enum: 'proceed' | 'monitor' | 'avoid'
- Define doc_type enum as listed in the schema spec
- Define audit_action enum with all values from the schema spec
- Export TypeScript types for each table: User, Company, Snapshot, Document, AuditLog
- Also export Insert types: NewUser, NewCompany, NewSnapshot, NewDocument, NewAuditLog

users table additions vs the original spec:
- role must include 'super_admin' in the enum
- Add is_active boolean DEFAULT true
- Add created_by uuid references users(id) (nullable — self-referential FK)
- Add last_login_at timestamp (nullable)
- Add updated_at timestamp with defaultNow() + $onUpdate

audit_log table:
- id, actor_id (FK → users), action (enum), target_type (text), target_id (uuid nullable),
  metadata (jsonb nullable), ip_address (text nullable), created_at timestamp

Then create server/db/index.ts:
- Import neon from @neondatabase/serverless
- Import drizzle from drizzle-orm/neon-http
- Connect using process.env.DATABASE_URL
- Export db instance

Then create drizzle.config.ts:
- schema: './server/db/schema.ts'
- out: './drizzle'
- dialect: 'postgresql'
- dbCredentials.url from DATABASE_URL env

Add to package.json scripts:
  "db:generate": "drizzle-kit generate"
  "db:migrate": "drizzle-kit migrate"
  "db:studio": "drizzle-kit studio"
  "db:push": "drizzle-kit push"

All table column names should exactly match the schema spec in the project brief.
```

---

### PROMPT 03 — Auth Setup

```
Set up Auth.js v5 (NextAuth) for the Mining M&A app with role-based access control
for three roles: super_admin, analyst, and executive.

1. Create server/auth.ts:
   - Import NextAuth from 'next-auth'
   - Use Credentials provider (email + password login)
   - On authorize:
     * Query users table via Drizzle
     * Check is_active === true — reject with "Account is deactivated" if false
     * Compare password with bcryptjs.compare()
     * Update last_login_at in users table on success
     * Write audit_log entry: action='login_success', actor_id=user.id
     * On failed password: write audit_log entry: action='login_failed'
   - Include role, name, team, id in the JWT token and session
   - Configure session strategy: 'jwt'
   - Export { auth, handlers, signIn, signOut }

2. Create app/api/auth/[...nextauth]/route.ts:
   - Export GET and POST from handlers

3. Create middleware.ts at the root:
   - Import auth from server/auth
   - Protect routes with role-based guards:
     * /admin/*    → requires role === 'super_admin'
     * /analyst/*  → requires role === 'analyst'
     * /executive/* → requires role === 'executive'
     * /           → redirect to role-appropriate dashboard if authenticated
   - Role-to-dashboard redirect map:
     * super_admin → /admin
     * analyst     → /analyst
     * executive   → /executive
   - If authenticated user hits wrong role path → redirect to their correct dashboard
   - Unauthenticated on any protected route → redirect to /login
   - Use Edge-compatible code only (no Node.js APIs)
   - Export config with matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']

4. Create app/(auth)/login/page.tsx:
   - Server component wrapper
   - Clean login form using shadcn Card, Input, Button, Label
   - Form action calls signIn('credentials', { email, password, redirectTo: '/' })
   - The root / middleware will then redirect to the correct role dashboard
   - Show error state if credentials fail, including "Account deactivated" message
   - Styling: white card on light indigo-blue gradient background, Plus Jakarta Sans font

5. Create a seed script at scripts/seed.ts:
   - Creates 1 super_admin, 2 analyst users, and 2 executive users
   - Hashes passwords with bcryptjs (rounds: 10)
   - Inserts into users table using Drizzle
   - super_admin has created_by = null (first user, self-bootstrapped)
   - analysts and executives have created_by = super_admin.id
   - Add "db:seed": "tsx scripts/seed.ts" to package.json

Seed users:
  super_admin: { email: 'admin@mna.internal', password: 'admin123!', name: 'System Admin', team: 'IT Operations' }
  analysts:    { email: 'budi@mna.internal', password: 'team123', name: 'Budi Santoso', team: 'M&A Team' }
               { email: 'rina@mna.internal', password: 'team123', name: 'Rina Kusuma', team: 'M&A Team' }
  executives:  { email: 'direktur@mna.internal', password: 'board456', name: 'Pak Direktur', team: 'Board' }
               { email: 'komisaris@mna.internal', password: 'board456', name: 'Ibu Komisaris', team: 'Board' }
```

---

### PROMPT 04 — tRPC Setup

```
Set up tRPC v11 for the Mining M&A application.

1. Create server/trpc/context.ts:
   - Import auth from server/auth
   - Import db from server/db
   - Export createContext function that returns { session, db }
   - Session comes from auth() call

2. Create server/trpc/index.ts:
   - Initialize tRPC with context
   - Create baseProcedure (public)
   - Create protectedProcedure — throws UNAUTHORIZED if no session
   - Create analystProcedure — throws FORBIDDEN if role !== 'analyst'
   - Create executiveProcedure — throws FORBIDDEN if role !== 'executive'
   - Create superAdminProcedure — throws FORBIDDEN if role !== 'super_admin'
   - Export router, procedure types

3. Create server/trpc/routers/admin.ts with these procedures (all require superAdminProcedure):
   - listUsers: returns all users with id, name, email, role, team, is_active, last_login_at, created_at, created_by name
   - getUserById: returns single user with full audit history
   - createUser: validates input with Zod, hashes password (bcryptjs, rounds 10),
     inserts into users table with created_by = session.user.id,
     writes audit_log entry: action='user_created', metadata includes role and team
   - updateUser: update name, email, role, team — cannot change own role,
     writes audit_log entry: action='user_updated', metadata includes changed fields
   - setPassword: admin resets a user's password (no old password required),
     hashes new password, writes audit_log: action='password_reset'
   - deactivateUser: sets is_active=false, cannot deactivate self,
     writes audit_log: action='user_deactivated'
   - reactivateUser: sets is_active=true,
     writes audit_log: action='user_reactivated'
   - deleteUser: hard delete — only allowed if user has zero snapshots and zero uploaded documents,
     otherwise return error "Cannot delete user with existing data — deactivate instead",
     writes audit_log: action='user_deleted'
   - getAuditLog: returns last 100 audit_log entries with actor name, paginated,
     filterable by action type and actor_id
   - getSystemStats: returns { totalUsers, activeAnalysts, activeExecutives,
     totalCompanies, totalSnapshots, totalDocuments, lastActivityAt }

4. Create server/trpc/routers/company.ts with these procedures:
   - list (protected): returns all companies with latest snapshot summary
   - getById (protected): returns single company with all snapshots
   - create (analyst): creates new company, validates with Zod
   - update (analyst): updates company fields
   - updateStatus (analyst): changes active/watchlist/archived

5. Create server/trpc/routers/snapshot.ts with these procedures:
   - listByCompany (protected): returns all snapshots for a company, newest first
   - getById (protected): returns single snapshot with all params
   - save (analyst): validates full params with Zod, runs DCF calculation,
     stores computed outputs (npv, irr, payback, bearNpv, bullNpv, ddScore, synergy, recommendation),
     writes audit_log: action='snapshot_saved', target_id=companyId
   - delete (analyst): soft delete (set archived flag)

6. Create server/trpc/routers/user.ts with:
   - me (protected): returns current user from session
   - list (executive): returns all analysts for attribution display

7. Create server/trpc/index.ts (root router):
   - Merge all sub-routers: admin, company, snapshot, user
   - Export AppRouter type

8. Create app/api/trpc/[trpc]/route.ts:
   - fetchRequestHandler from @trpc/server/adapters/fetch
   - Wire to appRouter and createContext

9. Create lib/trpc-client.ts:
   - createTRPCReact client
   - Configure with superjson transformer
   - Export trpc client and QueryClient provider component

10. Create lib/audit.ts:
    - Export writeAuditLog(db, { actorId, action, targetType?, targetId?, metadata?, ipAddress? })
    - Helper wraps the Drizzle insert into audit_log
    - Used consistently across all tRPC routers that mutate data
    - Never throws — wrap in try/catch and log to console on failure (audit errors must not break the main operation)

All Zod schemas for company, snapshot, and user inputs must be in lib/validations.ts
and reused across both the tRPC routers and the frontend forms.
```

---

### PROMPT 05 — DCF Calculation Engine

```
Create the core DCF calculation engine in lib/calculations.ts.

This is pure TypeScript — no external dependencies, fully testable.

Export these functions:

1. calcNPV(params: SnapshotParams): number
   Formula:
   - revenue = coalPrice * annualProd
   - opex = cashCost * annualProd
   - royalty = revenue * (royaltyRate / 100)
   - ebitda = revenue - opex - royalty
   - depreciation = capex / mineLife
   - ebit = ebitda - depreciation
   - tax = Math.max(ebit * (taxRate / 100), 0)
   - fcf = ebit - tax + depreciation
   - npv = -capex + sum over years 1..mineLife of: fcf / (1 + discRate/100)^year
   - return Math.round(npv)

2. calcIRR(params: SnapshotParams): number
   - Use binary search / Newton-Raphson approximation
   - Return rate where NPV = 0
   - Round to 1 decimal place

3. calcPayback(params: SnapshotParams): number
   - Return capex / fcf (years to recover capital)
   - Round to 1 decimal

4. calcDDScore(params: SnapshotParams): number
   - Based on compliance flags: iupValid, certClean, amdal, ppa, dmb
   - Score = (trueCount / 5) * 5
   - Round to 1 decimal

5. calcSynergy(npv: number, sharedInfra: number): number
   - costSynergy = sharedInfra * 0.8 + 10
   - revenueSynergy = sharedInfra * 0.5
   - total = Math.round(costSynergy + revenueSynergy)
   - return total

6. calcRecommendation(npv: number): 'proceed' | 'monitor' | 'avoid'
   - npv > 800  → 'proceed'
   - npv > 400  → 'monitor'
   - else       → 'avoid'

7. calcFullSnapshot(params: SnapshotParams): ComputedOutputs
   - Calls all above functions and returns the complete output object

Export types:
- SnapshotParams (all input fields)
- ComputedOutputs { npv, irr, payback, bearNpv, bullNpv, ddScore, synergy, recommendation }

Also export a sensitivity helper:
- calcNPVAtPrice(params, priceMultiplier: number): number
- calcNPVAtRate(params, rateOverride: number): number

These must be 100% identical to the client-side calculations used in the React components.
Add a comment at the top: "// SOURCE OF TRUTH: All DCF calculations must use this module"
```

---

### PROMPT 06 — AI Extraction Endpoint (Groq — Free Tier)

```
Create the AI document extraction system using Groq's free API as the primary provider.
The architecture is designed to swap providers with a single env variable change.

IMPORTANT: Reference @CURSOR_CONTEXT.md Section 8 for the exact ExtractionResult type
and @mining_mna_stage2.jsx lines 802–879 (ExtractionView) for the expected UX flow.

--- STEP 1: Install dependencies ---

npm install groq-sdk pdf-parse
npm install @types/pdf-parse --save-dev

Add to .env.local:
  # Groq (free tier — get key at console.groq.com)
  GROQ_API_KEY=gsk_...

  # AI provider switch — change to 'anthropic' when ready to upgrade
  AI_PROVIDER=groq

  # Anthropic (future upgrade — get key at console.anthropic.com)
  ANTHROPIC_API_KEY=sk-ant-...   # leave blank for now

--- STEP 2: Create lib/extraction.ts ---

This file contains all AI extraction logic, provider-agnostic.

Export buildExtractionPrompt(companyName: string): string
  Returns a strict JSON-only prompt that instructs the model to extract:
    reservesMt         — total coal resources in metric tonnes (number or null)
    measuredMt         — measured category resources Mt (number or null)
    indicatedMt        — indicated category resources Mt (number or null)
    inferredMt         — inferred category resources Mt (number or null)
    coalGarAvg         — average GAR kcal/kg (number or null)
    cashCostEstimate   — estimated cash cost FOB in USD/tonne (number or null)
    annualRevenue      — annual revenue in USD millions (number or null)
    ebitda             — EBITDA in USD millions (number or null)
    netAssets          — net assets in USD millions (number or null)
    iupStatus          — IUP license validity and expiry as text (string or null)
    environmentalStatus — AMDAL/environmental permit status (string or null)
    complianceFlags    — object with booleans: { iupValid, certClean, amdal, ppa, dmb }
    confidence         — integer 0–100, model's confidence in the extraction quality

  The prompt must end with:
  "Respond ONLY with a valid JSON object. No markdown, no explanation, no code blocks.
   If a field cannot be found in the document, set it to null."

Export parseExtractionResult(rawText: string): ExtractionResult
  - Strip any accidental markdown fences (```json ... ```) before parsing
  - Safe JSON.parse wrapped in try/catch
  - Validate with Zod schema (all fields nullable)
  - Return typed ExtractionResult or throw new Error('Extraction parse failed: ' + details)

Export ExtractionResult type — all fields as defined above, all nullable except confidence.

Export ExtractionResultSchema — Zod schema for runtime validation.

--- STEP 3: Create lib/ai-providers.ts ---

This is the provider abstraction layer. Swapping AI = changing AI_PROVIDER env var only.

export async function extractFromText(
  documentText: string,
  companyName: string
): Promise<string>  // Returns raw AI response text

Implementation:
  const provider = process.env.AI_PROVIDER ?? 'groq'

  if (provider === 'groq') {
    - Import Groq from 'groq-sdk'
    - const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    - Use model: 'llama-3.3-70b-versatile'  (best free Groq model for structured extraction)
    - Call groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a financial document analyst specializing in Indonesian mining companies. Extract data precisely and return only valid JSON.'
          },
          {
            role: 'user',
            content: buildExtractionPrompt(companyName) + '\n\nDocument content:\n' + documentText
          }
        ],
        temperature: 0.1,        // Low temperature = more consistent JSON output
        max_tokens: 1024,
        response_format: { type: 'json_object' }  // Groq supports JSON mode
      })
    - Return choices[0].message.content

  if (provider === 'anthropic') {
    - Import Anthropic from '@anthropic-ai/sdk'
    - const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    - Call client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: buildExtractionPrompt(companyName) + '\n\nDocument content:\n' + documentText
        }]
      })
    - Return content[0].text

  Throw new Error('Unknown AI_PROVIDER: ' + provider) for any other value.

--- STEP 4: Create lib/pdf-parser.ts ---

PDF text extraction — runs server-side only (Node.js runtime, NOT Edge).

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string>
  - Import pdf-parse dynamically: const pdfParse = (await import('pdf-parse')).default
  - Call pdfParse(pdfBuffer)
  - Return data.text (raw extracted text)
  - If text is empty or < 100 chars, throw new Error('PDF text extraction failed — document may be scanned/image-based')
  - Truncate to first 12,000 characters if longer (Groq context window safety)

--- STEP 5: Create app/api/ai/extract/route.ts ---

POST handler — Node.js runtime (NOT Edge, because pdf-parse needs Node APIs).

export const runtime = 'nodejs'
export const maxDuration = 30  // Groq is fast, 30s is generous

Auth check: reject if no session or role !== 'analyst'

Accept body: { blobUrl: string, companyId: string, documentId: string, companyName: string }

Flow:
  1. Fetch PDF from Vercel Blob:
     const response = await fetch(blobUrl)
     const pdfBuffer = Buffer.from(await response.arrayBuffer())

  2. Extract text from PDF:
     const documentText = await extractTextFromPDF(pdfBuffer)

  3. Call AI provider:
     const rawResponse = await extractFromText(documentText, companyName)

  4. Parse result:
     const result = parseExtractionResult(rawResponse)

  5. Update documents table via Drizzle:
     await db.update(documents)
       .set({ extracted: true, extractionResult: result })
       .where(eq(documents.id, documentId))

  6. Write audit log:
     await writeAuditLog(db, { actorId: session.user.id, action: 'extraction_run',
       targetType: 'document', targetId: documentId,
       metadata: { companyId, confidence: result.confidence, provider: process.env.AI_PROVIDER } })

  7. Return: NextResponse.json({ success: true, data: result })

Error handling:
  - PDF parse error → 422 { success: false, error: 'Could not read PDF. Ensure it is text-based, not scanned.' }
  - AI provider error → 502 { success: false, error: 'AI extraction failed. Try again.' }
  - Auth error → 401
  - Wrap everything in try/catch, log full error to console

Rate limiting via Upstash Redis:
  - Key: `extract:${userId}`
  - Use Redis INCR + EXPIRE pattern:
    const count = await redis.incr(`extract:${userId}`)
    if (count === 1) await redis.expire(`extract:${userId}`, 3600)
    if (count > 20) return 429 { success: false, error: 'Rate limit exceeded. Try again in 1 hour.' }

--- STEP 6: Create app/api/ai/stream/route.ts ---

Streaming follow-up Q&A about extracted data.
Uses Vercel AI SDK with Groq.

export const runtime = 'edge'  // Streaming works on edge

import { createGroq } from '@ai-sdk/groq'    // npm install @ai-sdk/groq
import { streamText } from 'ai'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

POST handler:
  - Auth check: analyst only
  - Accept: { messages: CoreMessage[], companyContext: string }
  - System prompt: "You are a mining M&A analyst assistant for Indonesian coal companies.
    The analyst is reviewing: [companyContext]. Answer questions concisely and cite
    specific numbers from the data when relevant. Be direct — executives will read summaries."
  - Call streamText({ model: groq('llama-3.3-70b-versatile'), system, messages })
  - Return result.toDataStreamResponse()

Install additional dependency: npm install @ai-sdk/groq

--- STEP 7: Update .env.local with Groq key placeholder ---

Add comment block to .env.local:

# ─── AI EXTRACTION ─────────────────────────────────────────────────────────
# Current provider: Groq (free) — swap to 'anthropic' for production upgrade
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...    # Get free key: console.groq.com → API Keys

# Future upgrade path (leave blank until ready):
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-...

# Groq free tier limits:
#   llama-3.3-70b-versatile: 30 req/min, 6000 req/day
#   This is more than sufficient for internal M&A team usage

--- MIGRATION GUIDE (add as comment in lib/ai-providers.ts) ---

# To upgrade from Groq → Anthropic Claude when ready:
# 1. Get Anthropic API key from console.anthropic.com
# 2. Set ANTHROPIC_API_KEY in Vercel project settings
# 3. Change AI_PROVIDER=anthropic in Vercel project settings
# 4. Redeploy — no code changes needed
# Claude advantage: native PDF vision (no pdf-parse needed), better accuracy on scanned docs
```

---

### PROMPT 07 — File Upload

```
Create the document upload system using Vercel Blob.

1. Create app/api/upload/route.ts:
   - POST handler
   - Auth check: analyst only
   - Accept multipart form data: { file: File, companyId: string, docType: string }
   - Validate: file must be PDF, max size 20MB
   - Upload to Vercel Blob: put(filename, file, { access: 'private' })
   - Insert record into documents table with Drizzle
   - Return { documentId, blobUrl, filename }

2. Create components/analyst/DocumentUpload.tsx:
   - Client component
   - Drag-and-drop zone + click to browse
   - Shows file name and size after selection
   - Upload button triggers POST to /api/upload
   - Shows upload progress (use XMLHttpRequest for progress events)
   - After upload success, shows "Extract with AI" button
   - On extract: calls POST /api/ai/extract with the returned blobUrl
   - Shows streaming extraction progress (animated list of steps)
   - After extraction: shows structured results in a clean data grid
   - "Open in Calculator" button pre-fills calculator with extracted values
   - Use shadcn Card, Button, Progress, Badge components
   - Loading states for each step

3. Add to tRPC document router:
   - listByCompany (protected): list all documents for a company
   - deleteDocument (analyst): delete from Blob + database
```

---

### PROMPT 08 — Analyst Shell & Company List

```
Build the analyst workspace layout and company list.

1. Create app/analyst/layout.tsx:
   - Server component
   - Get session with auth()
   - Redirect to /login if no session or role !== 'analyst'
   - Render a top navigation bar with:
     - Left: app logo "⛏ Mining M&A" + "Analyst Workspace" badge
     - Right: user avatar (initials), name, team, sign out button
   - Below nav: render {children}
   - Styling: white topbar with 1px bottom border, subtle shadow
   - Font: Plus Jakarta Sans via next/font/google

2. Create app/analyst/page.tsx:
   - Server component
   - Fetch companies list via tRPC server-side caller
   - Pass to client component <CompanyWorkspace companies={companies} />

3. Create components/analyst/CompanyWorkspace.tsx:
   - Client component (needs useState for optimistic updates)
   - Page header: "Company Workspace" title + subtitle + "Add Target" button
   - Company grid: responsive, min 280px card width
   - Each CompanyCard shows:
     - Company name + location + type
     - Status badge (active/watchlist/archived)
     - If snapshots exist: NPV, IRR, DD Score mini KPIs
     - If no snapshots: "No valuation yet" empty state
     - Two buttons: "AI Extract" → /[companyId]/extract, "Calculator" → /[companyId]/calculator/1
     - Snapshot count + last update info
   - Add Target: opens a Dialog with a form (name, location, type, IUP, ticker)
   - On submit: calls company.create mutation, updates list optimistically

4. Create components/analyst/CompanyCard.tsx:
   - Props: company with latest snapshot summary
   - All the card content above
   - Hover state: slight elevation shadow
   - Status colors: active=green, watchlist=indigo, archived=gray

Design system to use throughout analyst views:
- Background: #f0f2f8 (cool off-white)
- Cards: white with 1px #d4d8ee border, 10px radius, subtle shadow
- Primary accent: #5c6bff (electric indigo)
- Success: #0ead69, Warning: #f59e0b, Danger: #ef4444
- Typography: Plus Jakarta Sans for UI, JetBrains Mono for all numeric data
- All numeric values rendered in JetBrains Mono
```

---

### PROMPT 09 — 9-Module Calculator Shell

```
Build the 9-module calculator workspace.

The calculator is a full-page layout with a persistent sidebar nav (like VS Code),
a topbar showing current module + company, and a main content area.

1. Create app/analyst/[companyId]/calculator/layout.tsx:
   - Server component
   - Fetch company data (name, ticker, status)
   - Fetch latest snapshot params (or defaults if none)
   - Pass to client shell <CalculatorShell>

2. Create components/analyst/CalculatorShell.tsx:
   - Client component ('use client')
   - useState for: activeModule (1-9), calcParams, npv, saveMessage
   - useEffect recalculates NPV whenever calcParams changes using calcNPV from lib/calculations.ts
   - Layout: flex row, height: 100vh, overflow: hidden

   LEFT SIDEBAR (210px wide, white bg, right border):
   - Back button "← Back to workspace" (text-indigo, hover underline)
   - Company name + "Calculation Model" badge
   - MODULES section label
   - Nav items for all 9 modules (icon + number + label)
   - Active state: indigo tint background + left border accent + indigo text
   - Bottom: "Live NPV" label + value in JetBrains Mono (green if positive, red if negative)

   TOP BAR:
   - Module icon + name (left)
   - "MOD 01/09 · [TICKER]" in monospace (muted)
   - Save Snapshot button (indigo, saves to DB via tRPC)
   - User avatar + sign out

   MAIN AREA:
   - Scrollable, #f0f2f8 background
   - Renders the active module component
   - Pass calcParams and setCalcParams to all modules

3. Create components/analyst/ModuleNav.tsx:
   - The nav items list component
   - Props: activeModule, onModuleChange
   - Maps NAV_ITEMS array to styled buttons

4. Create components/analyst/NPVBadge.tsx:
   - Shows live NPV in sidebar bottom
   - Animates color change on value update (green/red transition)
   - Sub-label: "@ spot parameters"

NAV_ITEMS constant (put in lib/constants.ts):
[
  { id: 1, icon: '🏢', label: 'Company Profile' },
  { id: 2, icon: '⛏️', label: 'Reserve Evaluation' },
  { id: 3, icon: '🚢', label: 'Pit-to-Port' },
  { id: 4, icon: '📊', label: 'Financial Valuation' },
  { id: 5, icon: '🎯', label: 'Sensitivity Analysis' },
  { id: 6, icon: '🔮', label: 'Scenario Simulation' },
  { id: 7, icon: '🤝', label: 'Deal Structuring' },
  { id: 8, icon: '⚡', label: 'Synergy Estimation' },
  { id: 9, icon: '🛡️', label: 'Risk & Regulatory' },
]
```

---

### PROMPT 10 — Calculator Modules 1–3

```
Build calculator modules 1, 2, and 3. Each is a separate component in
components/analyst/modules/. All accept { params, setParams, company } props.

MODULE 1 — M1CompanyProfile.tsx:
- Two-column grid layout
- Left column: "Corporate Identity" card
  - Editable fields: Company Name, Entity Type, Listed On, Location, Mineral Class, IUP No.
  - Each field is a shadcn Input with Label
  - Changes update company record via tRPC company.update mutation (debounced 500ms)
- Right column top: "Shareholder Structure" card
  - Three sliders: State Owned, Public, Foreign (0–100%)
  - Visual stacked bar chart below sliders (colored segments, no external chart lib)
  - Colors: amber (state), indigo (public), orange (foreign)
- Right column bottom: "AI Document Upload" card
  - Renders <DocumentUpload> component from Prompt 07

MODULE 2 — M2ReserveEvaluation.tsx:
- Two-column grid layout
- Left: "Block Model Summary (JORC / NI 43-101)" card
  - Table with rows: Measured, Indicated, Inferred
  - Editable cells for Mt and GAR kcal/kg (number inputs, JetBrains Mono)
  - Read-only TS column (0.5% default)
  - Footer row: Total Resources = sum of all Mt
  - Highlight Measured row in amber, Indicated in indigo, Inferred in muted
- Right: "Mining Parameters" card
  - Sliders: Recovery Rate (50–100%), Strip Ratio (1:1 to 20:1),
    Annual Production (1–20 Mt/yr), Mine Life (5–40 yrs)
  - Two KPI cards below: Mineable Reserve (total * recoveryRate/100), Est. Mine Life

MODULE 3 — M3PitToPort.tsx:
- Two-column grid layout
- Left: "Logistics Cost Flow" card
  - Four cost rows with left-border accent colors:
    1. Mining & Crushing = crushCost (amber)
    2. Hauling = haulingDist * 0.4 (indigo)
    3. Barge & Loading = bargeDist * 0.08 (orange)
    4. Port Handling = portHandling (green)
  - Total row: sum of all (large green text, $X.X/t format)
  - Stacked bar below showing proportions
  - useEffect: whenever any cost changes, update params.cashCost with the total
- Right: "Logistics Parameters" card
  - Sliders: Hauling Distance (5–150 km), Barge Distance (50–500 km),
    Crushing & Sizing (1–8 $/t, step 0.1), Port Handling (1–10 $/t, step 0.1)

All sliders must:
- Show label + current value in JetBrains Mono on the right
- Show min/max labels below the track in small muted text
- Use accent color matching the design system
- Call setParams with the updated value immediately (controlled component)
```

---

### PROMPT 11 — Calculator Modules 4–6

```
Build calculator modules 4, 5, and 6.

MODULE 4 — M4FinancialValuation.tsx:
- Four KPI cards at the top (2x2 grid):
  Current Spot NPV (green if positive, red if negative, large text)
  Annual FCF, Annual Revenue, EBITDA Margin
- Two-column grid below:
- Left: "P&L Summary (Annual $M)" card
  - Table rows: Revenue, Royalty (negative), OPEX (negative),
    EBITDA (highlighted amber), Depreciation (negative),
    EBIT, Tax (negative), Free Cash Flow (highlighted green)
  - Negative values in red, positive in normal text
  - FCF and EBITDA rows in bold
  - All values from lib/calculations.ts live computation
  - JetBrains Mono for all numbers
- Right: "DCF Parameters" card
  - Sliders: Coal Price (50–250 $/t), Discount Rate WACC (5–25%, step 0.5),
    Royalty Rate (0–15%, step 0.5), Income Tax Rate (10–35%), CAPEX (50–500 $M)
- useEffect: call setNpv(calcNPV(params)) whenever params change

MODULE 5 — M5SensitivityAnalysis.tsx:
- Two-column grid layout
- Left: "NPV Sensitivity Matrix ($M)" card
  - 5×3 table: rows = price delta (−20%, −10%, 0%, +10%, +20%)
  - Columns = discount rate (DR−2%, DR, DR+2%)
  - Base case cell (delta=0, current DR) highlighted with green background
  - Positive NPV cells: green text. Negative: red text. Base: bold.
  - All values computed from calcNPVAtPrice and calcNPVAtRate helpers
- Right: "Tornado Chart" card
  - 5 horizontal bars: Coal Price ±20%, Discount Rate ±2%, Production ±20%,
    Cash Cost ±20%, CAPEX ±20%
  - Each bar shows the range (low–high label), bar proportional to range width
  - Bar fill: gradient from indigo to amber
  - Current NPV box at the bottom

MODULE 6 — M6ScenarioSimulation.tsx:
- Three scenario cards at the top (1/3 each):
  Bear (price -20%, DR+2%), Base (current), Bull (price +20%, DR-2%)
  Each card: colored top border (red/amber/green), scenario label, NPV large,
  IRR and payback below
- Below: "NPV Comparison" card
  - Horizontal bar chart (pure CSS, no chart lib)
  - One bar per scenario, proportional to NPV, colored by scenario
  - IRR% label inside each bar
  - All computed from calcNPV with modified params (bear/bull adjustments)
```

---

### PROMPT 12 — Calculator Modules 7–9

```
Build calculator modules 7, 8, and 9.

MODULE 7 — M7DealStructuring.tsx:
- Two-column grid layout
- Left: "Deal Structuring & Financing" card
  - Sliders: Acquisition Cost (50–500 $M), Debt Financing (0–80%),
    Loan Interest Rate (3–20%, step 0.5), Loan Tenor (1–10 yrs)
  - Financing mix bar below: debt (indigo) vs equity (amber) proportional
  - Labels inside bar segments if wide enough
- Right top: 2x2 KPI grid
  - Debt Amount, Equity Required, Annual Debt Service, Levered NPV (green if positive)
  - Annual Debt Service formula: debt * (rate/100) * (1+rate/100)^tenor / ((1+rate/100)^tenor - 1)
  - Levered NPV: baseNPV - debt*(rate/100*tenor) (simplified)
- Right bottom: "Deal Economics" table
  - Rows: Acquisition Cost, Enterprise Value (DCF NPV), Premium/(Discount) %,
    Debt, Equity, Tenor
  - Clean key/value layout, monospace values

MODULE 8 — M8SynergyEstimation.tsx:
- Two-column grid layout
- Left: "Post-Merger Synergy" card
  - Brief description text in muted style
  - Sliders: Shared Infrastructure Overlap (1–30 units),
    G&A Consolidation (0–80%), Procurement Savings (0–25%)
  - Cost Synergy = sharedInfra * 0.8 + 10
  - Revenue Synergy = sharedInfra * 0.5
  - Two mini KPI cards: Cost Synergy/yr (green), Revenue Synergy/yr (indigo)
- Right top: "Total Annual Synergy" hero card
  - Solid green background, white text, large "+$XXM" value
- Right bottom: NPV bridge table
  - Rows: Current NPV, Synergy NPV (3yr cap.), Post-Synergy NPV
  - Color each row appropriately

MODULE 9 — M9RiskRegulatory.tsx:
- Two-column grid layout
- Left: "Compliance Checklist" card
  - 5 items, each clickable to toggle:
    IUP Operasi Produksi Valid, Sertifikat Clear and Clean (CnC),
    AMDAL / Dokumen Lingkungan, Izin Pinjam Pakai Kawasan Hutan (IPPKH),
    Kepatuhan Kuota DMO
  - Each item: colored left border (green=checked, red=unchecked), checkbox, title, subtitle
  - Clicking toggles params.iupValid, params.certClean, etc.
- Right top: "Due Diligence Score" card
  - Large score display: X.X/5 in JetBrains Mono
  - Color: green ≥4, amber ≥3, red <3
  - Status label below
- Right bottom: "Risk Register" card
  - 5 risk rows: Regulatory, Environmental, Title, Market, Operational
  - Each with colored badge (Low/Medium/High) derived from compliance flags
  - Market Risk always Medium, Operational always Low
  - Title Risk derived from certClean, Environmental from amdal, Regulatory from passCount

After all 9 modules are built, update CalculatorShell.tsx to:
- Import all 9 module components
- Render the correct module based on activeModule state
- Pass the same { params, setParams } props to all modules
```

---

### PROMPT 13 — Snapshot Save Flow

```
Implement the complete snapshot save flow.

1. In CalculatorShell.tsx, implement the saveSnapshot function:
   - Call calcFullSnapshot(params) from lib/calculations.ts to get computed outputs
   - Call tRPC mutation snapshot.save with:
     { companyId, params, ...computedOutputs }
   - On success: show "✓ Snapshot saved!" message for 3 seconds
   - On error: show error toast with shadcn toast component
   - Disable Save button during mutation (loading state)

2. In server/trpc/routers/snapshot.ts, implement the save procedure:
   - Input: Zod schema matching all SnapshotParams + ComputedOutputs
   - Re-run calcFullSnapshot on the server to verify the client calculations
   - If server NPV differs from client NPV by more than $1M, log a warning
   - Insert into snapshots table with current analyst ID and today's date
   - Return the new snapshot ID and date

3. After saving, update the company card in the workspace list:
   - Use tRPC query invalidation to refetch companies.list
   - The CompanyCard should immediately reflect the new NPV

4. In app/analyst/[companyId]/calculator/layout.tsx:
   - If the URL param [module] is not 1–9, redirect to /1
   - Pre-populate calcParams from the most recent snapshot if one exists

5. Add a "Snapshot History" mini panel at the bottom of the calculator sidebar:
   - Shows last 3 snapshots with date, analyst name (first name only), and NPV
   - Clicking a past snapshot loads its params into the calculator
   - This requires a tRPC query: snapshot.listByCompany (last 3)
```

---

### PROMPT 14 — Executive Dashboard

```
Build the executive dashboard. This view is completely separate from the analyst workspace.
Executives cannot navigate to /analyst/* — middleware blocks it.

1. Create app/executive/layout.tsx:
   - Server component, auth guard for executive role
   - Top navigation bar:
     Left: "⛏ M&A INTEL" logo in amber/gold, divider, "Executive Intelligence" label in monospace
     Right: Current datetime (client-rendered), user initials badge, name, sign out
   - Styling: white topbar with subtle shadow, clean professional look
   - Font: Plus Jakarta Sans

2. Create app/executive/page.tsx:
   - Server component
   - Fetch all companies with their latest snapshot via tRPC server-side caller
   - Pass to <ExecutiveDashboard> client component

3. Create components/executive/ExecutiveDashboard.tsx:
   - Client component ('use client')
   - useState: selectedCompanyId
   - Layout: flex row, full height
   - Left: WatchlistSidebar (240px)
   - Right: main content panel (flex-1, scrollable)

4. Create components/executive/WatchlistSidebar.tsx:
   - Lists all companies
   - Each item: company name, ticker, snapshot count, latest NPV in amber monospace
   - Status dot (green/amber/red from recommendation)
   - Selected state: left border accent + subtle background tint
   - Disabled/dim for companies with no snapshots
   - Footer: count of active valuations
   - No add/edit controls — read only

5. Create the main dashboard content (when a company is selected):

   components/executive/HeroNPV.tsx:
   - Company header bar: name, ticker, location, recommendation badge with dot
   - Hero valuation card: "CURRENT VALUATION (NPV)" label, large NPV value,
     IRR + payback + synergy sub-labels, last updated by analyst info
   - NPV: green if positive, red if negative

   components/executive/ScenarioStrip.tsx:
   - Three scenario cards: BEAR / BASE / BULL
   - Each: colored top border (3px), scenario label, large NPV, parameter description
   - Bear = base NPV * 0.65, Bull = base NPV * 1.35

   components/executive/HistoryTable.tsx:
   - Shows all snapshots for selected company
   - Columns: Date, Analyst, NPV, Recommendation
   - Latest row bold + highlighted
   - Only shown if company has 2+ snapshots

   components/executive/PortfolioComparison.tsx:
   - Shows all companies with valuations side by side
   - Horizontal bar per company: proportional to NPV, colored by recommendation
   - Company name + ticker + IRR label inside bar
   - Always visible at the bottom of the selected company view

6. Empty state (no company selected):
   - Centered icon, "Select target from watchlist" text
   - Count of available valuations

All data is fetched server-side and passed as props.
The executive dashboard must have ZERO tRPC mutations — completely read-only.
Add a warning comment at the top of ExecutiveDashboard.tsx:
// EXECUTIVE VIEW: READ-ONLY. No mutations allowed here. See middleware.ts for route protection.
```

---

### PROMPT 15 — Super Admin Layout & Dashboard

```
Build the super admin area. This is completely separate from analyst and executive views.
Only users with role === 'super_admin' can access /admin/*.
Middleware already handles the route protection from Prompt 03.

1. Create app/admin/layout.tsx:
   - Server component
   - auth() guard: redirect to /login if role !== 'super_admin'
   - Top navigation bar:
     Left: shield icon + "M&A Admin" in bold deep navy, "User Management System" subtitle
     Center: nav links — Dashboard (/admin), Users (/admin/users)
     Right: user avatar (initials), name, "Super Admin" badge in amber, sign out button
   - Active link highlight: indigo underline
   - Styling: white topbar, 1px bottom border, subtle shadow
   - Font: Plus Jakarta Sans

2. Create app/admin/page.tsx (Admin Dashboard):
   - Server component
   - Fetch system stats via tRPC server-side caller: admin.getSystemStats
   - Fetch last 5 audit_log entries: admin.getAuditLog (limit 5)
   - Render <AdminDashboard> client component with this data

3. Create components/admin/SystemStatsBar.tsx:
   - Displays 6 stat cards in a row:
     Total Users, Active Analysts, Active Executives, Total Companies, Total Snapshots, Total Documents
   - Each card: white bg, label in muted small caps, value in large JetBrains Mono, colored icon accent
   - Colors: Users=indigo, Analysts=teal, Executives=amber, Companies=violet, Snapshots=green, Documents=blue

4. Create components/admin/AuditLogFeed.tsx:
   - Shows the last N audit log entries in a clean timeline list
   - Each entry: timestamp (relative: "2 hours ago"), actor name with initials avatar,
     action badge (color-coded by action type), target description
   - Action badge colors:
     user_created/reactivated → green
     user_deactivated/deleted → red
     user_updated/password_reset → amber
     login_success → blue (dimmed)
     login_failed → red (dimmed)
     snapshot_saved/company_created → indigo
   - "View full log" link → /admin/users (filtered to audit tab)
   - Empty state: "No activity yet"

5. Admin dashboard page layout:
   - Page title: "System Overview"
   - SystemStatsBar at the top
   - Two-column below: "Quick Actions" card (left) + "Recent Activity" AuditLogFeed (right)
   - Quick Actions card: buttons to go to User List, View Audit Log
   - Last activity timestamp in footer: "Last activity: [time]"
```

---

### PROMPT 16 — User List & Management Table

```
Build the user management table at /admin/users.

1. Create app/admin/users/page.tsx:
   - Server component
   - Fetch all users via tRPC: admin.listUsers
   - Pass to <UserManagement> client component

2. Create components/admin/UserTable.tsx:
   - Client component ('use client')
   - Full-width table with columns:
     User (avatar + name + email), Role, Team, Status, Last Login, Created, Actions
   - Role column: colored badge (super_admin=amber, analyst=indigo, executive=teal)
   - Status column: <UserStatusBadge> (Active=green dot, Inactive=red dot)
   - Last Login: formatted relative time ("3 days ago") or "Never"
   - Created: formatted date
   - Actions column: "Edit" button + kebab menu (⋮) with: Reset Password, Deactivate/Reactivate, Delete
   - Row for current logged-in user: highlighted with "(You)" label, Delete/Deactivate disabled
   - Sortable columns: Name, Role, Status, Last Login (client-side sort)
   - Search input: filters by name or email (client-side)
   - Role filter tabs: All | Super Admin | Analyst | Executive
   - Status filter: All | Active | Inactive toggle

3. Create components/admin/UserStatusBadge.tsx:
   - Props: isActive boolean
   - Active: green dot + "Active" text
   - Inactive: red dot + "Inactive" text
   - Small pill badge style

4. Page header for /admin/users:
   - Title: "User Management"
   - Subtitle: "X users total · Y active"
   - "Create User" button (indigo, prominent) — opens UserFormModal
   - Search input on the right

5. Implement all action handlers in UserTable.tsx:
   - Edit → opens UserFormModal with user data pre-filled
   - Reset Password → opens a simple Dialog with new password input field
     (calls admin.setPassword mutation on confirm)
   - Deactivate → confirmation Dialog: "Deactivate [Name]? They will lose access immediately."
     (calls admin.deactivateUser mutation)
   - Reactivate → no confirmation needed (calls admin.reactivateUser)
   - Delete → confirmation Dialog with danger styling:
     "Permanently delete [Name]? This cannot be undone."
     Shows error toast if user has existing data (server returns error)
   - All mutations use tRPC, optimistic UI updates, and shadcn toast notifications

6. After any mutation (create/edit/deactivate/delete):
   - Invalidate tRPC admin.listUsers query to refresh the table
   - Show success toast: "User [name] [action] successfully"
   - Show error toast on failure with the server error message
```

---

### PROMPT 17 — Create & Edit User Modal

```
Build the user create/edit form modal used throughout the admin panel.

1. Create components/admin/UserFormModal.tsx:
   - Client component
   - Props: { mode: 'create' | 'edit', user?: User, open: boolean, onClose: () => void }
   - Uses shadcn Dialog component
   - Title: "Create New User" or "Edit User"

2. Form fields:
   Full Name (required, text input)
   Email Address (required, email input, validated with Zod)
   Team / Department (required, text input)
   Role (required, shadcn Select):
     - Options: Analyst, Executive, Super Admin
     - Warning message shown when Super Admin selected:
       "⚠️ Super Admin has full system access including user management."
     - Cannot change own role (field disabled with tooltip: "You cannot change your own role")
   
   CREATE mode only — additional fields:
   Password (required, min 8 chars, must include 1 uppercase + 1 number)
   Confirm Password (required, must match password)
   Password strength indicator (weak/fair/strong based on length + complexity)
   
   EDIT mode:
   No password fields — use "Reset Password" action in the table instead
   Show "Account Status" toggle (Active/Inactive) — calls deactivate/reactivate

3. Validation (Zod schema in lib/validations.ts):
   - createUserSchema: { name, email, team, role, password, confirmPassword }
   - updateUserSchema: { name, email, team, role } (password excluded)
   - Password: min 8 chars, at least 1 uppercase letter, at least 1 number
   - Email: valid format, checked for uniqueness server-side (tRPC returns CONFLICT error)

4. Form behavior:
   - React Hook Form with zodResolver for client-side validation
   - All fields show inline error messages below the input
   - Submit button shows loading spinner during mutation
   - On success: close modal, show toast, invalidate user list
   - On email conflict: show error on the email field: "This email is already in use"

5. Create mode submit → calls admin.createUser mutation
   Edit mode submit → calls admin.updateUser mutation with user.id

6. Install react-hook-form if not already installed:
   npm install react-hook-form @hookform/resolvers

7. The modal must be accessible:
   - Focus trap within Dialog when open
   - ESC key closes modal
   - Confirm button has type="submit"
   - All inputs have proper aria-labels
```

---

### PROMPT 18 — Audit Log & Individual User Detail

```
Build the full audit log view and individual user detail page.

1. Create app/admin/users/[userId]/page.tsx:
   - Server component
   - Fetch user by ID: admin.getUserById
   - Fetch audit log filtered to this user as actor: admin.getAuditLog({ actorId: userId })
   - Render <UserDetail> client component

2. Create a UserDetail component (inline in the page or separate file):
   - Page title: user's full name with role badge
   - Two-column layout:
   
   LEFT COLUMN — User Info Card:
   - Avatar (large, 64px, initials circle)
   - Name, email, team
   - Role badge, status badge
   - "Member since" date
   - "Last login" relative timestamp
   - "Created by" — name of the super admin who created this user (or "System Bootstrap" if null)
   - Edit button (opens UserFormModal)
   - Deactivate / Reactivate button
   - Delete button (danger, with confirmation)
   
   RIGHT COLUMN — Activity History:
   - Full audit log for this user as actor (their actions in the system)
   - Paginated: 20 per page, "Load more" button
   - Each entry: timestamp, action badge, description
   - Empty state: "No activity recorded"

3. Extend the Audit Log section in admin/users/page.tsx:
   - Add an "Audit Log" tab to the /admin/users page
   - Tab 1: "Users" — the user management table (from Prompt 17)
   - Tab 2: "Audit Log" — full system audit log

4. Full system audit log UI (Audit Log tab):
   - Uses tRPC: admin.getAuditLog with pagination (page, limit=25)
   - Filter bar:
     * Action type multi-select (All, User Events, Login Events, Data Events)
     * User (actor) select — dropdown of all users
     * Date range: From / To date pickers (shadcn Calendar)
   - Table columns: Timestamp, Actor, Action, Target, Details (expand button)
   - "Details" expand shows the metadata JSON in a clean key/value table
   - Export button: "Export CSV" — client-side CSV download of visible rows
   - Pagination: Previous / Next / page indicator

5. CSV Export implementation:
   - Client-side only using vanilla JS (no library needed)
   - Columns: timestamp, actor_name, actor_email, action, target_type, target_id, details_summary
   - Filename: audit_log_YYYY-MM-DD.csv
   - Function: generateAuditCSV(entries: AuditLog[]) → triggers browser download

6. Add a final security check in every admin tRPC procedure:
   - At the top of each superAdminProcedure handler, verify ctx.session.user.role === 'super_admin'
   - Even though middleware blocks the route, defense-in-depth requires the API layer to also check
   - Add comment: "// Double-check: middleware handles routing, this handles direct API calls"
```

---

### PROMPT 19 — Polish & Production Readiness

```
Final polish and production readiness pass.

1. Error boundaries:
   - Create app/error.tsx: user-friendly error page with "Try again" button
   - Create app/not-found.tsx: clean 404 page
   - Wrap each major route segment with loading.tsx skeleton screens

2. Loading skeletons:
   - Create app/analyst/loading.tsx: skeleton grid of 3 company cards
   - Create app/executive/loading.tsx: skeleton watchlist + hero card
   - Create app/analyst/[companyId]/calculator/loading.tsx: skeleton sidebar + content

3. Metadata:
   - Create app/layout.tsx root layout with:
     title: 'Mining M&A Intelligence'
     description: 'Internal M&A analytics platform'
     viewport: mobile-friendly
     Inter → import Plus Jakarta Sans via next/font/google

4. Security hardening:
   - In next.config.ts, add Content Security Policy headers
   - Ensure all Blob URLs use signed access (private blobs)
   - Add rate limiting to /api/ai/extract: max 20 per user per hour using Upstash Redis
   - Sanitize all user text inputs before storing

5. Performance:
   - Add React.memo to CompanyCard, WatchlistSidebar list items
   - Add useMemo to expensive DCF calculations in module components
   - Ensure all tRPC queries have appropriate staleTime settings

6. Vercel deployment:
   - Create vercel.json:
     {
       "framework": "nextjs",
       "regions": ["sin1"],
       "env": { "NODE_ENV": "production" },
       "functions": {
         "app/api/ai/**": { "maxDuration": 60 }
       }
     }
   - Add README.md with:
     - Setup instructions (clone → npm install → env vars → db:push → db:seed → dev)
     - Vercel deployment steps (connect repo → add integrations → deploy)
     - Required Vercel integrations: Neon Postgres, Vercel Blob, Upstash Redis (via Vercel Marketplace)

7. Run final checks:
   - npx tsc --noEmit (zero TypeScript errors)
   - npx eslint . (zero lint errors)
   - Verify all pages load without console errors
   - Test super admin login → create analyst → create executive → deactivate user flow
   - Test analyst login → extraction → calculator → save snapshot flow end to end
   - Test executive login → view dashboard → select company → view history
   - Test middleware blocks: analyst from /executive/* and /admin/*, executive from /analyst/* and /admin/*,
     super_admin from /analyst/* and /executive/*
   - Test deactivated user cannot log in
   - Test audit log entries appear after each action
```

---

## 6. Vercel Integration Setup (Manual Steps)

After scaffolding, connect these Vercel storage integrations before running locally:

1. **Neon Postgres**
   - Vercel Dashboard → Storage → Create → Neon
   - Name: `mining-mna-db`
   - Region: `Singapore (sin1)` — closest to Indonesia
   - Connect to project → copy `.env.local` values

2. **Vercel Blob**
   - Vercel Dashboard → Storage → Create → Blob
   - Name: `mining-mna-docs`
   - Connect → copy `BLOB_READ_WRITE_TOKEN`

3. **Upstash Redis** (replaces sunset Vercel KV)
   - Vercel Dashboard → Storage → Browse Marketplace → Upstash → KV
   - Name: `mining-mna-cache`
   - Connect → copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

4. **After connecting all integrations:**
   ```bash
   vercel env pull .env.local   # Pulls Neon, Blob, and Upstash vars at once
   npm run db:push               # Push schema to Neon
   npm run db:seed               # Seed demo users
   npm run dev                   # Start local dev server
   ```

---

## 7. Deployment Checklist

Before first production deploy:

- [ ] All env vars set in Vercel project settings (not just .env.local)
- [ ] AUTH_SECRET set to a strong random value
- [ ] AUTH_URL set to production domain
- [ ] NEXT_PUBLIC_APP_URL set to production domain
- [ ] Neon, Blob, KV integrations connected to production environment
- [ ] Database migrations run against production Neon instance
- [ ] Seed script run for initial users (creates first super_admin)
- [ ] First login: change super_admin default password immediately
- [ ] Verify middleware correctly blocks all cross-role access on production URL
- [ ] Test super_admin can create analyst and executive users
- [ ] Test deactivated user login is rejected
- [ ] Test PDF upload and AI extraction on production
- [ ] Confirm audit log records entries for all key actions
- [ ] Set custom domain in Vercel project settings

---

## 8. Key Decisions Summary

| Decision | Rationale |
|---|---|
| No Express / separate API server | Everything runs as Vercel serverless functions, zero infra to maintain |
| tRPC over REST | Type-safe end-to-end, auto-generated types, no API documentation needed |
| Drizzle over Prisma | Lighter weight, better edge compatibility, closer to raw SQL |
| Neon over PlanetScale | Native Vercel integration, standard Postgres (no MySQL quirks) |
| Auth.js Credentials over OAuth | Internal tool, no Google/GitHub accounts needed |
| Edge Middleware for route protection | Runs at CDN edge, zero latency, cannot be bypassed by direct URL |
| Super admin as first-class role | Analysts and executives never self-register — all access is provisioned, auditable |
| Audit log as append-only table | Compliance trail, never updated or deleted, mirrors bank-grade internal tooling |
| Defense-in-depth for admin API | Both middleware AND tRPC procedure check role — one layer cannot be bypassed independently |
| super_admin cannot access analyst/executive routes | Clean separation — admin is operations, not product usage |
| Hard delete blocked if data exists | Prevents orphaned snapshots; deactivate is the safe default |
| Server-side data fetch for executive dashboard | Executives never receive raw model data in the client bundle |
| Groq free tier for extraction (not Claude) | Zero cost during development; llama-3.3-70b supports JSON mode reliably; single env var swap to Claude for production |
| Provider abstraction in lib/ai-providers.ts | Changing AI provider requires zero code changes — only an env var update in Vercel dashboard |
| Vercel Blob for PDFs, not Postgres | Binary files belong in object storage, not rows |
| Upstash Redis over Vercel KV | Vercel KV was sunset — Upstash is the official replacement via Vercel Marketplace, same API |
| Singapore region (sin1) | Lowest latency for Indonesian users |

---

*Document version: Stage II + Super Admin + Groq AI · Mining M&A Intelligence Platform*
*Generated: March 2026 · 19 Cursor prompts · 4 user roles · Full-stack Vercel Native*
*AI: Groq free tier (llama-3.3-70b) → Claude claude-sonnet-4-6 upgrade path via 1 env var*
