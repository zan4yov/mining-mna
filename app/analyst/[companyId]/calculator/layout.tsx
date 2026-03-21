import { CalculatorProvider } from "@/components/analyst/calculator-context";
import { CalculatorChrome } from "@/components/analyst/CalculatorChrome";

export default function CalculatorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { companyId: string };
}) {
  return (
    <CalculatorProvider companyId={params.companyId}>
      <CalculatorChrome>{children}</CalculatorChrome>
    </CalculatorProvider>
  );
}
