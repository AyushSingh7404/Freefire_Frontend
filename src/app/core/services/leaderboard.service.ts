import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaderboardEntry, LeagueLeaderboard } from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly apiUrl = `${environment.apiUrl}/leaderboard`;

  constructor(private http: HttpClient) {}

  // Mock data
  private mockGlobalLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: '1',
      username: 'ProGamer123',
      avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100',
      totalWinnings: 5000,
      gamesPlayed: 25,
      winRate: 68,
      averageKills: 8.5,
      points: 2800
    },
    {
      rank: 2,
      userId: '2',
      username: 'ElitePlayer',
      totalWinnings: 4200,
      gamesPlayed: 30,
      winRate: 63,
      averageKills: 7.2,
      points: 2650
    },
    {
      rank: 3,
      userId: '3',
      username: 'FireMaster',
      totalWinnings: 3800,
      gamesPlayed: 22,
      winRate: 59,
      averageKills: 9.1,
      points: 2420
    }
  ];

  getGlobalLeaderboard(): Observable<LeaderboardEntry[]> {
    return of(this.mockGlobalLeaderboard).pipe(delay(500));
  }

  getLeagueLeaderboard(leagueId: string): Observable<LeagueLeaderboard> {
    return of({
      leagueId,
      leagueName: leagueId === 'gold' ? 'Gold League' : leagueId === 'platinum' ? 'Platinum League' : 'Diamond League',
      entries: this.mockGlobalLeaderboard.slice(0, 10)
    }).pipe(delay(500));
  }
}