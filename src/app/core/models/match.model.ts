// ── Frontend model (camelCase) ─────────────────────────────────────────────
export interface Match {
  id: string;
  roomId?: string;
  leagueId?: string;
  division: string;
  roomName?: string;
  result: 'win' | 'loss' | 'draw';
  coinsWon: number;
  kills: number;
  position?: number;
  playedAt: Date;
}

export interface MatchHistoryResponse {
  total: number;
  page: number;
  limit: number;
  matches: Match[];
}

// ── Raw API shapes ─────────────────────────────────────────────────────────
export interface ApiMatch {
  id: string;
  room_id?: string;
  league_id?: string;
  division: string;
  room_name?: string;
  result: string;
  coins_won: number;
  kills: number;
  position?: number;
  played_at: string;
}

export interface ApiMatchHistory {
  total: number;
  page: number;
  limit: number;
  matches: ApiMatch[];
}
