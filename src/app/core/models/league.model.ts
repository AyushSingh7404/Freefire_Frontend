export interface League {
  id: string;
  name: string;
  tier: 'gold' | 'platinum' | 'diamond';
  entryFee: number;
  description: string;
  maxPlayers: number;
  image: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  leagueId: string;
  name: string;
  entryFee: number;
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