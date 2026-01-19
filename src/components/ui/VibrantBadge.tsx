import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wider',
  {
    variants: {
      variant: {
        default:
          'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-sm shadow-primary/10',
        secondary:
          'bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20',
        outline: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
        // Vibrant Variants
        blue: 'bg-vibrant-blue/10 text-vibrant-blue hover:bg-vibrant-blue/20 border border-vibrant-blue/20 shadow-[0_0_10px_-3px_var(--vibrant-blue)]',
        pink: 'bg-vibrant-pink/10 text-vibrant-pink hover:bg-vibrant-pink/20 border border-vibrant-pink/20 shadow-[0_0_10px_-3px_var(--vibrant-pink)]',
        purple:
          'bg-vibrant-purple/10 text-vibrant-purple hover:bg-vibrant-purple/20 border border-vibrant-purple/20 shadow-[0_0_10px_-3px_var(--vibrant-purple)]',
        orange:
          'bg-vibrant-orange/10 text-vibrant-orange hover:bg-vibrant-orange/20 border border-vibrant-orange/20 shadow-[0_0_10px_-3px_var(--vibrant-orange)]',
        cyan: 'bg-vibrant-cyan/10 text-vibrant-cyan hover:bg-vibrant-cyan/20 border border-vibrant-cyan/20 shadow-[0_0_10px_-3px_var(--vibrant-cyan)]',
        green:
          'bg-vibrant-green/10 text-vibrant-green hover:bg-vibrant-green/20 border border-vibrant-green/20 shadow-[0_0_10px_-3px_var(--vibrant-green)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  color?: 'blue' | 'pink' | 'purple' | 'orange' | 'cyan' | 'green';
}

const COLOR_MAP: Record<string, BadgeProps['variant']> = {
  // Departments
  Engineering: 'blue',
  Design: 'pink',
  Marketing: 'purple',
  Sales: 'orange',
  Finance: 'cyan',
  HR: 'green',

  // Statuses
  Active: 'green',
  Inactive: 'secondary',
  Terminated: 'destructive',
  'On Leave': 'orange',
  Pending: 'orange',
  Approved: 'green',
  Rejected: 'destructive',
  Deployed: 'green',
  Maintenance: 'orange',
  Retired: 'destructive',
};

function VibrantBadge({ className, variant, color, children, ...props }: BadgeProps) {
  // Auto-detect color from children if not specified
  let finalVariant = variant;

  if (!variant && !color && typeof children === 'string') {
    // Try to match exact string first
    if (COLOR_MAP[children]) {
      finalVariant = COLOR_MAP[children];
    } else {
      // Fallback logic or default
      finalVariant = 'default';
    }
  }

  if (color) {
    finalVariant = color;
  }

  return (
    <div
      className={cn(badgeVariants({ variant: finalVariant }), className)}
      {...props}
      aria-label={typeof children === 'string' ? children : 'Badge'}
    >
      {children}
    </div>
  );
}

export { VibrantBadge, badgeVariants };
