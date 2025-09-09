export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  totalWinnings: number;
  gamesPlayed: number;
  winRate: number;
  averageKills: number;
  points: number;
}

export interface LeagueLeaderboard {
  leagueId: string;
  leagueName: string;
  entries: LeaderboardEntry[];
}