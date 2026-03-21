"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { defaultSnapshotParams, type SnapshotParams } from "@/lib/validations";
import { calcNPV } from "@/lib/calculations";
import type { RouterOutputs } from "@/lib/trpc-types";

type Company = NonNullable<RouterOutputs["company"]["get"]>;

type Ctx = {
  companyId: string;
  company: Company | null | undefined;
  params: SnapshotParams;
  setParams: React.Dispatch<React.SetStateAction<SnapshotParams>>;
  npv: number;
  refetch: () => void;
  saveMsg: string;
  saveSnapshot: () => Promise<void>;
  saving: boolean;
};

const CalculatorContext = createContext<Ctx | null>(null);

export function CalculatorProvider({
  companyId,
  children,
}: {
  companyId: string;
  children: React.ReactNode;
}) {
  const q = trpc.company.get.useQuery({ id: companyId });
  const [params, setParams] = useState<SnapshotParams>(defaultSnapshotParams);
  const [saveMsg, setSaveMsg] = useState("");
  const saveMut = trpc.snapshot.save.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!q.data) return;
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const raw = sp.get("prefill");
      if (raw) {
        try {
          const patch = JSON.parse(raw) as Partial<import("@/lib/validations").SnapshotParams>;
          setParams((p) => ({ ...p, ...patch }));
          window.history.replaceState({}, "", window.location.pathname);
          return;
        } catch {
          /* fall through */
        }
      }
    }
    const snap = q.data.snapshots[0];
    if (snap && "params" in snap && snap.params) {
      setParams(snap.params);
    }
  }, [q.data]);

  const npv = useMemo(() => calcNPV(params), [params]);

  const saveSnapshot = useCallback(async () => {
    await saveMut.mutateAsync({ companyId, params });
    setSaveMsg("✓ Snapshot saved!");
    setTimeout(() => setSaveMsg(""), 3000);
    await utils.company.get.invalidate({ id: companyId });
    await utils.company.list.invalidate();
  }, [companyId, params, saveMut, utils.company.get, utils.company.list]);

  const value: Ctx = {
    companyId,
    company: q.data,
    params,
    setParams,
    npv,
    refetch: () => void q.refetch(),
    saveMsg,
    saveSnapshot,
    saving: saveMut.isPending,
  };

  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
}

export function useCalculator() {
  const v = useContext(CalculatorContext);
  if (!v) throw new Error("useCalculator must be used within CalculatorProvider");
  return v;
}
