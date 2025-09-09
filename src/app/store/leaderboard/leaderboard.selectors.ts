import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LeaderboardState } from './leaderboard.reducer';

export const selectLeaderboardState = createFeatureSelector<LeaderboardState>('leaderboard');

export const selectGlobalLeaderboard = createSelector(
  selectLeaderboardState,
  (state: LeaderboardState) => state.globalLeaderboard
);

export const selectLeagueLeaderboards = createSelector(
  selectLeaderboardState,
  (state: LeaderboardState) => state.leagueLeaderboards
);

export const selectLeaderboardLoading = createSelector(
  selectLeaderboardState,
  (state: LeaderboardState) => state.loading
);

export const selectLeaderboardError = createSelector(
  selectLeaderboardState,
  (state: LeaderboardState) => state.error
);

export const selectLeagueLeaderboard = (leagueId: string) => createSelector(
  selectLeagueLeaderboards,
  (leaderboards) => leaderboards.find(l => l.leagueId === leagueId)
);