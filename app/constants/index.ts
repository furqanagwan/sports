import { LeagueKey, LeagueConfig } from '../types';

export const LEAGUE_CONFIG: Record<LeagueKey, LeagueConfig> = {
  'nba': { sport: 'basketball', league: 'nba' },
  'nfl': { sport: 'football', league: 'nfl' },
  'nhl': { sport: 'hockey', league: 'nhl' },
  'mlb': { sport: 'baseball', league: 'mlb' },
  'ncaam': { sport: 'basketball', league: 'mens-college-basketball' }
};