import React, { ReactNode } from 'react';
import { useLayout } from '@/contexts/LayoutContext';

interface ModuleLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean; // If no sidebar is present
}

/**
 * Standardized Layout for all Modules.
 * Provides consistent scrolling behavior:
 * - Fixed height viewport
 * - Independent scrolling for Sidebar
 * - Independent scrolling for Content
 */
export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  title,
  description,
  actions,
  sidebar,
  children,
  fullWidth = false,
}) => {
  const { metrics } = useLayout();

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 pb-0 relative overflow-hidden">
      {/* Header Section */}
      <div className="shrink-0 flex items-center justify-between px-1 pt-1">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-sm font-bold text-text-muted max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-4">{actions}</div>}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Sidebar Column */}
        {sidebar && (
          <div className="w-full lg:w-72 shrink-0 space-y-2 overflow-y-auto no-scrollbar overscroll-contain pb-10 pr-2">
            {sidebar}
          </div>
        )}

        {/* content Column */}
        <main
          className={`flex-1 bg-surface rounded-2xl border border-border ${metrics.contentPadding} shadow-sm flex flex-col overflow-hidden min-h-[25rem] ${fullWidth ? 'w-full' : ''}`}
          role="main"
          aria-label={`${title} content`}
        >
          <div className="h-full overflow-y-auto overscroll-contain pr-2 pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
};
