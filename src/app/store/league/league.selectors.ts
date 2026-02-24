import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LeagueState } from './league.reducer';

export const selectLeagueState = createFeatureSelector<LeagueState>('league');

export const selectLeagues        = createSelector(selectLeagueState, (s) => s.leagues);
export const selectRooms          = createSelector(selectLeagueState, (s) => s.rooms);
export const selectSelectedRoom   = createSelector(selectLeagueState, (s) => s.selectedRoom);
export const selectJoinResponse   = createSelector(selectLeagueState, (s) => s.joinResponse);
export const selectLeagueLoading  = createSelector(selectLeagueState, (s) => s.loading);
export const selectLeagueError    = createSelector(selectLeagueState, (s) => s.error);

export const selectOpenRooms = createSelector(
  selectRooms,
  (rooms) => rooms.filter(r => r.status === 'open')
);
