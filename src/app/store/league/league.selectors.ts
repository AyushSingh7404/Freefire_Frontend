import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LeagueState } from './league.reducer';

export const selectLeagueState = createFeatureSelector<LeagueState>('league');

export const selectLeagues = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.leagues
);

export const selectRooms = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.rooms
);

export const selectLeagueLoading = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.loading
);

export const selectLeagueError = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.error
);