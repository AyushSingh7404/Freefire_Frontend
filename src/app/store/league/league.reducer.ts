import { createReducer, on } from '@ngrx/store';
import { League, Room, JoinRoomResponse } from '../../core/models/league.model';
import * as LeagueActions from './league.actions';

export interface LeagueState {
  leagues: League[];
  rooms: Room[];
  selectedRoom: Room | null;
  joinResponse: JoinRoomResponse | null; // holds room credentials after successful join
  loading: boolean;
  error: string | null;
}

const initialState: LeagueState = {
  leagues: [],
  rooms: [],
  selectedRoom: null,
  joinResponse: null,
  loading: false,
  error: null,
};

export const leagueReducer = createReducer(
  initialState,

  on(LeagueActions.loadLeagues, LeagueActions.loadRooms, LeagueActions.loadRoom,
     LeagueActions.joinRoom, LeagueActions.leaveRoom, (state) => ({
    ...state, loading: true, error: null,
  })),

  on(LeagueActions.loadLeaguesSuccess, (state, { leagues }) => ({ ...state, leagues, loading: false })),
  on(LeagueActions.loadRoomsSuccess,   (state, { rooms })   => ({ ...state, rooms, loading: false })),
  on(LeagueActions.loadRoomSuccess,    (state, { room })    => ({ ...state, selectedRoom: room, loading: false })),

  // After joining: store the full join response (it contains the in-game room code)
  on(LeagueActions.joinRoomSuccess, (state, { response }) => ({
    ...state, joinResponse: response, loading: false,
  })),
  on(LeagueActions.leaveRoomSuccess, (state) => ({
    ...state, joinResponse: null, selectedRoom: null, loading: false,
  })),

  on(LeagueActions.clearSelectedRoom, (state) => ({
    ...state, selectedRoom: null, joinResponse: null,
  })),

  on(LeagueActions.loadLeaguesFailure, LeagueActions.loadRoomsFailure,
     LeagueActions.loadRoomFailure, LeagueActions.joinRoomFailure,
     LeagueActions.leaveRoomFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),
);
