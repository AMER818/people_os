import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full bg-elevated border border-border rounded-md py-3 text-[0.75rem] outline-none font-bold transition-all text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:bg-surface',
  {
    variants: {
      hasIcon: {
        true: 'pl-12 pr-6',
        false: 'px-6',
      },
      hasError: {
        true: 'border-danger/50',
        false: '',
      },
    },
    defaultVariants: {
      hasIcon: false,
      hasError: false,
    },
  }
);

export interface InputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    Omit<VariantProps<typeof inputVariants>, 'hasIcon' | 'hasError'> {
  label?: string;
  icon?: React.ElementType;
  error?: string;
}

export function Input({ label, icon: Icon, error, className, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = props.id || generatedId;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
        )}
        <input
          id={inputId}
          className={cn(inputVariants({ hasIcon: !!Icon, hasError: !!error, className }))}
          aria-label={props['aria-label'] || label || 'Input field'}
          {...props}
        />
      </div>
      {error && <p className="text-danger text-[0.6875rem] font-bold px-2">{error}</p>}
    </div>
  );
}

// Default export for test compatibility
export default Input;
