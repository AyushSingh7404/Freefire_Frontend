import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { selectAuthToken } from '../../store/auth/auth.selectors';
import { take } from 'rxjs/operators';

export interface WsRoomUpdate {
  room_id: string;
  current_players: number;
  max_players: number;
  status: string;
  admin_room_id?: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private messages$ = new Subject<WsRoomUpdate>();
  private currentRoomId: string | null = null;

  constructor(private store: Store) {}

  /**
   * Open a WebSocket connection for a specific room.
   * Automatically closes the previous connection if one exists.
   * Token is passed as a query param (backend expects ?token=<access_token>).
   */
  connectRoom(roomId: string): Observable<WsRoomUpdate> {
    if (this.currentRoomId === roomId && this.ws?.readyState === WebSocket.OPEN) {
      return this.messages$.asObservable();
    }
    this.disconnect();

    this.store.select(selectAuthToken).pipe(take(1)).subscribe(token => {
      if (!token) return;
      const url = `${environment.wsUrl}/ws/rooms/${roomId}?token=${token}`;
      this.ws = new WebSocket(url);
      this.currentRoomId = roomId;

      this.ws.onmessage = (event) => {
        try {
          const data: WsRoomUpdate = JSON.parse(event.data);
          this.messages$.next(data);
        } catch {
          // ignore non-JSON frames (e.g. ping)
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket error for room', roomId, err);
      };

      this.ws.onclose = () => {
        this.currentRoomId = null;
      };
    });

    return this.messages$.asObservable();
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.currentRoomId = null;
    }
  }

  ngOnDestroy() {
    this.disconnect();
    this.messages$.complete();
  }
}
