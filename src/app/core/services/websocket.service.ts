import { Injectable } from '@angular/core';
import { Observable, interval, map } from 'rxjs';
import { Room } from '../models/league.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  streamRoomUpdates(rooms: Room[]): Observable<Room[]> {
    return interval(3000).pipe(
      map(i => rooms.map(r => ({
        ...r,
        currentPlayers: Math.min(r.maxPlayers, r.currentPlayers + (i % 2 === 0 ? 1 : 0))
      })))
    );
  }
}
