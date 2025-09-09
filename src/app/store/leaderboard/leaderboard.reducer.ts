import { createReducer, on } from '@ngrx/store';
import { LeaderboardEntry, LeagueLeaderboard } from '../../core/models/leaderboard.model';
import * as LeaderboardActions from './leaderboard.actions';

export interface LeaderboardState {
  globalLeaderboard: LeaderboardEntry[];
  leagueLeaderboards: LeagueLeaderboard[];
  loading: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  globalLeaderboard: [],
  leagueLeaderboards: [],
  loading: false,
  error: null
};

export const leaderboardReducer = createReducer(
  initialState,
  on(LeaderboardActions.loadGlobalLeaderboard, LeaderboardActions.loadLeagueLeaderboard, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(LeaderboardActions.loadGlobalLeaderboardSuccess, (state, { leaderboard }) => ({
    ...state,
    globalLeaderboard: leaderboard,
    loading: false
  })),
  on(LeaderboardActions.loadLeagueLeaderboardSuccess, (state, { leagueLeaderboard }) => {
    const existingIndex = state.leagueLeaderboards.findIndex(l => l.leagueId === leagueLeaderboard.leagueId);
    const updatedLeaderboards = existingIndex !== -1 
      ? state.leagueLeaderboards.map((l, index) => index === existingIndex ? leagueLeaderboard : l)
      : [...state.leagueLeaderboards, leagueLeaderboard];
    
    return {
      ...state,
      leagueLeaderboards: updatedLeaderboards,
      loading: false
    };
  }),
  on(LeaderboardActions.loadGlobalLeaderboardFailure, 
     LeaderboardActions.loadLeagueLeaderboardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);