import { createAction, props } from '@ngrx/store';
import { League, Room, JoinRoomRequest, JoinRoomResponse } from '../../core/models/league.model';

// ── Leagues ────────────────────────────────────────────────────────────────
export const loadLeagues = createAction('[League] Load Leagues');
export const loadLeaguesSuccess = createAction('[League] Load Leagues Success', props<{ leagues: League[] }>());
export const loadLeaguesFailure = createAction('[League] Load Leagues Failure', props<{ error: string }>());

// ── Rooms for a league ─────────────────────────────────────────────────────
export const loadRooms = createAction('[League] Load Rooms', props<{ leagueId: string }>());
export const loadRoomsSuccess = createAction('[League] Load Rooms Success', props<{ rooms: Room[] }>());
export const loadRoomsFailure = createAction('[League] Load Rooms Failure', props<{ error: string }>());

// ── Single room ────────────────────────────────────────────────────────────
export const loadRoom = createAction('[League] Load Room', props<{ roomId: string }>());
export const loadRoomSuccess = createAction('[League] Load Room Success', props<{ room: Room }>());
export const loadRoomFailure = createAction('[League] Load Room Failure', props<{ error: string }>());

// ── Join room ──────────────────────────────────────────────────────────────
export const joinRoom = createAction('[League] Join Room', props<{ joinData: JoinRoomRequest }>());
export const joinRoomSuccess = createAction('[League] Join Room Success', props<{ response: JoinRoomResponse }>());
export const joinRoomFailure = createAction('[League] Join Room Failure', props<{ error: string }>());

// ── Leave room ─────────────────────────────────────────────────────────────
export const leaveRoom = createAction('[League] Leave Room', props<{ roomId: string }>());
export const leaveRoomSuccess = createAction('[League] Leave Room Success');
export const leaveRoomFailure = createAction('[League] Leave Room Failure', props<{ error: string }>());

// ── Clear selection ────────────────────────────────────────────────────────
export const clearSelectedRoom = createAction('[League] Clear Selected Room');
