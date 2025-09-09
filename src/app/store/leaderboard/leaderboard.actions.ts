import { createAction, props } from '@ngrx/store';
import { LeaderboardEntry, LeagueLeaderboard } from '../../core/models/leaderboard.model';

export const loadGlobalLeaderboard = createAction('[Leaderboard] Load Global Leaderboard');

export const loadGlobalLeaderboardSuccess = createAction(
  '[Leaderboard] Load Global Leaderboard Success',
  props<{ leaderboard: LeaderboardEntry[] }>()
);

export const loadGlobalLeaderboardFailure = createAction(
  '[Leaderboard] Load Global Leaderboard Failure',
  props<{ error: string }>()
);

export const loadLeagueLeaderboard = createAction(
  '[Leaderboard] Load League Leaderboard',
  props<{ leagueId: string }>()
);

export const loadLeagueLeaderboardSuccess = createAction(
  '[Leaderboard] Load League Leaderboard Success',
  props<{ leagueLeaderboard: LeagueLeaderboard }>()
);

export const loadLeagueLeaderboardFailure = createAction(
  '[Leaderboard] Load League Leaderboard Failure',
  props<{ error: string }>()
);