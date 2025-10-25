import React from 'react';
import { Calendar } from 'lucide-react';
import { ScheduleEvent } from '../types';

interface ScheduleListProps {
  events: ScheduleEvent[];
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No schedule data available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {events.map((event) => {
        const date = new Date(event.date).toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
        const status = event.competitions[0]?.status?.type?.detail || '';
        const scoreboardLink = event.links?.find((link) =>
          link.rel.includes('scoreboard')
        )?.href;

        return (
          <div
            key={event.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:border-brand-blue-500"
          >
            <div className="mb-3 sm:mb-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-brand-blue-500" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {date}
                </p>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-blue-500 transition-colors">
                {event.name}
              </h3>
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-600 dark:text-brand-blue-300">
                {status}
              </span>
            </div>
            {scoreboardLink && (
              <a
                href={scoreboardLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:from-brand-blue-600 hover:to-brand-blue-700 transition-all duration-200 text-sm text-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                View Game
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};