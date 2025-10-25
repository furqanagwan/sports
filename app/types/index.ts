export type LeagueKey = 'nba' | 'nfl' | 'nhl' | 'mlb' | 'ncaam';
export type TabKey = 'roster' | 'schedule' | 'news';

export interface LeagueConfig {
  sport: string;
  league: string;
}

export interface TeamLogo {
  href: string;
}

export interface Team {
  id: string;
  displayName: string;
  logos: TeamLogo[];
}

export interface PlayerPosition {
  abbreviation: string;
}

export interface PlayerHeadshot {
  href: string;
}

export interface Player {
  id: string;
  fullName: string;
  jersey?: string;
  position?: PlayerPosition;
  headshot?: PlayerHeadshot | string;
}

export interface ScheduleEvent {
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

export interface NewsImage {
  url: string;
}

export interface NewsArticle {
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

export interface TeamApiResponse {
  sports: {
    leagues: {
      teams: { team: Team }[] | { teams: { team: Team }[] }[];
    }[];
  }[];
}

export interface RosterApiResponse {
  athletes?: Player[];
  roster?: { items: Player[] }[];
}

export interface ScheduleApiResponse {
  events: ScheduleEvent[];
}

export interface NewsApiResponse {
  articles: NewsArticle[];
}

export interface TeamData {
  team: Team | null;
  roster: Player[];
  schedule: ScheduleEvent[];
  news: NewsArticle[];
}