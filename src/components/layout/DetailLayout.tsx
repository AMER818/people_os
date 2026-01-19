import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DetailLayoutProps {
  header: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  containerClassName?: string;
}

/**
 * Standardized Layout for Detail Views (e.g., Employee Master).
 * Features:
 * - Transparent wrapper (no grey background)
 * - Sticky Header capability (if configured)
 * - Tabs navigation
 * - Scrollable content area with standard padding
 */
export const DetailLayout: React.FC<DetailLayoutProps> = ({
  header,
  tabs,
  children,
  className,
  contentClassName,
  containerClassName,
}) => {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden min-h-[calc(100vh-8rem)] flex flex-col bg-transparent',
        className
      )}
    >
      {header}

      <div className="flex flex-col flex-1 overflow-hidden">
        {tabs}
        <main
          role="main"
          className={cn(
            'flex-1 p-8 lg:p-12 overflow-y-auto bg-app custom-scrollbar',
            contentClassName
          )}
        >
          <div className={cn('max-w-7xl mx-auto', containerClassName)}>{children}</div>
        </main>
      </div>
    </div>
  );
};
