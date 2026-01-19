import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabNode {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface HorizontalTabsProps {
  tabs: TabNode[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  className?: string;
  wrap?: boolean;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
}

/**
 * Standardized Horizontal Capsule Tabs
 * follows "Modern, Stylish, Centralized, Theme Aware" design.
 */
export const HorizontalTabs: React.FC<HorizontalTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
  wrap = false,
  disabled = false,
  align = 'center',
}) => {
  const alignClass =
    align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-center';

  return (
    <div className={`w-full flex ${alignClass} mb-10 ${className}`}>
      <div
        role="tablist"
        aria-label="Content Navigation"
        className={`
                bg-surface/30 backdrop-blur-md border border-border/50 p-1.5 rounded-[2rem] flex items-center gap-1 shadow-2xl max-w-full
                ${wrap ? `flex-wrap ${alignClass}` : 'overflow-x-auto no-scrollbar flex-nowrap'}
            `}
      >
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && onTabChange(tab.id)}
              disabled={disabled}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              aria-disabled={disabled}
              className={`
                flex items-center gap-3 px-8 py-3 rounded-[1.5rem] transition-all duration-500 group whitespace-nowrap
                ${
                  isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.05] z-10'
                    : 'text-text-muted hover:text-text-primary hover:bg-muted-bg/50'
                }
                ${disabled ? 'opacity-80 cursor-not-allowed pointer-events-none grayscale' : ''}
              `}
            >
              {tab.icon && (
                <tab.icon
                  size={16}
                  className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
              )}
              <span className="text-[0.6875rem] font-black uppercase tracking-[0.2em] antialiased">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
