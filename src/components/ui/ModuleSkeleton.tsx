import React from 'react';

const ModuleSkeleton: React.FC = () => {
    return (
        <div role="status" aria-label="Loading content..." className="h-full w-full bg-app p-6 md:p-10 animate-pulse">
            <div className="max-w-[106.25rem] mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-3">
                        <div className="h-8 w-64 bg-surface rounded-lg opacity-40"></div>
                        <div className="h-4 w-48 bg-surface rounded-lg opacity-20"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 w-32 bg-surface rounded-xl opacity-30"></div>
                        <div className="h-10 w-10 bg-surface rounded-xl opacity-30"></div>
                    </div>
                </div>

                {/* Main Content Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="h-[25rem] w-full bg-surface rounded-3xl opacity-20"></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="h-[12.5rem] bg-surface rounded-3xl opacity-10"></div>
                            <div className="h-[12.5rem] bg-surface rounded-3xl opacity-10"></div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-[15.625rem] bg-surface rounded-3xl opacity-20 border border-border/10"></div>
                        <div className="h-[21.875rem] bg-surface rounded-3xl opacity-15 border border-border/10"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleSkeleton;
