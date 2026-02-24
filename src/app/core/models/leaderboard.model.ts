// ── Frontend models (camelCase) ────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  totalWinnings: number;
  gamesPlayed: number;
  winRate: number;
  averageKills: number;
  points: number;
}

export interface GlobalLeaderboardResponse {
  total: number;
  entries: LeaderboardEntry[];
}

export interface LeagueLeaderboard {
  leagueId: string;
  leagueName: string;
  total: number;
  entries: LeaderboardEntry[];
}

// ── Raw API shapes ─────────────────────────────────────────────────────────
export interface ApiLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_winnings: number;
  games_played: number;
  win_rate: number;
  average_kills: number;
  points: number;
}

export interface ApiGlobalLeaderboard {
  total: number;
  entries: ApiLeaderboardEntry[];
}

export interface ApiLeagueLeaderboard {
  league_id: string;
  league_name: string;
  total: number;
  entries: ApiLeaderboardEntry[];
}
