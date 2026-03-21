"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RouterOutputs } from "@/lib/trpc-types";

type Co = RouterOutputs["company"]["list"][number];

function fmtM(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}M`;
}

export function CompanyCard({ company }: { company: Co }) {
  const lat = company.snapshots[0];
  return (
    <div className="rounded-lg border border-border bg-surface p-[18px]">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-bold text-text-primary">{company.name}</div>
          <div className="text-[10px] text-text-faint">
            {company.location} · {company.type}
          </div>
        </div>
        <Badge variant={company.status === "active" ? "success" : "default"}>
          {company.status}
        </Badge>
      </div>
      {lat ? (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            ["NPV", fmtM(Number(lat.npv))],
            ["IRR", `${Number(lat.irr)}%`],
            ["DD", `${Number(lat.ddScore)}/5`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md bg-canvas px-1.5 py-1.5 text-center">
              <div className="text-[9px] uppercase tracking-wide text-text-faint">{k}</div>
              <div className="font-mono text-[13px] font-bold text-primary">{v}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-3 rounded bg-inset py-2.5 text-center font-mono text-[10px] tracking-wide text-text-dim">
          NO VALUATION · ADD VIA AI EXTRACT
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 border-primary-border bg-primary-bg text-primary" asChild>
          <Link href={`/analyst/${company.id}/extract`}>AI Extract</Link>
        </Button>
        <Button variant="outline" className="flex-1 border-success-border bg-success-bg text-success" asChild>
          <Link href={`/analyst/${company.id}/calculator/1`}>Calculator</Link>
        </Button>
      </div>
      {lat ? (
        <div className="mt-2 font-mono text-[9px] text-text-dim">
          {company.snapshots.length} snapshot{company.snapshots.length > 1 ? "s" : ""} ·{" "}
          {lat.date instanceof Date ? lat.date.toISOString().slice(0, 10) : String(lat.date)}
        </div>
      ) : null}
    </div>
  );
}
