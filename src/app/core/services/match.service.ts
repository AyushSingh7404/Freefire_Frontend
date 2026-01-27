import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Match } from '../models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private mock: Match[] = [
    { id: 'm1', leagueId: 'silver', division: '1v1', roomName: 'Silver Room #1', result: 'win', coinsWon: 30, kills: 6, playedAt: new Date(Date.now() - 86400000) },
    { id: 'm2', leagueId: 'gold', division: '2v2', roomName: 'Gold Room #1', result: 'loss', coinsWon: 0, kills: 3, playedAt: new Date(Date.now() - 43200000) },
    { id: 'm3', leagueId: 'diamond', division: '4v4', roomName: 'Diamond Room #1', result: 'win', coinsWon: 160, kills: 12, playedAt: new Date(Date.now() - 21600000) }
  ];

  getHistory(): Observable<Match[]> {
    return of(this.mock).pipe(delay(400));
  }
}
