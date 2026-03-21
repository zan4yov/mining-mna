import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[3px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[1.2px]",
  {
    variants: {
      variant: {
        default: "border-primary-border bg-primary-bg text-primary",
        success: "border-success-border bg-success-bg text-success",
        warn: "border-warning-border bg-warning-bg text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
