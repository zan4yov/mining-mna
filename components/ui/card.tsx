import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-[10px] border border-border bg-surface p-[18px] text-text-primary shadow-sm", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mb-3.5 flex items-center gap-2 border-b border-border-subtle pb-2.5 text-[10px] font-semibold uppercase tracking-[1.8px] text-text-dim",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export { Card, CardTitle };
