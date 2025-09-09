import { createReducer, on } from '@ngrx/store';
import { League, Room } from '../../core/models/league.model';
import * as LeagueActions from './league.actions';

export interface LeagueState {
  leagues: League[];
  rooms: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: LeagueState = {
  leagues: [],
  rooms: [],
  loading: false,
  error: null
};

export const leagueReducer = createReducer(
  initialState,
  on(LeagueActions.loadLeagues, LeagueActions.loadRooms, LeagueActions.joinRoom, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(LeagueActions.loadLeaguesSuccess, (state, { leagues }) => ({
    ...state,
    leagues,
    loading: false
  })),
  on(LeagueActions.loadRoomsSuccess, (state, { rooms }) => ({
    ...state,
    rooms,
    loading: false
  })),
  on(LeagueActions.joinRoomSuccess, (state) => ({
    ...state,
    loading: false
  })),
  on(LeagueActions.loadLeaguesFailure, LeagueActions.loadRoomsFailure,
     LeagueActions.joinRoomFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);