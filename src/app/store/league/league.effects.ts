import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { LeagueService } from '../../core/services/league.service';
import * as LeagueActions from './league.actions';

@Injectable()
export class LeagueEffects {
  
  loadLeagues$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.loadLeagues),
      exhaustMap(() =>
        this.leagueService.getLeagues().pipe(
          map(leagues => LeagueActions.loadLeaguesSuccess({ leagues })),
          catchError(error => of(LeagueActions.loadLeaguesFailure({ error: error.message })))
        )
      )
    )
  );

  loadRooms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.loadRooms),
      exhaustMap(({ leagueId }) =>
        this.leagueService.getRoomsByLeague(leagueId).pipe(
          map(rooms => LeagueActions.loadRoomsSuccess({ rooms })),
          catchError(error => of(LeagueActions.loadRoomsFailure({ error: error.message })))
        )
      )
    )
  );

  joinRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.joinRoom),
      exhaustMap(({ joinData }) =>
        this.leagueService.joinRoom(joinData).pipe(
          map(({ roomId }) => LeagueActions.joinRoomSuccess({ roomId: roomId! })),
          catchError(error => of(LeagueActions.joinRoomFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private leagueService: LeagueService
  ) {}
}