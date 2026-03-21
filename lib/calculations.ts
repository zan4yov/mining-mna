import type { SnapshotParams } from "@/lib/validations";

/** Source of truth — matches CURSOR_CONTEXT.md / mining_mna_stage2.jsx */
export function calcNPV(p: SnapshotParams): number {
  const revenue = p.coalPrice * p.annualProd;
  const opex = p.cashCost * p.annualProd;
  const royalty = revenue * (p.royaltyRate / 100);
  const ebitda = revenue - opex - royalty;
  const dep = p.capex / p.mineLife;
  const ebit = ebitda - dep;
  const tax = Math.max(ebit * (p.taxRate / 100), 0);
  const fcf = ebit - tax + dep;

  let npv = -p.capex;
  for (let y = 1; y <= p.mineLife; y++) {
    npv += fcf / Math.pow(1 + p.discRate / 100, y);
  }
  return Math.round(npv);
}

export function calcCashCost(p: Pick<SnapshotParams, "haulingDist" | "bargeDist" | "crushCost" | "portHandling">): number {
  const hauling = p.haulingDist * 0.4;
  const barge = p.bargeDist * 0.08;
  const crush = p.crushCost;
  const port = p.portHandling;
  return parseFloat((hauling + barge + crush + port).toFixed(2));
}

export function calcRecommendation(npv: number): "proceed" | "monitor" | "avoid" {
  if (npv > 800) return "proceed";
  if (npv > 400) return "monitor";
  return "avoid";
}

export function computeSnapshotOutputs(p: SnapshotParams) {
  const npv = calcNPV(p);
  const revenue = p.coalPrice * p.annualProd;
  const opex = p.cashCost * p.annualProd;
  const royalty = revenue * (p.royaltyRate / 100);
  const ebitda = revenue - opex - royalty;
  const dep = p.capex / p.mineLife;
  const ebit = ebitda - dep;
  const tax = Math.max(ebit * (p.taxRate / 100), 0);
  const fcf = ebit - tax + dep;

  const irr = parseFloat(((npv / Math.max(p.capex, 1)) * 8 + 12).toFixed(1));
  const payback = parseFloat((p.capex / Math.max(fcf, 0.01)).toFixed(1));
  const bearNpv = Math.round(npv * 0.65);
  const bullNpv = Math.round(npv * 1.35);
  const synergy = Math.round(Math.abs(npv) * 0.025);
  const checks = [p.iupValid, p.certClean, p.amdal, p.ppa, p.dmb];
  const pass = checks.filter(Boolean).length;
  const ddScore = parseFloat(((pass / checks.length) * 5).toFixed(1));

  return {
    npv,
    irr,
    payback,
    bearNpv,
    bullNpv,
    ddScore,
    synergy,
    recommendation: calcRecommendation(npv),
  };
}
