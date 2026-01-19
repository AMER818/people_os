import React from 'react';

export const TabLoadingState: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse p-4" role="status" aria-label="Loading content">
      <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      <div className="space-y-3">
        <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  );
};
