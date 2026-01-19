import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import Logger from '@/utils/logger';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  action?: ToastAction;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: Toast[];
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, options: ToastOptions = {}) => {
    const id = Math.random().toString(36).substring(7);
    const duration = options.duration ?? 5000;

    const toast: Toast = {
      id,
      type,
      message,
      duration,
      action: options.action,
    };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast('success', message, options);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast('error', message, options);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast('warning', message, options);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast('info', message, options);
    },
    [addToast]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      textColor: 'text-success',
      iconBg: 'bg-success/20',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger/20',
      textColor: 'text-danger',
      iconBg: 'bg-danger/20',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      textColor: 'text-warning',
      iconBg: 'bg-warning/20',
    },
    info: {
      icon: Info,
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      textColor: 'text-primary',
      iconBg: 'bg-primary/20',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-200 flex items-start gap-3`}
      role="alert"
    >
      <div className={`${config.iconBg} p-2 rounded-lg`}>
        <Icon size={20} className={config.textColor} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              onDismiss(toast.id);
            }}
            className={`mt-2 text-xs font-bold ${config.textColor} hover:underline`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-muted-bg rounded transition-colors text-text-muted hover:text-text-primary"
        aria-label="Dismiss toast"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/**
 * Hook to access toast functions
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Global toast instance for use outside React components
let globalToastContext: ToastContextValue | null = null;

export function setGlobalToastContext(context: ToastContextValue) {
  globalToastContext = context;
}

// Standalone toast functions for use outside React components
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    if (globalToastContext) {
      globalToastContext.success(message, options);
    } else {
      console.warn('Toast called before ToastProvider mounted');
      alert(message); // Fallback to alert
    }
  },
  error: (message: string, options?: ToastOptions) => {
    if (globalToastContext) {
      globalToastContext.error(message, options);
    } else {
      console.error('Toast called before ToastProvider mounted');
      alert(message);
    }
  },
  warning: (message: string, options?: ToastOptions) => {
    if (globalToastContext) {
      globalToastContext.warning(message, options);
    } else {
      console.warn('Toast called before ToastProvider mounted');
      alert(message);
    }
  },
  info: (message: string, options?: ToastOptions) => {
    if (globalToastContext) {
      globalToastContext.info(message, options);
    } else {
      Logger.info('Toast called before ToastProvider mounted');
      alert(message);
    }
  },
};
