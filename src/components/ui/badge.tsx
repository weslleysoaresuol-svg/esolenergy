import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        sun: "border-amber-400/40 bg-amber-400/15 text-amber-500 font-bold shadow-sm glow-amber dark:bg-amber-400/20 dark:text-amber-300",
        emerald: "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 font-bold shadow-sm glow-emerald dark:bg-emerald-500/20 dark:text-emerald-400",
        cyan: "border-cyan-500/40 bg-cyan-500/15 text-cyan-600 font-bold shadow-sm glow-cyan dark:bg-cyan-500/20 dark:text-cyan-300",
        rose: "border-rose-500/40 bg-rose-500/15 text-rose-600 font-bold shadow-sm dark:bg-rose-500/20 dark:text-rose-400",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "border-border/80 text-foreground backdrop-blur-sm bg-background/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
