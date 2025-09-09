import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { League, Room, JoinRoomRequest } from '../models/league.model';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {
  private readonly apiUrl = `${environment.apiUrl}/league`;

  constructor(private http: HttpClient) {}

  // Mock data
  private mockLeagues: League[] = [
    {
      id: 'gold',
      name: 'Gold League',
      tier: 'gold',
      entryFee: 10,
      description: 'Entry level tournament for beginners',
      maxPlayers: 50,
      image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
      isActive: true
    },
    {
      id: 'platinum',
      name: 'Platinum League',
      tier: 'platinum',
      entryFee: 50,
      description: 'Intermediate level with higher rewards',
      maxPlayers: 30,
      image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
      isActive: true
    },
    {
      id: 'diamond',
      name: 'Diamond League',
      tier: 'diamond',
      entryFee: 100,
      description: 'Elite tournament for pro players',
      maxPlayers: 20,
      image: 'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=400',
      isActive: true
    }
  ];

  private mockRooms: Room[] = [
    {
      id: '1',
      leagueId: 'gold',
      name: 'Gold Room #1',
      entryFee: 10,
      maxPlayers: 50,
      currentPlayers: 35,
      status: 'open',
      roomId: 'GLD001',
      createdBy: 'admin',
      createdAt: new Date(),
      startsAt: new Date(Date.now() + 3600000),
      players: []
    },
    {
      id: '2',
      leagueId: 'gold',
      name: 'Gold Room #2',
      entryFee: 10,
      maxPlayers: 50,
      currentPlayers: 50,
      status: 'closed',
      roomId: 'GLD002',
      createdBy: 'admin',
      createdAt: new Date(),
      startsAt: new Date(Date.now() + 7200000),
      players: []
    },
    {
      id: '3',
      leagueId: 'platinum',
      name: 'Platinum Championship',
      entryFee: 50,
      maxPlayers: 30,
      currentPlayers: 18,
      status: 'open',
      createdBy: 'admin',
      createdAt: new Date(),
      startsAt: new Date(Date.now() + 5400000),
      players: []
    }
  ];

  getLeagues(): Observable<League[]> {
    return of(this.mockLeagues).pipe(delay(500));
  }

  getLeague(id: string): Observable<League | undefined> {
    const league = this.mockLeagues.find(l => l.id === id);
    return of(league).pipe(delay(500));
  }

  getRoomsByLeague(leagueId: string): Observable<Room[]> {
    const rooms = this.mockRooms.filter(r => r.leagueId === leagueId);
    return of(rooms).pipe(delay(500));
  }

  getRoom(id: string): Observable<Room | undefined> {
    const room = this.mockRooms.find(r => r.id === id);
    return of(room).pipe(delay(500));
  }

  joinRoom(joinData: JoinRoomRequest): Observable<{ success: boolean; roomId?: string }> {
    return of({
      success: true,
      roomId: 'GLD001'
    }).pipe(delay(1000));
  }

  leaveRoom(roomId: string): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(500));
  }
}