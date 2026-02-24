import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, switchMap, catchError } from 'rxjs/operators';
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
          catchError(err => of(LeagueActions.loadLeaguesFailure({ error: err.message })))
        )
      )
    )
  );

  // Rooms are nested under leagues: GET /leagues/{id}/rooms
  loadRooms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.loadRooms),
      switchMap(({ leagueId }) =>
        this.leagueService.getRoomsByLeague(leagueId).pipe(
          map(rooms => LeagueActions.loadRoomsSuccess({ rooms })),
          catchError(err => of(LeagueActions.loadRoomsFailure({ error: err.message })))
        )
      )
    )
  );

  loadRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.loadRoom),
      exhaustMap(({ roomId }) =>
        this.leagueService.getRoom(roomId).pipe(
          map(room => LeagueActions.loadRoomSuccess({ room })),
          catchError(err => of(LeagueActions.loadRoomFailure({ error: err.message })))
        )
      )
    )
  );

  joinRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.joinRoom),
      exhaustMap(({ joinData }) =>
        this.leagueService.joinRoom(joinData).pipe(
          map(response => LeagueActions.joinRoomSuccess({ response })),
          catchError(err => of(LeagueActions.joinRoomFailure({ error: err.message })))
        )
      )
    )
  );

  leaveRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.leaveRoom),
      exhaustMap(({ roomId }) =>
        this.leagueService.leaveRoom(roomId).pipe(
          map(() => LeagueActions.leaveRoomSuccess()),
          catchError(err => of(LeagueActions.leaveRoomFailure({ error: err.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private leagueService: LeagueService,
  ) {}
}
