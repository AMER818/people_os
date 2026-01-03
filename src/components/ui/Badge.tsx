import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border text-[0.5rem] font-black px-2 py-0.5 uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Semantic variants
        primary: "bg-primary-soft text-primary border-primary/20",
        success: "bg-success-soft text-success border-success/20",
        danger: "bg-danger-soft text-danger border-danger/20",
        warning: "bg-warning-soft text-warning border-warning/20",
        info: "bg-info-soft text-info border-info/20",
        secondary: "bg-elevated text-text-secondary border-border",
        destructive: "bg-danger-soft text-danger border-danger/20",

        // Legacy mappings (for backward compatibility)
        blue: "bg-primary-soft text-primary border-primary/20",
        emerald: "bg-success-soft text-success border-success/20",
        rose: "bg-danger-soft text-danger border-danger/20",
        amber: "bg-warning-soft text-warning border-warning/20",
        slate: "bg-elevated text-text-secondary border-border",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span aria-label={props['aria-label']} className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
