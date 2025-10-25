import React from 'react';
import { LeagueKey, Team } from '../types';

interface LeagueSelectorProps {
  selectedLeague: LeagueKey | '';
  onLeagueChange: (league: LeagueKey | '') => void;
  selectedTeamId: string;
  onTeamChange: (teamId: string) => void;
  teams: Team[];
  isLoadingTeams: boolean;
}

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  selectedLeague,
  onLeagueChange,
  selectedTeamId,
  onTeamChange,
  teams,
  isLoadingTeams,
}) => {
  return (
    <div className="mb-12 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="league-select"
              className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"
            >
              <span className="w-6 h-6 bg-brand-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              Select League
            </label>
            <select
              id="league-select"
              value={selectedLeague}
              onChange={(e) => onLeagueChange(e.target.value as LeagueKey | '')}
              className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-base rounded-xl focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent p-3.5 shadow-sm transition-all duration-200 hover:border-brand-blue-300 cursor-pointer"
            >
              <option value="">Choose a league...</option>
              <option value="nba">🏀 NBA</option>
              <option value="nfl">🏈 NFL</option>
              <option value="nhl">🏒 NHL</option>
              <option value="mlb">⚾ MLB</option>
              <option value="ncaam">🎓 NCAAM</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="team-select"
              className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"
            >
              <span className="w-6 h-6 bg-brand-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              Select Team
            </label>
            <select
              id="team-select"
              value={selectedTeamId}
              onChange={(e) => onTeamChange(e.target.value)}
              disabled={!selectedLeague || isLoadingTeams}
              className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-base rounded-xl focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent p-3.5 shadow-sm transition-all duration-200 hover:border-brand-blue-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingTeams
                  ? 'Loading teams...'
                  : selectedLeague
                  ? 'Choose a team...'
                  : 'Select league first'}
              </option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};