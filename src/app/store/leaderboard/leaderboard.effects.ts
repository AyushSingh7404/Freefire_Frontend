import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import * as LeaderboardActions from './leaderboard.actions';

@Injectable()
export class LeaderboardEffects {
  
  loadGlobalLeaderboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaderboardActions.loadGlobalLeaderboard),
      exhaustMap(() =>
        this.leaderboardService.getGlobalLeaderboard().pipe(
          map(leaderboard => LeaderboardActions.loadGlobalLeaderboardSuccess({ leaderboard })),
          catchError(error => of(LeaderboardActions.loadGlobalLeaderboardFailure({ error: error.message })))
        )
      )
    )
  );

  loadLeagueLeaderboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaderboardActions.loadLeagueLeaderboard),
      exhaustMap(({ leagueId }) =>
        this.leaderboardService.getLeagueLeaderboard(leagueId).pipe(
          map(leagueLeaderboard => LeaderboardActions.loadLeagueLeaderboardSuccess({ leagueLeaderboard })),
          catchError(error => of(LeaderboardActions.loadLeagueLeaderboardFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private leaderboardService: LeaderboardService
  ) {}
}