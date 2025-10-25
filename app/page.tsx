'use client';

import React, { useState, useEffect } from 'react';
import { LeagueKey, TabKey, Team, TeamData, TeamApiResponse, RosterApiResponse, ScheduleApiResponse, NewsApiResponse, Player } from './types';
import { LEAGUE_CONFIG } from './constants';
import { fetchWithRetry } from './utils/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LeagueSelector } from './components/LeagueSelector';
import { TeamDashboard } from './components//TeamDashboard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorModal } from './components/ErrorModal';

export default function App() {
  const [selectedLeague, setSelectedLeague] = useState<LeagueKey | ''>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const [teamData, setTeamData] = useState<TeamData>({
    team: null,
    roster: [],
    schedule: [],
    news: [],
  });

  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('roster');

  // Effect for Fetching Teams
  useEffect(() => {
    if (!selectedLeague) {
      setTeams([]);
      setSelectedTeamId('');
      setTeamData({ team: null, roster: [], schedule: [], news: [] });
      return;
    }

    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      setError(null);
      setTeams([]);
      setSelectedTeamId('');
      setTeamData({ team: null, roster: [], schedule: [], news: [] });

      try {
        const { sport, league } = LEAGUE_CONFIG[selectedLeague];
        const limitParam = selectedLeague === 'ncaam' ? '?limit=1000' : '';
        const TEAMS_URL = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams${limitParam}`;

        const data = await fetchWithRetry<TeamApiResponse>(TEAMS_URL);

        if (!data.sports?.[0]?.leagues?.[0]?.teams) {
          throw new Error('Invalid API response structure for teams.');
        }

        let fetchedTeams: Team[] = [];
        const teamData = data.sports[0].leagues[0].teams;

        if (selectedLeague === 'ncaam') {
          (teamData as { teams: { team: Team }[] }[]).forEach((conference) => {
            if (conference.teams && Array.isArray(conference.teams)) {
              conference.teams.forEach((teamEntry) => {
                if (teamEntry.team) fetchedTeams.push(teamEntry.team);
              });
            }
          });
        } else {
          fetchedTeams = (teamData as { team: Team }[]).map(
            (entry) => entry.team
          );
        }

        fetchedTeams.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );
        setTeams(fetchedTeams);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        setError(`Failed to load ${selectedLeague.toUpperCase()} teams.`);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [selectedLeague]);

  // Effect for Fetching Team Dashboard Data
  useEffect(() => {
    if (!selectedTeamId || !selectedLeague) {
      setTeamData({ team: null, roster: [], schedule: [], news: [] });
      return;
    }

    const fetchTeamData = async () => {
      setIsLoadingDashboard(true);
      setError(null);
      setActiveTab('roster');

      try {
        const team = teams.find((t) => t.id === selectedTeamId) || null;
        const { sport, league } = LEAGUE_CONFIG[selectedLeague];

        const ROSTER_URL = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${selectedTeamId}/roster`;
        const SCHEDULE_URL = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${selectedTeamId}/schedule`;
        const NEWS_URL = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news?team=${selectedTeamId}`;

        const [rosterResult, scheduleResult, newsResult] =
          await Promise.allSettled([
            fetchWithRetry<RosterApiResponse>(ROSTER_URL),
            fetchWithRetry<ScheduleApiResponse>(SCHEDULE_URL),
            fetchWithRetry<NewsApiResponse>(NEWS_URL),
          ]);

        let roster: Player[] = [];
        if (rosterResult.status === 'fulfilled') {
          const data = rosterResult.value;
          const rosterData = data.athletes || data.roster;
          if (rosterData && rosterData.length > 0) {
            if ((rosterData[0] as { items: Player[] }).items) {
              roster = (rosterData as { items: Player[] }[]).flatMap(
                (group) => group.items || []
              );
              roster.sort((a, b) =>
                (a.fullName || '').localeCompare(b.fullName || '')
              );
            } else {
              roster = rosterData as Player[];
            }
          }
        } else {
          console.error('Roster Error:', rosterResult.reason);
        }

        const schedule =
          scheduleResult.status === 'fulfilled'
            ? scheduleResult.value.events
            : [];
        if (scheduleResult.status === 'rejected') {
          console.error('Schedule Error:', scheduleResult.reason);
        }

        const news =
          newsResult.status === 'fulfilled' ? newsResult.value.articles : [];
        if (newsResult.status === 'rejected') {
          console.error('News Error:', newsResult.reason);
        }

        setTeamData({ team, roster, schedule, news });
      } catch (err) {
        console.error('Failed to fetch team data:', err);
        setError('Failed to load team dashboard data.');
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchTeamData();
  }, [selectedTeamId, selectedLeague, teams]);

  return (
    <div className="font-sans bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <Header />

      <main className="container mx-auto p-6 md:p-10 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
            Your Sports Dashboard
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore teams, rosters, schedules, and breaking news
          </p>
        </div>

        <LeagueSelector
          selectedLeague={selectedLeague}
          onLeagueChange={setSelectedLeague}
          selectedTeamId={selectedTeamId}
          onTeamChange={setSelectedTeamId}
          teams={teams}
          isLoadingTeams={isLoadingTeams}
        />

        {selectedTeamId && teamData.team && (
          <TeamDashboard
            teamData={teamData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isLoading={isLoadingDashboard}
            selectedLeague={selectedLeague}
          />
        )}

        {isLoadingTeams && !selectedTeamId && (
          <div className="mt-12">
            <LoadingSpinner />
          </div>
        )}

        {error && <ErrorModal message={error} onClose={() => setError(null)} />}

        {!selectedLeague && <WelcomeScreen />}
      </main>

      <Footer />
    </div>
  );
}