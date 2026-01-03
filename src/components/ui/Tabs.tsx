import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

export interface Tab {
    id: string;
    label: string;
    icon?: LucideIcon;
}

const tabsContainerVariants = cva(
    "flex p-1 rounded-2xl border w-fit backdrop-blur-md overflow-x-auto max-w-full",
    {
        variants: {
            variant: {
                default: "bg-muted-bg/50 border-border/50",
                elevated: "bg-surface border-border shadow-sm",
                glass: "bg-surface/30 border-text-primary/10",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const tabTriggerVariants = cva(
    "group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
    {
        variants: {
            state: {
                active: "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]",
                inactive: "text-text-muted hover:text-text-primary hover:bg-surface/50",
            },
        },
        defaultVariants: {
            state: "inactive",
        },
    }
);

export interface TabsProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsContainerVariants> {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ tabs, activeTab, onTabChange, className, variant, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(tabsContainerVariants({ variant }), className)}
                role="tablist"
                {...props}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            role="tab"
                            aria-selected={isActive}
                            aria-label={tab.label}
                            className={cn(
                                tabTriggerVariants({ state: isActive ? "active" : "inactive" })
                            )}
                        >
                            {tab.icon && (
                                <tab.icon
                                    size={14}
                                    className={cn(
                                        "transition-all duration-300",
                                        isActive
                                            ? "text-white"
                                            : "text-text-muted group-hover:text-text-primary"
                                    )}
                                />
                            )}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        );
    }
);
Tabs.displayName = "Tabs";

export { Tabs, tabsContainerVariants, tabTriggerVariants };
