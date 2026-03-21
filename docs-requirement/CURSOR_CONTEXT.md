# Mining M&A — Cursor Context File
## Design System Reference & Component Wireframe

> **HOW TO USE THIS FILE IN CURSOR**
> Add this file to your Cursor project root. When starting any prompt, include:
> `"Reference @CURSOR_CONTEXT.md and @mining_mna_stage2.jsx for all design decisions."`
> This gives Cursor the full design system, component patterns, data shapes, and
> visual language before generating any code.

---

## 1. Reference File: mining_mna_stage2.jsx

This JSX file is the **working prototype** of the full application built before
the production stack was decided. Treat it as the living wireframe and design spec.

**What Cursor should extract from it:**
- All visual design decisions (colors, spacing, typography, component shapes)
- The exact data structures for companies, snapshots, and params
- The DCF calculation logic in `calcNPV()` (lines 145–153) — this is the source of truth
- All 9 calculator module layouts (M1–M9) as wireframes for the React components
- The analyst workspace flow: company list → extract → calculator → save
- The executive dashboard layout: watchlist sidebar + hero NPV + scenarios + comparison
- The login screen structure and role routing logic

**What Cursor should NOT copy verbatim:**
- The in-memory state (replace with tRPC + Neon DB)
- The fake users/passwords array (replace with Auth.js + real DB)
- The simulated AI extraction (replace with real Groq API call)
- Inline styles (translate to Tailwind classes matching the same visual output)

---

## 2. Design System Tokens

These tokens from the prototype must be translated 1:1 into Tailwind CSS variables
in `tailwind.config.ts` and used consistently across all components.

### Analyst Workspace Color Palette (`S` object in prototype)

```typescript
// tailwind.config.ts — extend colors with these values
colors: {
  // Backgrounds
  'canvas':    '#f0f2f8',   // Page background (cool grey-white)
  'surface':   '#ffffff',   // Cards, topbar, sidebar
  'inset':     '#eef0f8',   // Inputs, nested backgrounds
  'hover':     '#e4e7f5',   // Hover states

  // Borders
  'border-default': '#d4d8ee',
  'border-subtle':  '#e4e7f5',

  // Typography
  'text-primary':   '#0b0f2e',   // Deep navy — all body text
  'text-muted':     '#5a6080',   // Secondary text
  'text-dim':       '#8890b0',   // Labels, placeholders
  'text-faint':     '#b8bdd4',   // Disabled, min/max labels

  // Primary accent — Electric Indigo
  'primary':        '#5c6bff',
  'primary-bg':     '#5c6bff12',
  'primary-border': '#5c6bff30',
  'primary-dark':   '#3d4fd4',

  // Status colors
  'success':        '#0ead69',
  'success-bg':     '#0ead6912',
  'success-border': '#0ead6930',
  'warning':        '#f59e0b',
  'warning-bg':     '#f59e0b12',
  'warning-border': '#f59e0b30',
  'danger':         '#ef4444',
  'danger-bg':      '#ef444412',
  'danger-border':  '#ef444430',

  // Accent pops
  'violet':   '#8b5cf6',
  'teal':     '#14b8a6',
  'orange':   '#f97316',
}
```

### Executive Dashboard Color Palette (`E` object in prototype)

```typescript
// Used ONLY in /executive/* routes
// executive theme tokens (add as CSS vars or separate Tailwind group)
'exec-canvas':   '#f5f7ff',
'exec-surface':  '#ffffff',
'exec-inset':    '#edf0fc',
'exec-deep':     '#e2e6f8',
'exec-border':   '#cdd3f0',
'exec-text':     '#090d28',
'exec-muted':    '#525a80',
'exec-faint':    '#a8b0d0',
'exec-amber':    '#e67e00',   // Primary data color for executives
'exec-green':    '#059652',
'exec-red':      '#dc2626',
'exec-blue':     '#2563eb',
'exec-violet':   '#7c3aed',
```

### Super Admin Palette (NEW — not in prototype)

```typescript
// Used ONLY in /admin/* routes
'admin-canvas':   '#fafbff',
'admin-surface':  '#ffffff',
'admin-inset':    '#f1f3ff',
'admin-border':   '#dde2f5',
'admin-text':     '#0c0f28',
'admin-muted':    '#5a6080',
// Admin accent — deep violet (distinct from analyst indigo)
'admin-primary':  '#7c3aed',
'admin-bg':       '#7c3aed12',
'admin-border-a': '#7c3aed30',
```

---

## 3. Typography Rules

```css
/* UI Text — Plus Jakarta Sans */
font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;

/* Data / Numbers — JetBrains Mono */
/* Apply to: all NPV values, IRR%, dates, tickers, KPI values, sliders, table numbers */
font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Rules Cursor must follow:**
- Every numeric value rendered on screen uses `font-mono` (JetBrains Mono)
- All section labels / card titles: `text-[9px] uppercase tracking-[1.8px] font-semibold text-dim`
- Body text: `text-[13px] text-primary`
- Muted descriptions: `text-[11px] text-muted`
- Card title accent: a 3px wide × 12px tall indigo left-border bar before the title text

---

## 4. Component Patterns

These patterns from the prototype must be replicated exactly in the production components.

### Card Component
```
white background · 1px border (#d4d8ee) · 10px border-radius · 18px padding
Title row: 3px indigo bar + uppercase label in dim text + bottom border
```

### KPI Card
```
#eef0f8 background · colored top bar (3px, full opacity) · 9px uppercase label · 
18px bold value in JetBrains Mono · colored per status (indigo/green/amber)
```

### Slider
```
Indigo track fill · 3px height · min/max labels in 9px faint monospace
Current value displayed right-aligned in indigo JetBrains Mono
```

### Tag / Badge
```
10px uppercase · letterSpacing 1.2 · 3px border-radius · colored bg + border + text
```

### Avatar
```
6px border-radius (square-ish) · initials in monospace · indigo text
```

### Status Colors
```
● Proceed  → #0ead69 (green)
● Monitor  → #f59e0b (amber)  
● Avoid    → #ef4444 (red)
```

---

## 5. Layout Architecture

### Analyst Workspace — Three-View Flow
```
1. Company List  →  app/analyst/page.tsx
   Grid of CompanyCards (min 280px)
   Each card: name + location + status badge + NPV/IRR/DD KPIs (if snapshot exists)
   Buttons: "AI Extract" + "Calculator"

2. AI Extraction  →  app/analyst/[companyId]/extract/page.tsx
   Upload zone (dashed border) → progress list → extracted data grid → "Open in Calculator"
   See ExtractionView component in prototype lines 802–879

3. Calculator  →  app/analyst/[companyId]/calculator/[module]/page.tsx
   Fixed left sidebar (210px): back button + company name + 9 nav items + Live NPV badge
   Fixed topbar: module name + "MOD 01/09 · TICKER" + Save Snapshot button
   Scrollable main area: active module content
   See CalculatorWorkspace + M1–M9 components in prototype lines 603–602
```

### Executive Dashboard — Two-Panel Layout
```
Fixed topbar: "M&A INTEL" amber logo + "Executive Terminal" + live UTC timestamp
Left panel (240px): Watchlist — company list with NPV + recommendation dot
Right panel (flex): Selected company view
  - Header bar: company name + left color border from recommendation color
  - Hero card: NPV in large monospace (green/red) + IRR/payback/synergy
  - Scenario strip: BEAR/BASE/BULL with colored top borders
  - History table: all snapshots (if 2+)
  - Portfolio comparison: horizontal bars
See ExecutiveDashboard component in prototype lines 882–1063
```

### Super Admin — Sidebar + Content Layout (NEW)
```
Fixed topbar: shield icon + "M&A Admin" + nav links (Dashboard · Users) + user badge
Content: full-width page area
Dashboard page: SystemStats bar + Quick Actions + AuditLogFeed
Users page: Tabs (Users | Audit Log) + UserTable with full CRUD
```

---

## 6. Data Structures

These TypeScript types are the exact shape of the data. Cursor must generate
Drizzle schema, tRPC routers, and React components that all use these shapes.

### Company
```typescript
type Company = {
  id: string
  name: string           // e.g. company legal name
  ticker: string         // "MSN"
  location: string       // "Kalimantan Timur"
  type: string           // "Thermal Coal"
  iup: string            // "IUP-2024-KT-0081"
  entityType: string
  listedOn: string       // "IDX" | "Unlisted"
  mineralClass: string   // "Thermal Coal GAR 4,500–6,600"
  shareGov: number       // 0–100 (%)
  sharePublic: number
  shareForeign: number
  status: 'active' | 'watchlist' | 'archived'
  snapshots: Snapshot[]
}
```

### Snapshot Params (all 9 modules combined)
```typescript
type SnapshotParams = {
  // Module 4 — Financial Valuation
  coalPrice: number        // $/t, range 50–250
  discRate: number         // %, range 5–25
  annualProd: number       // Mt/yr, range 1–20
  mineLife: number         // years, range 5–40
  cashCost: number         // $/t (auto-calculated from Pit-to-Port)
  royaltyRate: number      // %, range 0–15
  taxRate: number          // %, range 10–35
  capex: number            // $M, range 50–500

  // Module 2 — Reserve Evaluation
  measuredMt: number       // Mt
  indicatedMt: number      // Mt
  inferredMt: number       // Mt
  measuredGar: number      // kcal/kg
  indicatedGar: number     // kcal/kg
  inferredGar: number      // kcal/kg
  recoveryRate: number     // %, range 50–100
  stripRatio: number       // :1, range 1–20

  // Module 3 — Pit-to-Port
  haulingDist: number      // km, range 5–150
  bargeDist: number        // km, range 50–500
  crushCost: number        // $/t, range 1–8
  portHandling: number     // $/t, range 1–10

  // Module 7 — Deal Structuring
  acquisitionCost: number  // $M, range 50–500
  debtPct: number          // %, range 0–80
  debtCost: number         // %, range 3–20
  loanTenor: number        // years, range 1–10

  // Module 8 — Synergy
  sharedInfra: number      // units, range 1–30
  gaConsolidation: number  // %, range 0–80
  procSavings: number      // %, range 0–25

  // Module 9 — Risk & Regulatory (compliance flags)
  iupValid: boolean
  certClean: boolean
  amdal: boolean
  ppa: boolean
  dmb: boolean
}
```

### Snapshot Computed Outputs
```typescript
type ComputedOutputs = {
  npv: number              // $M — primary valuation metric
  irr: number              // % — internal rate of return
  payback: number          // years — capital recovery period
  bearNpv: number          // $M — price -20%, DR +2%
  bullNpv: number          // $M — price +20%, DR -2%
  ddScore: number          // 0–5 — due diligence score
  synergy: number          // $M — annual post-merger synergy
  recommendation: 'proceed' | 'monitor' | 'avoid'
}
```

---

## 7. DCF Calculation — Source of Truth

This exact formula from the prototype (lines 145–153) is the source of truth.
All implementations (client and server) must produce identical results.

```typescript
function calcNPV(p: SnapshotParams): number {
  const revenue = p.coalPrice * p.annualProd
  const opex    = p.cashCost  * p.annualProd
  const royalty = revenue * (p.royaltyRate / 100)
  const ebitda  = revenue - opex - royalty
  const dep     = p.capex / p.mineLife
  const ebit    = ebitda - dep
  const tax     = Math.max(ebit * (p.taxRate / 100), 0)
  const fcf     = ebit - tax + dep

  let npv = -p.capex
  for (let y = 1; y <= p.mineLife; y++) {
    npv += fcf / Math.pow(1 + p.discRate / 100, y)
  }
  return Math.round(npv)
}

// Pit-to-Port cost auto-calculation (drives cashCost in params)
function calcCashCost(p: SnapshotParams): number {
  const hauling = p.haulingDist  * 0.4
  const barge   = p.bargeDist    * 0.08
  const crush   = p.crushCost              // direct input
  const port    = p.portHandling           // direct input
  return parseFloat((hauling + barge + crush + port).toFixed(2))
}

// Recommendation thresholds
function calcRecommendation(npv: number): 'proceed' | 'monitor' | 'avoid' {
  if (npv > 800)  return 'proceed'
  if (npv > 400)  return 'monitor'
  return 'avoid'
}
```

---

## 8. AI Extraction — Groq Integration

The prototype simulates extraction with a `setTimeout`. In production, replace with
the real Groq API call described in PROMPT 06 of the Cursor Brief.

**What the extraction returns (shape must match this):**
```typescript
type ExtractionResult = {
  // Reserve data
  reservesMt:      number | null   // Total resources Mt
  measuredMt:      number | null
  indicatedMt:     number | null
  inferredMt:      number | null
  coalGarAvg:      number | null   // kcal/kg

  // Cost & financial
  cashCostEstimate: number | null  // $/t FOB
  annualRevenue:    number | null  // $M
  ebitda:           number | null  // $M
  netAssets:        number | null  // $M

  // Regulatory
  iupStatus:        string | null  // e.g. "Valid until 2034"
  environmentalStatus: string | null

  // Compliance flags (auto-populated from document text)
  complianceFlags: {
    iupValid:   boolean
    certClean:  boolean
    amdal:      boolean
    ppa:        boolean
    dmb:        boolean
  }

  confidence: number  // 0–100
}
```

**The extraction flow from the prototype (ExtractionView, lines 802–879):**
1. Analyst uploads PDF → drag zone
2. Progress list animates: "Detecting structure", "Extracting reserves", etc.
3. Results appear in a 2-column data grid
4. "Open in Calculator" pre-fills the relevant SnapshotParams fields

---

## 9. Navigation Module Map

The calculator sidebar has exactly 9 modules in this order.
Each maps to a route segment `/calculator/[1-9]`.

| # | Icon | Label | Key Params |
|---|------|-------|-----------|
| 1 | 🏢 | Company Profile | name, entityType, shareGov/Public/Foreign |
| 2 | ⛏️ | Reserve Evaluation | measuredMt, indicatedMt, inferredMt, GAR values, recoveryRate |
| 3 | 🚢 | Pit-to-Port | haulingDist, bargeDist, crushCost, portHandling → auto-sets cashCost |
| 4 | 📊 | Financial Valuation | coalPrice, discRate, royaltyRate, taxRate, capex → live NPV |
| 5 | 🎯 | Sensitivity Analysis | NPV matrix (price Δ vs DR) + tornado chart |
| 6 | 🔮 | Scenario Simulation | Bear/Base/Bull NPV bars + IRR/payback |
| 7 | 🤝 | Deal Structuring | acquisitionCost, debtPct, debtCost, loanTenor |
| 8 | ⚡ | Synergy Estimation | sharedInfra, gaConsolidation, procSavings → total synergy |
| 9 | 🛡️ | Risk & Regulatory | 5 compliance checkboxes → DD Score 0–5 |

**Module dependency order:** M3 feeds M4 (cashCost). M4 feeds M5, M6, M7, M8.
When any parameter changes, NPV in the sidebar must recalculate immediately.

---

## 10. Cursor Workflow Instructions

When building any component in this project, follow this sequence:

1. **Open mining_mna_stage2.jsx** — find the equivalent component/section
2. **Identify the visual structure** — layouts, colors, spacing from the S/E tokens
3. **Map the data** — match props to the TypeScript types in Section 6
4. **Translate inline styles → Tailwind** using the token map in Section 2
5. **Keep identical behavior** — same calculation formulas, same UX flow
6. **Use shadcn/ui primitives** for interactive elements (Dialog, Slider, Input, etc.)
   then style them to match the prototype's visual language

**Example mapping — Card component:**
```
Prototype:  background:S.bg2, border:`1px solid ${S.border}`, borderRadius:10
Tailwind:   bg-surface border border-border-default rounded-[10px]

Prototype:  fontSize:10, color:S.textDim, textTransform:"uppercase", letterSpacing:1.8
Tailwind:   text-[10px] text-text-dim uppercase tracking-[1.8px]
```

**Always check:** Does the Tailwind output visually match the prototype at the same
viewport size? If not, adjust until it does.

---

*Reference file: mining_mna_stage2.jsx (1,140 lines)*
*Prototype stack: React 18, inline styles, no backend*
*Production stack: Next.js 14, Tailwind, tRPC, Neon, Auth.js, Groq*
