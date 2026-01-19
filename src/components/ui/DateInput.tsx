import React, { useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { formatDate, parseDisplayDateToISO } from '@/utils/formatting';
import { Calendar } from 'lucide-react';

const inputVariants = cva(
  'w-full bg-surface border border-border rounded-xl py-3.5 text-[0.8rem] font-black transition-all text-text-primary placeholder:text-text-muted outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5',
  {
    variants: {
      hasIcon: {
        true: 'pl-12 pr-4',
        false: 'px-4',
      },
      hasError: {
        true: 'border-danger/50',
        false: 'border-border/40',
      },
    },
    defaultVariants: {
      hasIcon: false,
      hasError: false,
    },
  }
);

export interface DateInputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'>,
    Omit<VariantProps<typeof inputVariants>, 'hasIcon' | 'hasError'> {
  label?: string;
  value: string; // Expects ISO YYYY-MM-DD
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function DateInput({
  label,
  value,
  onChange,
  error,
  className,
  onBlur,
  ...props
}: DateInputProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const generatedId = React.useId();
  const inputId = props.id || generatedId;

  // Local state for the text input to allow "natural typing"
  const [textValue, setTextValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  // Sync text value with prop value when not typing
  React.useEffect(() => {
    if (!isTyping) {
      setTextValue(value ? formatDate(value) : '');
    }
  }, [value, isTyping]);

  // Handle visible text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    setTextValue(e.target.value);
  };

  // Helper to commit changes
  const commitDate = (isoDate: string) => {
    // 1. Update Parent
    // Create a synthetic event
    const syntheticEvent = {
      target: { value: isoDate },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);

    // 2. Update Local Display (Auto-Capitalize / Format)
    setTextValue(formatDate(isoDate));
    setIsTyping(false);
  };

  // Validation Logic
  const validateAndCommit = () => {
    const isoDate = parseDisplayDateToISO(textValue);

    if (isoDate) {
      // Valid Format: 15-dec-2024 -> Commit it (Auto-capitalizes)
      commitDate(isoDate);
      return true;
    } else if (textValue.trim() === '') {
      // Empty: Clear it
      const syntheticEvent = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
      setIsTyping(false);
      // Empty field + Tab -> "Calendar popup opens" per requirements
      dateInputRef.current?.showPicker();
      return false;
    } else {
      // Invalid Format -> "Calendar popup opens"
      dateInputRef.current?.showPicker();
      return false;
    }
  };

  // Handle Tab Key specifically for validation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const isValid = validateAndCommit();
      if (!isValid) {
        // Prevent default tab navigation to keep focus if desired,
        // OR allow navigation but ensuring the picker opens.
        // Opening picker typically takes focus, so preventing default Tab is safer
        // if we want to force the user to correct it via the picker.
        e.preventDefault();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      validateAndCommit();
    }
  };

  // Handle Blur (Clicking away)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const isoDate = parseDisplayDateToISO(textValue);
    if (isoDate) {
      commitDate(isoDate);
    } else if (textValue.trim() === '') {
      const syntheticEvent = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
      setIsTyping(false);
    } else {
      // Invalid text on blur. Revert to previous valid prop value
      setTextValue(value ? formatDate(value) : '');
      setIsTyping(false);
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleIconClick = () => {
    dateInputRef.current?.showPicker();
  };

  // Native Date Input Change (from Picker)
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    commitDate(e.target.value);
  };

  return (
    <div className={cn('space-y-2 w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer z-10"
          onClick={handleIconClick}
          role="button"
          tabIndex={0}
          aria-label="Open calendar"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleIconClick();
            }
          }}
        >
          <Calendar className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </div>

        {/* Visible Text Input: Editable, validates on Tab */}
        <input
          id={inputId}
          type="text"
          className={cn(
            inputVariants({ hasIcon: true, hasError: !!error, className }),
            'pl-12 uppercase' // Visual uppercase, but we handle capitalization logic too
          )}
          value={textValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="DD-MMM-YYYY"
          {...props}
        />

        {/* Hidden Native Input: Handles the picker */}
        <input
          ref={dateInputRef}
          type="date"
          className="sr-only"
          value={value}
          onChange={handleNativeChange}
          tabIndex={-1}
          style={{ colorScheme: 'dark' }}
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-danger text-[0.6875rem] font-bold px-2">{error}</p>}
    </div>
  );
}

export default DateInput;
