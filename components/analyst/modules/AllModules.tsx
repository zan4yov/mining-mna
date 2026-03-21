"use client";

import { useEffect } from "react";
import { useCalculator } from "@/components/analyst/calculator-context";
import { trpc } from "@/lib/trpc";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { calcCashCost, calcNPV } from "@/lib/calculations";
import type { SnapshotParams } from "@/lib/validations";

const S = {
  green: "#0ead69",
  amber: "#f59e0b",
  red: "#ef4444",
  cyan: "#5c6bff",
};

function fmt(n: number, d = 0) {
  return (n == null || Number.isNaN(n)) ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
}
function fmtM(n: number) {
  return `$${fmt(Math.round(n))}M`;
}

function CmpSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3.5">
      <div className="mb-1 flex justify-between">
        <span className="text-[10px] uppercase tracking-wide text-text-dim">{label}</span>
        <span className="font-mono text-xs font-semibold text-primary">
          {fmt(value, step < 1 ? 1 : 0)}
          {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-text-faint">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

export function AllModules({ module }: { module: number }) {
  const { company, companyId, params, setParams, npv } = useCalculator();
  const updateCompany = trpc.company.update.useMutation();

  const u = (k: keyof SnapshotParams, v: SnapshotParams[typeof k]) =>
    setParams((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const t = calcCashCost(params);
    if (t !== params.cashCost) setParams((p) => ({ ...p, cashCost: t }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync pit-to-port → cash cost
  }, [params.haulingDist, params.bargeDist, params.crushCost, params.portHandling]);

  if (!company) return <div className="text-sm text-text-muted">Loading…</div>;

  if (module === 1) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 🏢 Corporate Identity
          </CardTitle>
          {(
            [
              ["Company Name", "name", company.name],
              ["Entity Type", "entityType", company.entityType],
              ["Listed On", "listedOn", company.listedOn],
              ["Location", "location", company.location],
              ["Mineral Class", "mineralClass", company.mineralClass],
              ["IUP License No.", "iup", company.iup],
            ] as const
          ).map(([l, k, val]) => (
            <div key={k} className="mb-2.5">
              <Label>{l}</Label>
              <Input
                className="mt-1"
                value={val}
                onChange={(e) =>
                  void updateCompany.mutateAsync({ id: companyId, [k]: e.target.value })
                }
              />
            </div>
          ))}
        </Card>
        <div className="space-y-3">
          <Card>
            <CardTitle>
              <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 📋 Shareholder Structure
            </CardTitle>
            {(
              [
                ["State Owned", "shareGov", "#6c47ff", company.shareGov],
                ["Public", "sharePublic", "#00a86b", company.sharePublic],
                ["Foreign", "shareForeign", "#f08c00", company.shareForeign],
              ] as const
            ).map(([l, k, c, val]) => (
              <div key={k} className="mb-3">
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-text-muted">{l}</span>
                  <span className="font-bold" style={{ color: c }}>
                    {val}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={(e) =>
                    void updateCompany.mutate({ id: companyId, [k]: Number(e.target.value) })
                  }
                  className="w-full"
                  style={{ accentColor: c }}
                />
              </div>
            ))}
            <div className="mt-2 flex h-4 overflow-hidden rounded-md">
              {(
                [
                  ["shareGov", "#6c47ff", company.shareGov],
                  ["sharePublic", "#00a86b", company.sharePublic],
                  ["shareForeign", "#f08c00", company.shareForeign],
                ] as const
              ).map(([k, c, flexVal]) => (
                <div key={k} style={{ flex: flexVal || 1, background: c }} />
              ))}
            </div>
          </Card>
          <Card>
            <CardTitle>
              <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 📎 AI Document Upload
            </CardTitle>
            <div className="rounded-lg border-2 border-dashed border-border bg-inset p-6 text-center">
              <div className="mb-2 text-2xl">📄</div>
              <div className="mb-1 text-[11px] text-text-muted">Upload financial document (PDF)</div>
              <div className="mb-3 text-[10px] text-text-faint">P&amp;L · Balance Sheet · Annual Report</div>
              <div className="inline-block cursor-pointer rounded border border-primary-border bg-primary-bg px-3 py-1.5 text-[10px] font-semibold text-primary">
                ✦ Extract with AI
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (module === 2) {
    const total = params.measuredMt + params.indicatedMt + params.inferredMt;
    const mine = total * (params.recoveryRate / 100);
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> ⛏️ Block Model Summary
          </CardTitle>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Category", "Mt", "GAR"].map((h) => (
                  <th key={h} className="px-2 py-1 text-left text-[10px] text-text-dim">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Measured", "measuredMt", "measuredGar", "#6c47ff"],
                  ["Indicated", "indicatedMt", "indicatedGar", "#0ea5e9"],
                  ["Inferred", "inferredMt", "inferredGar", "#f08c00"],
                ] as const
              ).map(([n, mk, mg, c]) => (
                <tr key={n} className="border-b border-border">
                  <td className="px-2 py-1.5 font-semibold" style={{ color: c }}>
                    {n}
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      className="h-8 w-20 font-mono text-[11px]"
                      value={params[mk]}
                      onChange={(e) => u(mk, Number(e.target.value))}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      className="h-8 w-24 font-mono text-[11px]"
                      value={params[mg]}
                      onChange={(e) => u(mg, Number(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex justify-between rounded-md border border-border bg-inset p-2.5">
            <span className="text-[11px] text-text-dim">Total Resources</span>
            <span className="font-mono text-sm font-bold text-warning">{fmt(total)} Mt</span>
          </div>
        </Card>
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> ⚙️ Mining Parameters
          </CardTitle>
          <CmpSlider label="Recovery Rate" value={params.recoveryRate} min={50} max={100} unit="%" onChange={(v) => u("recoveryRate", v)} />
          <CmpSlider label="Strip Ratio (OB:Coal)" value={params.stripRatio} min={1} max={20} unit=":1" onChange={(v) => u("stripRatio", v)} />
          <CmpSlider label="Annual Production" value={params.annualProd} min={1} max={20} unit=" Mt/yr" onChange={(v) => u("annualProd", v)} />
          <CmpSlider label="Mine Life" value={params.mineLife} min={5} max={40} unit=" yrs" onChange={(v) => u("mineLife", v)} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border-subtle bg-inset p-3 pt-4">
              <div className="text-[9px] uppercase text-text-dim">Mineable Reserve</div>
              <div className="font-mono text-lg font-bold text-primary">{fmt(mine, 1)} Mt</div>
            </div>
            <div className="rounded-md border border-border-subtle bg-inset p-3 pt-4">
              <div className="text-[9px] uppercase text-text-dim">Est. Mine Life</div>
              <div className="font-mono text-lg font-bold text-primary">{fmt(mine / params.annualProd, 1)} yrs</div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (module === 3) {
    const haul = params.haulingDist * 0.4;
    const barge = params.bargeDist * 0.08;
    const crush = params.crushCost;
    const port = params.portHandling;
    const total = haul + barge + crush + port;
    const items = [
      { l: "1. Mining & Crushing", v: crush, c: "#6c47ff" },
      { l: "2. Hauling", v: haul, c: "#0ea5e9" },
      { l: "3. Barge & Loading", v: barge, c: "#f08c00" },
      { l: "4. Port Handling", v: port, c: "#00a86b" },
    ];
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 🚢 Logistics Cost Flow
          </CardTitle>
          {items.map((it) => (
            <div
              key={it.l}
              className="mb-2 flex items-center justify-between rounded-lg border-l-[3px] bg-inset py-2.5 pl-3 pr-3.5"
              style={{ borderColor: it.c }}
            >
              <span className="text-xs text-text-muted">{it.l}</span>
              <span className="font-mono text-sm font-bold" style={{ color: it.c }}>
                ${fmt(it.v, 1)}
              </span>
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between rounded-lg border border-success-border bg-success-bg p-3">
            <span className="text-[13px] font-bold">Total Cash Cost (FOB)</span>
            <span className="font-mono text-xl font-bold text-success">${fmt(total, 1)}/t</span>
          </div>
          <div className="mt-3 flex h-4 overflow-hidden rounded-md">
            {items.map((it) => (
              <div key={it.l} className="h-full" style={{ flex: it.v, background: it.c }} />
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> ⚙️ Logistics Parameters
          </CardTitle>
          <CmpSlider label="Hauling Distance" value={params.haulingDist} min={5} max={150} unit=" km" onChange={(v) => u("haulingDist", v)} />
          <CmpSlider label="Barge Distance" value={params.bargeDist} min={50} max={500} unit=" km" onChange={(v) => u("bargeDist", v)} />
          <CmpSlider label="Crushing & Sizing" value={params.crushCost} min={1} max={8} step={0.1} unit=" $/t" onChange={(v) => u("crushCost", v)} />
          <CmpSlider label="Port Handling" value={params.portHandling} min={1} max={10} step={0.1} unit=" $/t" onChange={(v) => u("portHandling", v)} />
        </Card>
      </div>
    );
  }

  if (module === 4) {
    const rev = params.coalPrice * params.annualProd;
    const opex = params.cashCost * params.annualProd;
    const roy = rev * (params.royaltyRate / 100);
    const ebitda = rev - opex - roy;
    const dep = params.capex / params.mineLife;
    const ebit = ebitda - dep;
    const tax = Math.max(ebit * (params.taxRate / 100), 0);
    const fcf = ebit - tax + dep;
    return (
      <div>
        <div className="mb-3 grid grid-cols-4 gap-2.5">
          {[
            ["Current Spot NPV", fmtM(npv), npv > 0 ? "border-success-border bg-success-bg" : ""],
            ["Annual FCF", fmtM(Math.round(fcf)), ""],
            ["Annual Revenue", fmtM(Math.round(rev)), ""],
            ["EBITDA Margin", `${fmt((ebitda / rev) * 100, 1)}%`, ""],
          ].map(([lab, val, cls]) => (
            <div key={lab} className={`relative overflow-hidden rounded-md border bg-inset p-3 pt-4 ${cls}`}>
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-primary" />
              <div className="text-[9px] uppercase tracking-wide text-text-dim">{lab}</div>
              <div className={`font-mono text-lg font-bold ${lab === "Current Spot NPV" ? (npv > 0 ? "text-success" : "text-danger") : "text-primary"}`}>
                {val}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardTitle>
              <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 📊 P&amp;L Summary (Annual $M)
            </CardTitle>
            {[
              ["Revenue", rev],
              ["Royalty", -roy],
              ["OPEX", -opex],
              ["EBITDA", ebitda, true],
              ["Depreciation", -dep],
              ["EBIT", ebit],
              ["Tax", -tax],
              ["Free Cash Flow", fcf, true],
            ].map(([l, v, b]) => (
              <div key={String(l)} className="flex justify-between border-b border-border py-1.5 text-xs">
                <span className={b ? "font-bold text-warning" : "text-text-muted"}>{l}</span>
                <span className={`font-mono ${Number(v) < 0 ? "text-danger" : ""}`}>{fmt(Number(v), 1)}</span>
              </div>
            ))}
          </Card>
          <Card>
            <CardTitle>
              <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> ⚙️ DCF Parameters
            </CardTitle>
            <CmpSlider label="Coal Price (FOB)" value={params.coalPrice} min={50} max={250} unit=" $/t" onChange={(v) => u("coalPrice", v)} />
            <CmpSlider label="Discount Rate (WACC)" value={params.discRate} min={5} max={25} step={0.5} unit="%" onChange={(v) => u("discRate", v)} />
            <CmpSlider label="Royalty Rate" value={params.royaltyRate} min={0} max={15} step={0.5} unit="%" onChange={(v) => u("royaltyRate", v)} />
            <CmpSlider label="Income Tax Rate" value={params.taxRate} min={10} max={35} unit="%" onChange={(v) => u("taxRate", v)} />
            <CmpSlider label="CAPEX ($M)" value={params.capex} min={50} max={500} step={5} unit=" M" onChange={(v) => u("capex", v)} />
          </Card>
        </div>
      </div>
    );
  }

  if (module === 5) {
    const dr = params.discRate;
    const cp = params.coalPrice;
    const calc = (price: number, d: number) => {
      const p = { ...params, coalPrice: price, discRate: d };
      return calcNPV(p);
    };
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 🎯 NPV Sensitivity Matrix ($M)
          </CardTitle>
          <p className="mb-2 text-[10px] text-text-dim">Coal Price Δ vs Discount Rate</p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-[10px] text-text-dim">Price / DR</th>
                {[dr - 2, dr, dr + 2].map((d) => (
                  <th key={d} className="px-2 py-1 text-center text-[10px] text-text-dim">
                    {d}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[-20, -10, 0, 10, 20].map((delta) => {
                const price = cp * (1 + delta / 100);
                return (
                  <tr key={delta} className="border-b border-border">
                    <td className="px-2 py-1.5 font-semibold" style={{ color: delta > 0 ? S.green : delta < 0 ? S.red : S.cyan }}>
                      {delta > 0 ? "+" : ""}
                      {delta}%
                    </td>
                    {[dr - 2, dr, dr + 2].map((d) => {
                      const v = calc(price, d);
                      const isBase = delta === 0 && d === dr;
                      return (
                        <td
                          key={d}
                          className={`px-2 py-1.5 text-center font-mono ${v > 0 ? "text-success" : "text-danger"} ${isBase ? "bg-success-bg font-extrabold" : ""}`}
                        >
                          {fmt(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 🌪️ Tornado Chart
          </CardTitle>
          <p className="mb-3 text-[10px] text-text-dim">NPV sensitivity to key variables</p>
          {[
            { l: "Coal Price ±20%", lo: calc(cp * 0.8, dr), hi: calc(cp * 1.2, dr) },
            { l: "Discount Rate ±2%", lo: calc(cp, dr + 2), hi: calc(cp, dr - 2) },
            { l: "Production ±20%", lo: Math.round(npv * 0.8), hi: Math.round(npv * 1.2) },
            { l: "Cash Cost ±20%", lo: Math.round(npv * 1.1), hi: Math.round(npv * 0.9) },
            { l: "CAPEX ±20%", lo: Math.round(npv * 1.06), hi: Math.round(npv * 0.94) },
          ].map(({ l, lo, hi }) => (
            <div key={l} className="mb-2.5">
              <div className="mb-1 flex justify-between text-[10px] text-text-dim">
                <span>{l}</span>
                <span className="font-mono text-text-muted">
                  {fmt(lo)} – {fmt(hi)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-warning"
                  style={{ width: `${Math.min(Math.abs(hi - lo) / 600 * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
          <div className="mt-3 flex items-center justify-between rounded-lg bg-inset p-2.5">
            <span className="text-[11px] text-text-dim">Current Spot NPV</span>
            <span className={`font-mono text-xl font-extrabold ${npv > 0 ? "text-success" : "text-danger"}`}>{fmtM(npv)}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (module === 6) {
    const sc = [
      { l: "Bear Case", sub: "Price -20%, DR +2%", v: Math.round(npv * 0.65), irr: 12, pb: "8.2", c: S.red },
      { l: "Base Case", sub: "Current parameters", v: npv, irr: 18, pb: "5.5", c: S.amber },
      { l: "Bull Case", sub: "Price +20%, DR -2%", v: Math.round(npv * 1.35), irr: 26, pb: "4.1", c: S.green },
    ];
    const mx = Math.max(...sc.map((s) => Math.abs(s.v)), 1);
    return (
      <div>
        <div className="mb-3 grid grid-cols-3 gap-3">
          {sc.map((s) => (
            <Card key={s.l} className="border text-center" style={{ borderColor: `${s.c}44` }}>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: s.c }}>
                {s.l}
              </div>
              <div className="mb-2 text-[10px] text-text-faint">{s.sub}</div>
              <div className="mb-2 font-mono text-2xl font-extrabold" style={{ color: s.c }}>
                {fmtM(s.v)}
              </div>
              <div className="flex justify-around text-[11px] text-text-muted">
                <span>
                  IRR <b style={{ color: s.c }}>{s.irr}%</b>
                </span>
                <span>
                  Payback <b style={{ color: s.c }}>{s.pb} yrs</b>
                </span>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 📊 NPV Comparison
          </CardTitle>
          {sc.map((s) => (
            <div key={s.l} className="mb-3">
              <div className="mb-1 flex justify-between text-xs text-text-muted">
                <span>{s.l}</span>
                <span className="font-mono font-bold" style={{ color: s.c }}>
                  {fmtM(s.v)}
                </span>
              </div>
              <div className="h-7 overflow-hidden rounded-md bg-inset">
                <div
                  className="flex h-full items-center justify-end rounded-md pr-2 text-[10px] font-bold text-white opacity-90"
                  style={{ width: `${(Math.abs(s.v) / mx) * 100}%`, background: s.c }}
                >
                  {s.irr}% IRR
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (module === 7) {
    const acq = params.acquisitionCost;
    const dp = params.debtPct;
    const dc = params.debtCost;
    const dt = params.loanTenor;
    const debt = acq * (dp / 100);
    const eq = acq - debt;
    const ads = debt * (dc / 100) * Math.pow(1 + dc / 100, dt) / (Math.pow(1 + dc / 100, dt) - 1);
    const lnpv = npv - debt * ((dc / 100) * dt);
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 💰 Deal Structuring &amp; Financing
          </CardTitle>
          <CmpSlider label="Acquisition Cost ($M)" value={acq} min={50} max={500} step={5} unit=" M" onChange={(v) => u("acquisitionCost", v)} />
          <CmpSlider label="Debt Financing" value={dp} min={0} max={80} unit="%" onChange={(v) => u("debtPct", v)} />
          <CmpSlider label="Loan Interest Rate" value={dc} min={3} max={20} step={0.5} unit="%" onChange={(v) => u("debtCost", v)} />
          <CmpSlider label="Loan Tenor" value={dt} min={1} max={10} unit=" yrs" onChange={(v) => u("loanTenor", v)} />
          <div className="mt-3 flex h-[18px] overflow-hidden rounded-md">
            <div className="flex flex-[var(--d)] items-center justify-center bg-primary text-[10px] font-semibold text-white" style={{ flex: dp }}>
              {dp > 15 ? `Debt ${dp}%` : ""}
            </div>
            <div className="flex items-center justify-center bg-success/80 text-[10px] font-semibold text-white" style={{ flex: 100 - dp }}>
              {100 - dp > 15 ? `Equity ${100 - dp}%` : ""}
            </div>
          </div>
        </Card>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Debt Amount", fmtM(Math.round(debt))],
              ["Equity Required", fmtM(Math.round(eq))],
              ["Annual Debt Service", fmtM(Math.round(ads))],
              ["Levered NPV", fmtM(Math.round(lnpv))],
            ].map(([k, v]) => (
              <div key={k} className="relative overflow-hidden rounded-md border border-border-subtle bg-inset p-3 pt-4">
                <div className="absolute left-0 right-0 top-0 h-0.5 bg-primary" />
                <div className="text-[9px] uppercase text-text-dim">{k}</div>
                <div className={`font-mono text-lg font-bold ${k === "Levered NPV" && lnpv > 0 ? "text-success" : "text-primary"}`}>{v}</div>
              </div>
            ))}
          </div>
          <Card>
            <CardTitle>
              <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> 📋 Deal Economics
            </CardTitle>
            {[
              ["Acquisition Cost", `$${fmt(acq)}M`],
              ["Enterprise Value", fmtM(npv)],
              ["Premium/(Discount)", `${fmt((acq / Math.max(npv, 1) - 1) * 100, 1)}%`],
              ["Debt", `$${fmt(Math.round(debt))}M @ ${dc}%`],
              ["Equity", `$${fmt(Math.round(eq))}M`],
              ["Tenor", `${dt} years`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border py-1.5 text-[11px]">
                <span className="text-text-muted">{k}</span>
                <span className="font-semibold text-text-primary">{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (module === 8) {
    const infra = params.sharedInfra;
    const cs = infra * 0.8 + 10;
    const rs = infra * 0.5;
    const tot = cs + rs;
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> ⚡ Post-Merger Synergy
          </CardTitle>
          <CmpSlider label="Shared Infrastructure Overlap" value={infra} min={1} max={30} unit=" units" onChange={(v) => u("sharedInfra", v)} />
          <CmpSlider label="G&A Consolidation" value={params.gaConsolidation} min={0} max={80} unit="%" onChange={(v) => u("gaConsolidation", v)} />
          <CmpSlider label="Procurement Savings" value={params.procSavings} min={0} max={25} unit="%" onChange={(v) => u("procSavings", v)} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-canvas p-2.5 text-center">
              <div className="text-[9px] uppercase text-text-dim">Cost Synergy/yr</div>
              <div className="font-mono text-lg font-bold text-success">${fmt(Math.round(cs))}M</div>
            </div>
            <div className="rounded-lg bg-canvas p-2.5 text-center">
              <div className="text-[9px] uppercase text-text-dim">Revenue Synergy/yr</div>
              <div className="font-mono text-lg font-bold text-[#0ea5e9]">${fmt(Math.round(rs))}M</div>
            </div>
          </div>
        </Card>
        <div className="space-y-3">
          <Card className="border-0 bg-success text-center text-white">
            <div className="text-xs font-bold">Total Annual Synergy</div>
            <div className="font-mono text-4xl font-extrabold">+${fmt(Math.round(tot))}M</div>
          </Card>
          <Card>
            {[
              ["Current NPV", fmtM(npv), S.amber],
              ["Synergy NPV (3yr)", `+${fmtM(Math.round(tot * 3))}`, S.green],
              ["Post-Synergy NPV", fmtM(Math.round(npv + tot * 3)), S.green],
            ].map(([k, v, c]) => (
              <div key={k} className="flex justify-between border-b border-border py-2 text-sm">
                <span className="text-text-muted">{k}</span>
                <span className="font-mono font-bold" style={{ color: c }}>
                  {v}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (module === 9) {
    const checks = [
      { k: "iupValid" as const, l: "IUP Operasi Produksi Valid", d: "Izin aktif, tidak dalam sengketa" },
      { k: "certClean" as const, l: "Sertifikat Clear and Clean (CnC)", d: "Tidak ada tumpang tindih wilayah" },
      { k: "amdal" as const, l: "AMDAL / Dokumen Lingkungan", d: "Disetujui instansi berwenang" },
      { k: "ppa" as const, l: "Izin Pinjam Pakai Kawasan Hutan", d: "IPPKH bila area masuk kawasan hutan" },
      { k: "dmb" as const, l: "Kepatuhan Kuota DMO", d: "Memenuhi kewajiban batubara domestik" },
    ];
    const vals = checks.map((c) => params[c.k]);
    const pass = vals.filter(Boolean).length;
    const score = parseFloat(((pass / checks.length) * 5).toFixed(1));
    const sc = score >= 4 ? S.green : score >= 3 ? S.amber : S.red;
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>
            <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> ✅ Compliance Checklist
          </CardTitle>
          {checks.map((c, i) => {
            const checked = vals[i];
            return (
              <button
                type="button"
                key={c.k}
                onClick={() => u(c.k, !checked)}
                className="mb-2 flex w-full cursor-pointer gap-2.5 rounded-lg border-l-4 bg-inset py-2.5 pl-3 text-left"
                style={{ borderColor: checked ? S.green : S.red }}
              >
                <div
                  className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border text-[11px] text-white"
                  style={{ background: checked ? S.green : "transparent", borderColor: checked ? S.green : S.red }}
                >
                  {checked ? "✓" : ""}
                </div>
                <div>
                  <div className="text-xs font-semibold">{c.l}</div>
                  <div className="text-[10px] text-text-faint">{c.d}</div>
                </div>
              </button>
            );
          })}
        </Card>
        <div className="space-y-3">
          <Card className="text-center">
            <div className="text-[11px] text-text-dim">Due Diligence Score</div>
            <div className="font-mono text-5xl font-extrabold leading-none" style={{ color: sc }}>
              {score}
              <span className="text-xl text-text-dim">/5</span>
            </div>
            <div className="mt-2 text-xs font-semibold" style={{ color: sc }}>
              {score >= 4 ? "✅ Proceed — Strong DD" : score >= 3 ? "⚠️ Caution — Review Issues" : "🚨 Red Flag — Do Not Proceed"}
            </div>
          </Card>
          <Card>
            <CardTitle>
              <span className="inline-block h-3 w-[3px] rounded-sm bg-primary" /> ⚠️ Risk Register
            </CardTitle>
            {[
              { l: "Regulatory Risk", v: pass >= 4 ? "Low" : "Medium", c: pass >= 4 ? S.green : S.amber },
              { l: "Environmental Risk", v: params.amdal ? "Low" : "High", c: params.amdal ? S.green : S.red },
              { l: "Title Risk", v: params.certClean ? "Low" : "High", c: params.certClean ? S.green : S.red },
              { l: "Market Risk", v: "Medium", c: S.amber },
              { l: "Operational Risk", v: "Low", c: S.green },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between border-b border-border py-1.5 text-xs">
                <span className="text-text-muted">{r.l}</span>
                <span className="rounded px-2.5 py-0.5 text-[11px] font-bold" style={{ color: r.c, background: `${r.c}15` }}>
                  {r.v}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  return <div className="text-sm text-text-muted">Unknown module</div>;
}
