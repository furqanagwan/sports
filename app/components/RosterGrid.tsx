import React from 'react';
import { Users } from 'lucide-react';
import { Player, PlayerHeadshot } from '../types';

interface RosterGridProps {
  players: Player[];
}

export const RosterGrid: React.FC<RosterGridProps> = ({ players }) => {
  if (players.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No players found for this roster.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {players.map((player) => {
        let headshotUrl = 'https://placehold.co/160x160/e2e8f0/94a3b8?text=??';
        if (player.headshot) {
          if (typeof player.headshot === 'string' && player.headshot.length > 0)
            headshotUrl = player.headshot;
          else if ((player.headshot as PlayerHeadshot).href)
            headshotUrl = (player.headshot as PlayerHeadshot).href;
        }

        return (
          <div
            key={player.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
          >
            <div className="relative inline-block mb-4">
              <img
                src={headshotUrl}
                alt={player.fullName}
                className="w-28 h-28 rounded-2xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 object-cover ring-4 ring-gray-100 dark:ring-gray-700 group-hover:ring-brand-blue-500 transition-all duration-300"
                onError={(e) =>
                  (e.currentTarget.src =
                    'https://placehold.co/160x160/e2e8f0/94a3b8?text=??')
                }
              />
              <div className="absolute -bottom-2 -right-2 bg-brand-blue-500 text-white text-xs font-bold rounded-lg px-2 py-1 shadow-lg">
                #{player.jersey || '?'}
              </div>
            </div>
            <h3
              className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-brand-blue-500 transition-colors"
              title={player.fullName}
            >
              {player.fullName}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {player.position?.abbreviation || 'N/A'}
            </p>
          </div>
        );
      })}
    </div>
  );
};