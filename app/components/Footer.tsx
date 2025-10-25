import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Powered by ESPN API • Built with Next.js & Tailwind CSS
        </p>
      </div>
    </footer>
  );
};