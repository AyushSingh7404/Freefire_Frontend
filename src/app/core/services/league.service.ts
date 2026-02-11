import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { League, Room, JoinRoomRequest, Division } from '../models/league.model';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {
  private readonly apiUrl = `${environment.apiUrl}/league`;

  constructor(private http: HttpClient) {}

  private mockLeagues: League[] = [
    {
      id: 'silver',
      name: 'Silver League',
      tier: 'silver',
      entryFee: 15,
      description: 'Perfect for new competitors',
      maxPlayers: 50,
      image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
      isActive: true
    },
    {
      id: 'gold',
      name: 'Gold League',
      tier: 'gold',
      entryFee: 25,
      description: 'Mid-tier competition with bigger rewards',
      maxPlayers: 40,
      image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
      isActive: true
    },
    {
      id: 'diamond',
      name: 'Diamond League',
      tier: 'diamond',
      entryFee: 50,
      description: 'Top-tier elite competition',
      maxPlayers: 30,
      image: 'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=400',
      isActive: true
    },
    {
      id: 'br',
      name: 'Battle Royale (BR)',
      tier: 'br',
      entryFee: 0,
      description: 'Weekend special with pre-booking',
      maxPlayers: 100,
      image: 'https://images.pexels.com/photos/289445/pexels-photo-289445.jpeg?auto=compress&cs=tinysrgb&w=400',
      isActive: true
    }
  ];

  private mockRooms: Room[] = [
    {
      id: '1',
      leagueId: 'silver',
      name: 'Silver Room #1',
      entryFee: 20,
      division: '1v1',
      maxPlayers: 50,
      currentPlayers: 35,
      status: 'open',
      roomId: 'SLV001',
      createdBy: 'admin',
      createdAt: new Date(),
      startsAt: new Date(Date.now() + 3600000),
      players: []
    },
    {
      id: '2',
      leagueId: 'gold',
      name: 'Gold Room #1',
      entryFee: 30,
      division: '2v2',
      maxPlayers: 40,
      currentPlayers: 28,
      status: 'open',
      roomId: 'GLD001',
      createdBy: 'admin',
      createdAt: new Date(),
      startsAt: new Date(Date.now() + 5400000),
      players: []
    },
    {
      id: '3',
      leagueId: 'diamond',
      name: 'Diamond Room #1',
      entryFee: 50,
      division: '4v4',
      maxPlayers: 30,
      currentPlayers: 18,
      status: 'open',
      roomId: 'DMN001',
      createdBy: 'admin',
      createdAt: new Date(),
      startsAt: new Date(Date.now() + 7200000),
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

  getDivisionsForLeague(leagueId: string): Observable<Division[]> {
    let divisions: Division[] = [];
    if (leagueId === 'silver') {
      divisions = [
        { id: '1v1', name: '1v1', entryFeeLabel: '20', rewardsLabel: '30' },
        { id: '2v2', name: '2v2', entryFeeLabel: '20', rewardsLabel: '30' },
        { id: '3v3', name: '3v3', entryFeeLabel: '15', rewardsLabel: '3,20' },
        { id: '4v4', name: '4v4', entryFeeLabel: '15', rewardsLabel: '3,20' }
      ];
    } else if (leagueId === 'gold') {
      divisions = [
        { id: '1v1', name: '1v1', entryFeeLabel: '40', rewardsLabel: '60' },
        { id: '2v2', name: '2v2', entryFeeLabel: '30', rewardsLabel: '50' },
        { id: '3v3', name: '3v3', entryFeeLabel: '25', rewardsLabel: '5,40' },
        { id: '4v4', name: '4v4', entryFeeLabel: '25', rewardsLabel: '5,40' }
      ];
    } else if (leagueId === 'diamond') {
      divisions = [
        { id: '1v1', name: '1v1', entryFeeLabel: '100', rewardsLabel: '160' },
        { id: '2v2', name: '2v2', entryFeeLabel: '50', rewardsLabel: '80' },
        { id: '3v3', name: '3v3', entryFeeLabel: '50', rewardsLabel: '10,80' },
        { id: '4v4', name: '4v4', entryFeeLabel: '50', rewardsLabel: '10,80' }
      ];
    } else if (leagueId === 'br') {
      divisions = [
        { id: '4v4', name: 'BR', entryFeeLabel: 'Pre-book only (weekends)', rewardsLabel: 'Rewards vary by event' }
      ];
    }
    return of(divisions).pipe(delay(200));
  }
}
