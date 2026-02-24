import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Match, ApiMatch, ApiMatchHistory } from '../models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly base = `${environment.apiUrl}/matches`;

  constructor(private http: HttpClient) {}

  private mapMatch(m: ApiMatch): Match {
    return {
      id: m.id,
      roomId: m.room_id,
      leagueId: m.league_id,
      division: m.division,
      roomName: m.room_name,
      result: m.result as Match['result'],
      coinsWon: m.coins_won,
      kills: m.kills,
      position: m.position,
      playedAt: new Date(m.played_at),
    };
  }

  // Backend: GET /matches/history (NOT /matches/me)
  getHistory(page = 1, limit = 20): Observable<Match[]> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http
      .get<ApiMatchHistory>(`${this.base}/history`, { params })
      .pipe(map(res => res.matches.map(m => this.mapMatch(m))));
  }
}
