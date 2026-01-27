export interface Match {
  id: string;
  leagueId: string;
  division: '1v1' | '2v2' | '3v3' | '4v4' | 'br';
  roomName: string;
  result: 'win' | 'loss' | 'draw';
  coinsWon: number;
  kills: number;
  playedAt: Date;
}
