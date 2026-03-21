"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { defaultSnapshotParams, type SnapshotParams } from "@/lib/validations";
import type { ExtractionResult } from "@/lib/validations";

export default function ExtractPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = String(params.companyId);
  const company = trpc.company.get.useQuery({ id: companyId });
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  async function runExtract() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, companyId }),
      });
      const data = (await res.json()) as ExtractionResult | { error?: string };
      if (!res.ok) throw new Error("error" in data ? String(data.error) : "Failed");
      setResult(data as ExtractionResult);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }

  function applyToCalculator() {
    if (!result) return;
    const q = new URLSearchParams();
    const patch: Partial<SnapshotParams> = {
      ...defaultSnapshotParams,
      measuredMt: result.measuredMt ?? defaultSnapshotParams.measuredMt,
      indicatedMt: result.indicatedMt ?? defaultSnapshotParams.indicatedMt,
      inferredMt: result.inferredMt ?? defaultSnapshotParams.inferredMt,
      measuredGar: result.coalGarAvg ?? defaultSnapshotParams.measuredGar,
      indicatedGar: result.coalGarAvg ?? defaultSnapshotParams.indicatedGar,
      inferredGar: result.coalGarAvg ?? defaultSnapshotParams.inferredGar,
      cashCost: result.cashCostEstimate ?? defaultSnapshotParams.cashCost,
      iupValid: result.complianceFlags.iupValid,
      certClean: result.complianceFlags.certClean,
      amdal: result.complianceFlags.amdal,
      ppa: result.complianceFlags.ppa,
      dmb: result.complianceFlags.dmb,
    };
    q.set("prefill", JSON.stringify(patch));
    router.push(`/analyst/${companyId}/calculator/1?${q.toString()}`);
  }

  return (
    <div className="min-h-screen bg-canvas font-sans text-text-primary">
      <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/analyst")}>
            ←
          </Button>
          <div className="font-mono text-sm font-semibold text-primary">AI Extraction Engine</div>
          <Badge variant="default">{company.data?.name ?? "…"}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
          Sign out
        </Button>
      </header>
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-4 rounded-xl border-2 border-dashed border-primary-border bg-surface p-7 text-center">
          <div className="mb-2 text-3xl">📄</div>
          <div className="mb-1 text-sm text-text-muted">Paste document text for {company.data?.name ?? "target"}</div>
          <div className="mb-4 text-[10px] text-text-faint">Annual Report · Geological Report · IUP Certificate · P&amp;L</div>
          <textarea
            className="mb-4 min-h-[140px] w-full rounded-md border border-border bg-inset p-3 text-sm"
            placeholder="Paste extracted PDF text here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={() => void runExtract()} disabled={loading || !text.trim()}>
            {loading ? "⏳ Extracting with AI…" : "✨ Extract Data with AI"}
          </Button>
        </div>
        {loading ? (
          <Card>
            {["Detecting document structure", "Extracting reserve figures", "Reading financial statements", "Parsing regulatory data", "Calculating confidence scores"].map(
              (s, i) => (
                <div key={i} className="border-b border-border py-1 text-[11px] text-text-faint">
                  ⚡ {s}
                </div>
              ),
            )}
          </Card>
        ) : null}
        {result ? (
          <Card className="border-success-border">
            <div className="mb-3 flex justify-between">
              <div className="text-sm font-bold text-success">✓ Extraction Complete</div>
              <Badge variant="success">{result.confidence}% confidence</Badge>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {[
                ["Total Resources", result.reservesMt != null ? `${result.reservesMt} Mt` : "—"],
                ["Average GAR", result.coalGarAvg != null ? `${result.coalGarAvg} kcal/kg` : "—"],
                ["Cash Cost", result.cashCostEstimate != null ? `$${result.cashCostEstimate}/t` : "—"],
                ["Annual Revenue", result.annualRevenue != null ? `$${result.annualRevenue}M` : "—"],
                ["EBITDA", result.ebitda != null ? `$${result.ebitda}M` : "—"],
                ["Net Assets", result.netAssets != null ? `$${result.netAssets}M` : "—"],
                ["IUP Status", result.iupStatus ?? "—"],
                ["Environment", result.environmentalStatus ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-md bg-inset px-3 py-2 text-[11px]">
                  <span className="text-text-dim">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => applyToCalculator()}>
                → Open in 9-Module Calculator
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/analyst/${companyId}/calculator/1`}>Skip prefill</Link>
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
