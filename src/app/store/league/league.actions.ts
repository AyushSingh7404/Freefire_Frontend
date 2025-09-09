import { createAction, props } from '@ngrx/store';
import { League, Room, JoinRoomRequest } from '../../core/models/league.model';

export const loadLeagues = createAction('[League] Load Leagues');

export const loadLeaguesSuccess = createAction(
  '[League] Load Leagues Success',
  props<{ leagues: League[] }>()
);

export const loadLeaguesFailure = createAction(
  '[League] Load Leagues Failure',
  props<{ error: string }>()
);

export const loadRooms = createAction(
  '[League] Load Rooms',
  props<{ leagueId: string }>()
);

export const loadRoomsSuccess = createAction(
  '[League] Load Rooms Success',
  props<{ rooms: Room[] }>()
);

export const loadRoomsFailure = createAction(
  '[League] Load Rooms Failure',
  props<{ error: string }>()
);

export const joinRoom = createAction(
  '[League] Join Room',
  props<{ joinData: JoinRoomRequest }>()
);

export const joinRoomSuccess = createAction(
  '[League] Join Room Success',
  props<{ roomId: string }>()
);

export const joinRoomFailure = createAction(
  '[League] Join Room Failure',
  props<{ error: string }>()
);