"use client";

import { useParams } from "next/navigation";
import { AllModules } from "@/components/analyst/modules/AllModules";

export default function CalculatorModulePage() {
  const params = useParams();
  const mod = Math.min(9, Math.max(1, Number(params.module) || 1));
  return <AllModules module={mod} />;
}
