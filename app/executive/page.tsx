"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { signOutToLogin } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

function fmtM(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}M`;
}

function recColor(r: string) {
  if (r === "proceed") return "#059652";
  if (r === "monitor") return "#e67e00";
  return "#dc2626";
}

function recLabel(r: string) {
  if (r === "proceed") return "PROCEED";
  if (r === "monitor") return "MONITOR";
  return "AVOID";
}

export default function ExecutivePage() {
  const { data: session } = useSession();
  const { data: companies, isLoading } = trpc.company.list.useQuery();
  const [sel, setSel] = useState<string | null>(null);

  const withData = useMemo(() => (companies ?? []).filter((c) => c.snapshots.length > 0), [companies]);
  const selCo = sel ? companies?.find((c) => c.id === sel) : null;
  const lat = selCo?.snapshots[0];
  const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-exec-canvas to-[#f8f7ff] font-sans text-exec-text">
      <header className="flex h-11 shrink-0 items-stretch border-b border-exec-border border-t-[3px] border-t-exec-blue bg-exec-surface px-5">
        <div className="flex items-center gap-2 border-r border-exec-border pr-4">
          <div className="h-1.5 w-1.5 rounded-full bg-exec-amber" />
          <span className="font-mono text-[13px] font-bold tracking-wide text-exec-amber">M&amp;A INTEL</span>
        </div>
        <div className="flex items-center border-r border-exec-border px-4">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-exec-muted">Executive Terminal · Stage II</span>
        </div>
        <div className="flex flex-1 items-center justify-between px-4">
          <span className="font-mono text-[10px] text-exec-muted">{now}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded border border-exec-border bg-exec-inset font-mono text-[10px] font-semibold text-exec-amber">
                {session?.user?.name?.slice(0, 2).toUpperCase() ?? "—"}
              </div>
              <div>
                <div className="text-[11px] text-exec-text">{session?.user?.name}</div>
                <div className="font-mono text-[9px] uppercase tracking-wide text-exec-muted">{session?.user?.team}</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-exec-border text-exec-muted" onClick={() => signOutToLogin()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="w-60 shrink-0 border-r border-exec-border bg-exec-surface shadow-[2px_0_6px_rgba(0,0,0,0.04)]">
          <div className="border-b border-exec-border px-3.5 py-2.5">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[2px] text-exec-muted">
              Watchlist <span className="text-exec-faint">({companies?.length ?? 0})</span>
            </div>
          </div>
          <div className="max-h-[calc(100vh-5.5rem)] overflow-y-auto">
            {(companies ?? []).map((co) => {
              const l = co.snapshots[0];
              const hasData = co.snapshots.length > 0;
              const active = sel === co.id;
              return (
                <button
                  type="button"
                  key={co.id}
                  disabled={!hasData}
                  onClick={() => hasData && setSel(co.id)}
                  className={`w-full border-b border-exec-border px-3.5 py-2.5 text-left transition-colors ${
                    active ? "border-l-[3px] border-l-exec-blue bg-exec-deep" : "border-l-[3px] border-l-transparent"
                  } ${hasData ? "cursor-pointer opacity-100" : "cursor-default opacity-35"}`}
                >
                  <div className="mb-1 text-[11px] leading-snug text-exec-muted">{co.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-exec-faint">
                      {co.ticker} · {co.snapshots.length}v
                    </span>
                    {l ? (
                      <span className="font-mono text-[11px] font-semibold" style={{ color: recColor(l.recommendation) }}>
                        {fmtM(Number(l.npv))}
                      </span>
                    ) : null}
                  </div>
                  {l ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full" style={{ background: recColor(l.recommendation) }} />
                      <span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: recColor(l.recommendation) }}>
                        {recLabel(l.recommendation)}
                      </span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="border-t border-exec-border px-3.5 py-2.5">
            <div className="font-mono text-[9px] uppercase tracking-wide text-exec-faint">{withData.length} valuations active</div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-exec-inset p-5">
          {isLoading ? <p className="text-sm text-exec-muted">Loading…</p> : null}
          {!selCo || !lat ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-exec-faint">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-exec-border text-2xl opacity-40">⛏</div>
              <div className="font-mono text-xs uppercase tracking-[2px] text-exec-muted">Select target from watchlist</div>
              <div className="font-mono text-[10px]">{withData.length} valuations ready</div>
            </div>
          ) : (
            <div>
              <div
                className="mb-4 flex items-start justify-between rounded-lg border border-exec-border bg-gradient-to-br from-exec-surface to-exec-inset p-4"
                style={{ borderLeftWidth: 4, borderLeftColor: recColor(lat.recommendation) }}
              >
                <div>
                  <div className="mb-1 text-base font-semibold tracking-tight text-exec-text">{selCo.name}</div>
                  <div className="font-mono text-[10px] text-exec-muted">
                    {selCo.ticker} · {selCo.location} · {selCo.type} · {selCo.iup}
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-1 flex items-center justify-end gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: recColor(lat.recommendation) }} />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wide" style={{ color: recColor(lat.recommendation) }}>
                      {recLabel(lat.recommendation)}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-exec-muted">
                    DD {Number(lat.ddScore)}/5 · {lat.date instanceof Date ? lat.date.toISOString().slice(0, 10) : String(lat.date)}
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-5 gap-2.5">
                {[
                  ["Net Present Value (DCF)", fmtM(Number(lat.npv)), `@ ${Number(lat.irr)}% IRR · ${Number(lat.payback)}yr payback`, Number(lat.npv) > 0 ? "border-exec-green/20" : "border-exec-red/20"],
                  ["IRR", `${Number(lat.irr)}%`, "Internal rate of return", "border-exec-border"],
                  ["Payback", `${Number(lat.payback)}y`, "Capital recovery", "border-exec-border"],
                  ["Synergy", `+$${Number(lat.synergy)}M`, "Annual post-merger", "border-exec-border"],
                  ["DD Score", `${Number(lat.ddScore)}/5`, "Due diligence", "border-exec-border"],
                ].map(([title, val, sub, border]) => (
                  <div key={title} className={`relative overflow-hidden rounded-lg border bg-exec-surface p-4 shadow-sm ${border}`}>
                    <div className="absolute left-0 right-0 top-0 h-[3px] bg-exec-amber" />
                    <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[1.8px] text-exec-muted">{title}</div>
                    <div className="font-mono text-[22px] font-bold leading-none text-exec-amber">{val}</div>
                    {sub ? <div className="mt-1.5 font-mono text-[10px] text-exec-muted">{sub}</div> : null}
                  </div>
                ))}
              </div>

              <div className="mb-4 rounded-lg border border-exec-border bg-exec-inset px-5 py-4">
                <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[2px] text-exec-muted">Scenario Analysis</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["BEAR", Number(lat.bearNpv), "#dc2626", "Price -20% · DR +2%"],
                    ["BASE", Number(lat.npv), "#e67e00", "Current parameters"],
                    ["BULL", Number(lat.bullNpv), "#059652", "Price +20% · DR -2%"],
                  ].map(([label, v, c, sub]) => (
                    <div key={label} className="rounded-md border border-exec-border bg-exec-surface p-4" style={{ borderTopWidth: 3, borderTopColor: c as string }}>
                      <div className="mb-2 font-mono text-[9px] uppercase tracking-[2px]" style={{ color: c as string }}>
                        {label} CASE
                      </div>
                      <div className="font-mono text-3xl font-bold leading-none" style={{ color: c as string }}>
                        {fmtM(v as number)}
                      </div>
                      <div className="mt-1.5 font-mono text-[9px] text-exec-muted">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selCo.snapshots.length > 1 ? (
                <div className="rounded-lg border border-exec-border bg-exec-surface p-4 shadow-sm">
                  <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[2px] text-exec-muted">Valuation History</div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-exec-border">
                        {["Date", "NPV", "Status"].map((h) => (
                          <th key={h} className="px-2 py-1 text-left font-mono text-[9px] font-normal uppercase tracking-wide text-exec-faint">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selCo.snapshots.map((snap, i) => (
                        <tr key={snap.id} className="border-b border-exec-border">
                          <td className="px-2 py-2 font-mono text-[10px] text-exec-muted">
                            {snap.date instanceof Date ? snap.date.toISOString().slice(0, 10) : String(snap.date)}
                          </td>
                          <td className="px-2 py-2 font-mono text-[11px] text-exec-amber">{fmtM(Number(snap.npv))}</td>
                          <td className="px-2 py-2 font-mono text-[9px] uppercase tracking-wide" style={{ color: recColor(snap.recommendation) }}>
                            {recLabel(snap.recommendation)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
