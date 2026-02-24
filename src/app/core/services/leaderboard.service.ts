import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LeaderboardEntry, LeagueLeaderboard,
  ApiLeaderboardEntry, ApiGlobalLeaderboard, ApiLeagueLeaderboard
} from '../models/leaderboard.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly base = `${environment.apiUrl}/leaderboard`;

  constructor(private http: HttpClient) {}

  private mapEntry(e: ApiLeaderboardEntry): LeaderboardEntry {
    return {
      rank: e.rank,
      userId: e.user_id,
      username: e.username,
      avatarUrl: e.avatar_url,
      totalWinnings: e.total_winnings,
      gamesPlayed: e.games_played,
      winRate: e.win_rate,
      averageKills: e.average_kills,
      points: e.points,
    };
  }

  getGlobalLeaderboard(page = 1, limit = 50): Observable<LeaderboardEntry[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http
      .get<ApiGlobalLeaderboard>(`${this.base}/global`, { params })
      .pipe(map(res => res.entries.map(e => this.mapEntry(e))));
  }

  getLeagueLeaderboard(leagueId: string, page = 1, limit = 50): Observable<LeagueLeaderboard> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http
      .get<ApiLeagueLeaderboard>(`${this.base}/league/${leagueId}`, { params })
      .pipe(map(res => ({
        leagueId: res.league_id,
        leagueName: res.league_name,
        total: res.total,
        entries: res.entries.map(e => this.mapEntry(e)),
      })));
  }
}
