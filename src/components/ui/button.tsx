import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none relative',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
        secondary: 'bg-transparent border border-border text-text-primary hover:bg-elevated',
        outline: 'bg-transparent border border-border text-text-primary hover:bg-elevated',
        ghost: 'bg-transparent text-text-secondary hover:text-primary hover:bg-elevated',
        danger: 'bg-danger text-white hover:opacity-90 shadow-sm',
      },
      size: {
        sm: 'px-4 py-2 text-[0.5625rem] rounded-sm',
        md: 'px-6 py-2.5 text-[0.625rem] rounded-md',
        lg: 'px-8 py-3.5 text-[0.75rem] rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  icon?: React.ElementType;
  isLoading?: boolean;
}

export function Button({
  children,
  variant,
  size,
  icon: Icon,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      aria-label={props['aria-label']}
      {...props}
    >
      {isLoading && <RefreshCw className="animate-spin" size={size === 'sm' ? 12 : 14} />}
      {!isLoading && Icon && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />}
      {children}
    </button>
  );
}
