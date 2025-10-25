import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-t-brand-blue-500 border-r-brand-blue-300 border-b-brand-blue-200 border-l-brand-blue-100 rounded-full animate-spin"></div>
      <div
        className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-brand-blue-400 rounded-full animate-spin"
        style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
      ></div>
    </div>
  </div>
);