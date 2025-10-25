'use client'; // This directive is necessary for Next.js 13+ App Router to use hooks and event listeners

import React, { useState, useEffect } from 'react';

// --- Type Definitions ---
// These help make the code safer and easier to understand

type LeagueKey = 'nba' | 'nfl' | 'nhl' | 'mlb' | 'ncaam';
type TabKey = 'roster' | 'schedule' | 'news';

interface LeagueConfig {
    sport: string;
    league: string;
}

interface TeamLogo {
    href: string;
}

interface Team {
    id: string;
    displayName: string;
    logos: TeamLogo[];
}

interface PlayerPosition {
    abbreviation: string;
}

interface PlayerHeadshot {
    href: string;
}

interface Player {
    id: string;
    fullName: string;
    jersey?: string;
    position?: PlayerPosition;
    headshot?: PlayerHeadshot | string;
}

interface ScheduleEvent {
    id: string;
    date: string;
    name: string;
    competitions: {
        status: {
            type: {
                detail: string;
            };
        };
    }[];
    links: {
        rel: string[];
        href: string;
    }[];
}

interface NewsImage {
    url: string;
}

interface NewsArticle {
    id: string;
    headline: string;
    description?: string;
    images?: NewsImage[];
    links?: {
        web?: {
            href: string;
        };
    };
}

// API response types
interface TeamApiResponse {
    sports: {
        leagues: {
            teams: { team: Team }[] | { teams: { team: Team }[] }[]; // Pro vs College
        }[];
    }[];
}

interface RosterApiResponse {
    athletes?: Player[]; // NBA structure
    roster?: { items: Player[] }[]; // Other leagues grouped structure
}

interface ScheduleApiResponse {
    events: ScheduleEvent[];
}

interface NewsApiResponse {
    articles: NewsArticle[];
}

// --- API Configuration ---
const LEAGUE_CONFIG: Record<LeagueKey, LeagueConfig> = {
    'nba': { sport: 'basketball', league: 'nba' },
    'nfl': { sport: 'football', league: 'nfl' },
    'nhl': { sport: 'hockey', league: 'nhl' },
    'mlb': { sport: 'baseball', league: 'mlb' },
    'ncaam': { sport: 'basketball', league: 'mens-college-basketball' }
};

// --- Utility Function ---

/**
 * Fetches data from a URL with exponential backoff retry.
 */
async function fetchWithRetry<T>(url: string, retries = 3, delay = 1000): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json() as T;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed for ${url}. Retrying in ${delay}ms...`, error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error; // Rethrow after last attempt
            }
        }
    }
    // This line should not be reachable, but TypeScript needs a return path
    throw new Error('Failed to fetch data after multiple retries.');
}


// --- Main App Component ---

export default function App() {
    // --- State Definitions ---
    const [selectedLeague, setSelectedLeague] = useState<LeagueKey | ''>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    
    const [teamData, setTeamData] = useState<{ team: Team | null, roster: Player[], schedule: ScheduleEvent[], news: NewsArticle[] }>({
        team: null,
        roster: [],
        schedule: [],
        news: []
    });

    const [isLoadingTeams, setIsLoadingTeams] = useState(false);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('roster');

    // --- Effect for Fetching Teams ---
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
                const limitParam = (selectedLeague === 'ncaam') ? '?limit=1000' : '';
                const TEAMS_URL = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams${limitParam}`;
                
                const data = await fetchWithRetry<TeamApiResponse>(TEAMS_URL);

                if (!data.sports?.[0]?.leagues?.[0]?.teams) {
                    throw new Error('Invalid API response structure for teams.');
                }

                let fetchedTeams: Team[] = [];
                const teamData = data.sports[0].leagues[0].teams;

                if (selectedLeague === 'ncaam') {
                    // NCAAM teams are nested inside conference groups
                    (teamData as { teams: { team: Team }[] }[]).forEach(conference => {
                        if (conference.teams && Array.isArray(conference.teams)) {
                            conference.teams.forEach(teamEntry => {
                                if (teamEntry.team) fetchedTeams.push(teamEntry.team);
                            });
                        }
                    });
                } else {
                    // Pro leagues (NBA, NFL, NHL, MLB) are a flat list
                    fetchedTeams = (teamData as { team: Team }[]).map(entry => entry.team);
                }

                fetchedTeams.sort((a, b) => a.displayName.localeCompare(b.displayName));
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

    // --- Effect for Fetching Team Dashboard Data ---
    useEffect(() => {
        if (!selectedTeamId || !selectedLeague) {
            setTeamData({ team: null, roster: [], schedule: [], news: [] });
            return;
        }

        const fetchTeamData = async () => {
            setIsLoadingDashboard(true);
            setError(null);
            setActiveTab('roster'); // Default to roster tab on new selection

            try {
                const team = teams.find(t => t.id === selectedTeamId) || null;
                const { sport, league } = LEAGUE_CONFIG[selectedLeague];
                
                const ROSTER_URL = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${selectedTeamId}/roster`;
                const SCHEDULE_URL = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${selectedTeamId}/schedule`;
                const NEWS_URL = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news?team=${selectedTeamId}`;

                // Fetch all data in parallel
                const [rosterResult, scheduleResult, newsResult] = await Promise.allSettled([
                    fetchWithRetry<RosterApiResponse>(ROSTER_URL),
                    fetchWithRetry<ScheduleApiResponse>(SCHEDULE_URL),
                    fetchWithRetry<NewsApiResponse>(NEWS_URL)
                ]);

                // Process Roster
                let roster: Player[] = [];
                if (rosterResult.status === 'fulfilled') {
                    const data = rosterResult.value;
                    const rosterData = data.athletes || data.roster;
                    if (rosterData && rosterData.length > 0) {
                        if ((rosterData[0] as { items: Player[] }).items) { // Grouped list
                            roster = (rosterData as { items: Player[] }[]).flatMap(group => group.items || []);
                            roster.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
                        } else { // Flat list
                            roster = rosterData as Player[];
                        }
                    }
                } else {
                    console.error("Roster Error:", rosterResult.reason);
                }

                // Process Schedule
                const schedule = scheduleResult.status === 'fulfilled' ? scheduleResult.value.events : [];
                if (scheduleResult.status === 'rejected') {
                    console.error("Schedule Error:", scheduleResult.reason);
                }

                // Process News
                const news = newsResult.status === 'fulfilled' ? newsResult.value.articles : [];
                if (newsResult.status === 'rejected') {
                    console.error("News Error:", newsResult.reason);
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

    // --- Render ---
    return (
        <div className="bg-gray-900 text-white min-h-screen antialiased">
            <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                
                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Pro & College Sports Dashboard</h1>
                    <p className="text-lg text-gray-400">Select a league and team to see rosters, schedules, and news</p>
                </header>

                {/* Selectors */}
                <div className="mb-8 max-w-md mx-auto grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="league-select" className="block text-sm font-medium text-gray-300 mb-2">
                            1. Select League:
                        </label>
                        <select 
                            id="league-select" 
                            value={selectedLeague}
                            onChange={(e) => setSelectedLeague(e.target.value as LeagueKey | '')}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 p-3 shadow-lg appearance-none"
                        >
                            <option value="">-- Select a League --</option>
                            <option value="nba">NBA (Basketball)</option>
                            <option value="nfl">NFL (Football)</option>
                            <option value="nhl">NHL (Hockey)</option>
                            <option value="mlb">MLB (Baseball)</option>
                            <option value="ncaam">NCAAM (College Basketball)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="team-select" className="block text-sm font-medium text-gray-300 mb-2">
                            2. Select Team:
                        </label>
                        <select 
                            id="team-select" 
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            disabled={!selectedLeague || isLoadingTeams}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 p-3 shadow-lg appearance-none"
                        >
                            <option value="">
                                {isLoadingTeams ? 'Loading teams...' : (selectedLeague ? '-- Select a Team --' : '-- Select a League First --')}
                            </option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Team Dashboard */}
                {selectedTeamId && teamData.team && (
                    <div>
                        {/* Team Info Header */}
                        <div className="text-center mb-8">
                            <img 
                                src={teamData.team.logos?.[0]?.href || 'https://placehold.co/128x128/374151/FFFFFF?text=Logo'}
                                alt={`${teamData.team.displayName} Logo`}
                                className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-gray-800 p-2 shadow-lg object-contain"
                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/128x128/374151/FFFFFF?text=Logo')}
                            />
                            <h2 className="text-2xl md:text-3xl font-semibold">{teamData.team.displayName}</h2>
                        </div>

                        {/* Tab Buttons */}
                        <div className="border-b border-gray-700 mb-6">
                            <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
                                {(['roster', 'schedule', 'news'] as TabKey[]).map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`tab-btn whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? 'active' : ''}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Loading Spinner or Tab Content */}
                        {isLoadingDashboard ? (
                            <LoadingSpinner />
                        ) : (
                            <div>
                                {activeTab === 'roster' && <RosterGrid players={teamData.roster} />}
                                {activeTab === 'schedule' && <ScheduleList events={teamData.schedule} />}
                                {activeTab === 'news' && <NewsGrid articles={teamData.news} />}
                            </div>
                        )}
                    </div>
                )}
                {/* Show spinner while loading teams, but only if dashboard isn't already visible */}
                {isLoadingTeams && !selectedTeamId && <LoadingSpinner />}


                {/* Error Modal */}
                {error && (
                    <ErrorModal message={error} onClose={() => setError(null)} />
                )}
            </div>
        </div>
    );
}

// --- Sub-Components ---

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-64">
        <div className="spinner w-10 h-10 border-4 border-t-white border-gray-600 rounded-full animate-spin"></div>
    </div>
);

interface ErrorModalProps {
    message: string;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full text-gray-900">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Error</h3>
            <p className="mb-6 text-gray-700">{message}</p>
            <button 
                onClick={onClose}
                className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
                Close
            </button>
        </div>
    </div>
);

interface RosterGridProps {
    players: Player[];
}

const RosterGrid: React.FC<RosterGridProps> = ({ players }) => {
    if (players.length === 0) {
        return <p className="text-gray-400 col-span-full text-center text-lg">No players found for this roster.</p>;
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {players.map(player => {
                let headshotUrl = 'https://placehold.co/160x160/374151/FFFFFF?text=??';
                if (player.headshot) {
                    if (typeof player.headshot === 'string' && player.headshot.length > 0) headshotUrl = player.headshot;
                    else if ((player.headshot as PlayerHeadshot).href) headshotUrl = (player.headshot as PlayerHeadshot).href;
                }

                return (
                    <div key={player.id} className="bg-gray-800 rounded-lg shadow-lg p-4 text-center transition-transform transform hover:scale-105 duration-200">
                        <img 
                            src={headshotUrl} 
                            alt={player.fullName}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4 bg-gray-700 object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/160x160/374151/FFFFFF?text=??')}
                        />
                        <h3 className="text-xl font-semibold text-white mb-1">{player.fullName}</h3>
                        <p className="text-gray-400 text-lg">#{player.jersey || 'N/A'} | {player.position?.abbreviation || 'N/A'}</p>
                    </div>
                );
            })}
        </div>
    );
};

interface ScheduleListProps {
    events: ScheduleEvent[];
}

const ScheduleList: React.FC<ScheduleListProps> = ({ events }) => {
    if (events.length === 0) {
        return <p className="text-gray-400 text-center text-lg">No schedule data available.</p>;
    }
    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {events.map(event => {
                const date = new Date(event.date).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                });
                const status = event.competitions[0]?.status?.type?.detail || '';
                const scoreboardLink = event.links?.find(link => link.rel.includes('scoreboard'))?.href;

                return (
                    <div key={event.id} className="bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">{date}</p>
                            <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                            <p className="text-sm font-medium text-blue-400">{status}</p>
                        </div>
                        {scoreboardLink && (
                            <a 
                                href={scoreboardLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
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

interface NewsGridProps {
    articles: NewsArticle[];
}

const NewsGrid: React.FC<NewsGridProps> = ({ articles }) => {
    if (articles.length === 0) {
        return <p className="text-gray-400 col-span-full text-center text-lg">No news found for this team.</p>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => {
                const imageUrl = article.images?.[0]?.url || 'https://placehold.co/600x400/374151/FFFFFF?text=News';
                const articleLink = article.links?.web?.href;

                return (
                    <a 
                        key={article.id} 
                        href={articleLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden block hover:bg-gray-700 transition-colors"
                    >
                        <img 
                            src={imageUrl} 
                            alt={article.headline} 
                            className="w-full h-48 object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/374151/FFFFFF?text=News')}
                        />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">{article.headline}</h3>
                            <p className="text-sm text-gray-400">{article.description?.substring(0, 100) || ''}{article.description && article.description.length > 100 ? '...' : ''}</p>
                        </div>
                    </a>
                );
            })}
        </div>
    );
};
