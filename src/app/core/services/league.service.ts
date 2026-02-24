import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  League, Room, Division, JoinRoomRequest, JoinRoomResponse,
  ApiLeague, ApiRoom, ApiDivision, ApiJoinRoomResponse, ApiRoomPlayer, RoomPlayer,
} from '../models/league.model';

@Injectable({ providedIn: 'root' })
export class LeagueService {
  private readonly leaguesBase = `${environment.apiUrl}/leagues`;
  private readonly roomsBase   = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  // ── Mappers ──────────────────────────────────────────────────────────────

  private mapLeague(l: ApiLeague): League {
    return {
      id: l.id,
      name: l.name,
      tier: l.tier as League['tier'],
      entryFee: l.entry_fee,
      description: l.description,
      maxPlayers: l.max_players,
      imageUrl: l.image_url,
      isActive: l.is_active,
      createdAt: new Date(l.created_at),
    };
  }

  private mapPlayer(p: ApiRoomPlayer): RoomPlayer {
    return {
      id: p.id,
      userId: p.user_id,
      username: p.username,
      freeFireId: p.free_fire_id,
      joinedAt: new Date(p.joined_at),
      position: p.position,
      kills: p.kills,
      points: p.points,
    };
  }

  private mapRoom(r: ApiRoom): Room {
    return {
      id: r.id,
      leagueId: r.league_id,
      name: r.name,
      entryFee: r.entry_fee,
      division: r.division as Room['division'],
      maxPlayers: r.max_players,
      currentPlayers: r.current_players,
      status: r.status as Room['status'],
      adminRoomId: r.admin_room_id,
      startsAt: new Date(r.starts_at),
      createdAt: new Date(r.created_at),
      players: (r.players || []).map(p => this.mapPlayer(p)),
    };
  }

  // ── Leagues ───────────────────────────────────────────────────────────────

  // GET /leagues
  getLeagues(): Observable<League[]> {
    return this.http
      .get<ApiLeague[]>(this.leaguesBase)
      .pipe(map(list => list.map(l => this.mapLeague(l))));
  }

  // GET /leagues/{id}
  getLeague(id: string): Observable<League> {
    return this.http
      .get<ApiLeague>(`${this.leaguesBase}/${id}`)
      .pipe(map(l => this.mapLeague(l)));
  }

  // GET /leagues/{id}/divisions
  getDivisionsForLeague(leagueId: string): Observable<Division[]> {
    return this.http
      .get<ApiDivision[]>(`${this.leaguesBase}/${leagueId}/divisions`)
      .pipe(map(list => list.map(d => ({
        id: d.id,
        leagueId: d.league_id,
        divisionType: d.division_type as Division['divisionType'],
        entryFee: d.entry_fee,
        rewardsDescription: d.rewards_description,
      }))));
  }

  // ── Rooms ─────────────────────────────────────────────────────────────────

  // GET /leagues/{id}/rooms?status=open&division=1v1
  // Backend: rooms live under leagues, not under /rooms directly
  getRoomsByLeague(
    leagueId: string,
    status: 'open' | 'closed' | 'in_progress' | 'completed' | null = 'open',
    division: string | null = null,
  ): Observable<Room[]> {
    let params = new HttpParams();
    if (status)   params = params.set('status', status);
    if (division) params = params.set('division', division);

    return this.http
      .get<ApiRoom[]>(`${this.leaguesBase}/${leagueId}/rooms`, { params })
      .pipe(map(list => list.map(r => this.mapRoom(r))));
  }

  // GET /rooms/{id}
  getRoom(id: string): Observable<Room> {
    return this.http
      .get<ApiRoom>(`${this.roomsBase}/${id}`)
      .pipe(map(r => this.mapRoom(r)));
  }

  // POST /rooms/{id}/join
  joinRoom(req: JoinRoomRequest): Observable<JoinRoomResponse> {
    return this.http
      .post<ApiJoinRoomResponse>(`${this.roomsBase}/${req.roomId}/join`, {
        free_fire_id: req.freeFireId,
      })
      .pipe(map(r => ({
        message: r.message,
        roomName: r.room_name,
        adminRoomId: r.admin_room_id,
        currentPlayers: r.current_players,
        maxPlayers: r.max_players,
      })));
  }

  // POST /rooms/{id}/leave
  leaveRoom(roomId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.roomsBase}/${roomId}/leave`, {}
    );
  }
}
