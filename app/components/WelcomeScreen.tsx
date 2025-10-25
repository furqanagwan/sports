import React from 'react';
import { TrendingUp } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-blue-500 to-brand-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome to Sports Hub
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select a league above to get started and explore your favorite teams!
        </p>
      </div>
    </div>
  );
};