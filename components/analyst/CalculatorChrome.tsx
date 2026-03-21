"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { NAV_MODULES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useCalculator } from "@/components/analyst/calculator-context";
import { useSession } from "next-auth/react";

function fmtM(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}M`;
}

export function CalculatorChrome({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const mod = Number(params.module) || 1;
  const { company, npv, saveMsg, saveSnapshot, saving } = useCalculator();
  const { data: session } = useSession();
  const ticker = company?.ticker ?? "—";

  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-sans text-text-primary">
      <aside className="flex w-[216px] shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border p-3.5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-[22px] w-[22px] items-center justify-center rounded border border-primary-border bg-primary-bg text-[11px]">
              ⛏
            </div>
            <span className="font-mono text-[10px] tracking-wide text-text-muted">MINING M&amp;A</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/analyst")}
            className="mb-2.5 flex items-center gap-1 bg-transparent text-[10px] text-text-dim hover:text-text-primary"
          >
            ← workspace
          </button>
          <div className="rounded-md border border-border-subtle border-l-2 border-l-primary bg-inset p-2">
            <div className="text-[9px] uppercase tracking-wide text-text-dim">Target</div>
            <div className="text-[11px] font-semibold leading-snug">{company?.name ?? "…"}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-1.5 py-2">
          <div className="px-2 pb-2 font-mono text-[9px] uppercase tracking-[2px] text-text-faint">Modules</div>
          {NAV_MODULES.map((item) => {
            const active = mod === item.id;
            return (
              <Link
                key={item.id}
                href={`/analyst/${params.companyId}/calculator/${item.id}`}
                className={`mb-0.5 flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-[11px] transition-colors ${
                  active
                    ? "border-primary-border bg-[#5c6bff18] text-primary"
                    : "border-transparent text-text-muted hover:bg-inset"
                }`}
              >
                <span className="text-xs opacity-80">{item.icon}</span>
                <span className="flex-1 font-medium">{item.label}</span>
                <span className="font-mono text-[9px] text-text-faint">{String(item.id).padStart(2, "0")}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3.5">
          <div className="text-[9px] uppercase tracking-wide text-text-dim">Live NPV</div>
          <div className={`font-mono text-xl font-bold ${npv > 0 ? "text-success" : "text-danger"}`}>{fmtM(npv)}</div>
          <div className="mt-0.5 font-mono text-[9px] text-text-faint">@ spot parameters</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-5 py-2.5 shadow-sm">
          <div>
            <div className="text-sm font-semibold tracking-tight">
              {NAV_MODULES.find((n) => n.id === mod)?.label ?? "Module"}
            </div>
            <div className="font-mono text-[10px] text-text-dim">
              MOD {String(mod).padStart(2, "0")}/9 · {ticker}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {saveMsg ? <span className="font-mono text-[11px] font-semibold text-success">{saveMsg}</span> : null}
            <Button size="sm" onClick={() => void saveSnapshot()} disabled={saving}>
              {saving ? "Saving…" : "Save Snapshot"}
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex h-7 w-7 items-center justify-center rounded border border-border bg-inset font-mono text-[10px] font-semibold text-primary">
              {session?.user?.name?.slice(0, 2).toUpperCase() ?? "—"}
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
              Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
