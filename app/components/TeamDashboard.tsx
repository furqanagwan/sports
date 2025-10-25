import React from 'react';
import { Users, Calendar, Newspaper } from 'lucide-react';
import { TeamData, TabKey, LeagueKey } from '../types';
import { RosterGrid } from './RosterGrid';
import { ScheduleList } from './ScheduleList';
import { NewsGrid } from './NewsGrid';
import { LoadingSpinner } from './LoadingSpinner';

interface TeamDashboardProps {
  teamData: TeamData;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  isLoading: boolean;
  selectedLeague: LeagueKey | '';
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({
  teamData,
  activeTab,
  onTabChange,
  isLoading,
  selectedLeague,
}) => {
  const tabIcons: Record<TabKey, React.ReactNode> = {
    roster: <Users className="w-5 h-5" />,
    schedule: <Calendar className="w-5 h-5" />,
    news: <Newspaper className="w-5 h-5" />,
  };

  if (!teamData.team) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <img
            src={
              teamData.team.logos?.[0]?.href ||
              'https://placehold.co/128x128/f1f5f9/94a3b8?text=Logo'
            }
            alt={`${teamData.team.displayName} Logo`}
            className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-5 rounded-3xl bg-white dark:bg-gray-800 p-4 shadow-2xl object-contain ring-4 ring-white dark:ring-gray-700"
            onError={(e) =>
              (e.currentTarget.src =
                'https://placehold.co/128x128/f1f5f9/94a3b8?text=Logo')
            }
          />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
          {teamData.team.displayName}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {selectedLeague.toUpperCase()}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <nav
          className="flex border-b border-gray-200 dark:border-gray-700"
          aria-label="Tabs"
        >
          {(['roster', 'schedule', 'news'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-5 px-4 font-bold text-sm capitalize transition-all duration-200 relative
                ${
                  activeTab === tab
                    ? 'text-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
            >
              {tabIcons[tab]}
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-600"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeTab === 'roster' && <RosterGrid players={teamData.roster} />}
              {activeTab === 'schedule' && (
                <ScheduleList events={teamData.schedule} />
              )}
              {activeTab === 'news' && <NewsGrid articles={teamData.news} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};