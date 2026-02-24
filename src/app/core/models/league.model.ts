// ── Frontend models (camelCase) ────────────────────────────────────────────
export interface League {
  id: string;
  name: string;
  tier: 'silver' | 'gold' | 'diamond' | 'br';
  entryFee: number;
  description?: string;
  maxPlayers: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface Division {
  id: string;
  leagueId: string;
  divisionType: '1v1' | '2v2' | '3v3' | '4v4' | 'br';
  entryFee: number;
  rewardsDescription?: string;
}

export interface RoomPlayer {
  id: string;
  userId: string;
  username?: string;
  freeFireId: string;
  joinedAt: Date;
  position?: number;
  kills?: number;
  points?: number;
}

export interface Room {
  id: string;
  leagueId: string;
  name: string;
  entryFee: number;
  division: '1v1' | '2v2' | '3v3' | '4v4' | 'br';
  maxPlayers: number;
  currentPlayers: number;
  status: 'open' | 'closed' | 'in_progress' | 'completed';
  adminRoomId?: string;   // the in-game room code — only set for joined players
  startsAt: Date;
  createdAt: Date;
  players: RoomPlayer[];
}

export interface JoinRoomRequest {
  roomId: string;
  freeFireId: string;
}

export interface JoinRoomResponse {
  message: string;
  roomName: string;
  adminRoomId?: string;
  currentPlayers: number;
  maxPlayers: number;
}

// ── Raw API response shapes ────────────────────────────────────────────────
export interface ApiLeague {
  id: string;
  name: string;
  tier: string;
  entry_fee: number;
  description?: string;
  max_players: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ApiDivision {
  id: string;
  league_id: string;
  division_type: string;
  entry_fee: number;
  rewards_description?: string;
}

export interface ApiRoomPlayer {
  id: string;
  user_id: string;
  username?: string;
  free_fire_id: string;
  joined_at: string;
  position?: number;
  kills?: number;
  points?: number;
}

export interface ApiRoom {
  id: string;
  league_id: string;
  name: string;
  entry_fee: number;
  division: string;
  max_players: number;
  current_players: number;
  status: string;
  admin_room_id?: string;
  starts_at: string;
  created_at: string;
  players: ApiRoomPlayer[];
}

export interface ApiJoinRoomResponse {
  message: string;
  room_name: string;
  admin_room_id?: string;
  current_players: number;
  max_players: number;
}
