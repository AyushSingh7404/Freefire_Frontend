export interface League {
  id: string;
  name: string;
  tier: 'silver' | 'gold' | 'diamond' | 'br';
  entryFee: number;
  description: string;
  maxPlayers: number;
  image: string;
  isActive: boolean;
}

export interface Division {
  id: '1v1' | '2v2' | '3v3' | '4v4';
  name: string;
  entryFeeLabel: string;
  rewardsLabel: string;
}

export interface Room {
  id: string;
  leagueId: string;
  name: string;
  entryFee: number;
  division: '1v1' | '2v2' | '3v3' | '4v4';
  maxPlayers: number;
  currentPlayers: number;
  status: 'open' | 'closed' | 'in-progress' | 'completed';
  roomId?: string; // Admin-provided room ID
  createdBy: string;
  createdAt: Date;
  startsAt: Date;
  players: RoomPlayer[];
}

export interface RoomPlayer {
  userId: string;
  username: string;
  freeFireId: string;
  joinedAt: Date;
  position?: number;
  kills?: number;
  points?: number;
}

export interface JoinRoomRequest {
  roomId: string;
  freeFireId: string;
}
