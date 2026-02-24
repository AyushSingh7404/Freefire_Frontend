import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { selectWalletBalance } from '../../store/wallet/wallet.selectors';
import { joinRoom, loadRoom, clearSelectedRoom } from '../../store/league/league.actions';
import { selectSelectedRoom, selectJoinResponse, selectLeagueLoading, selectLeagueError } from '../../store/league/league.selectors';
import { Room, JoinRoomResponse } from '../../core/models/league.model';
import { loadWallet } from '../../store/wallet/wallet.actions';
import { WebSocketService, WsRoomUpdate } from '../../core/services/websocket.service';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="container">
      <!-- Room info -->
      <mat-card class="glass" *ngIf="room$ | async as room">
        <mat-card-header>
          <mat-card-title>{{ room.name }}</mat-card-title>
          <mat-card-subtitle>
            {{ room.division }} &bull; Entry: {{ room.entryFee }} coins &bull;
            {{ room.currentPlayers }}/{{ room.maxPlayers }} players
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="info-value status-{{ room.status }}">{{ room.status }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Starts At</span>
              <span class="info-value">{{ room.startsAt | date:'dd MMM, h:mm a' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Your Balance</span>
              <span class="info-value">{{ walletBalance$ | async }} coins</span>
            </div>
          </div>

          <!-- Pre-join warning -->
          <div class="warn-banner" *ngIf="(walletBalance$ | async)! < room.entryFee && !(joinResponse$ | async)">
            Warning: Insufficient coins. You need {{ room.entryFee }} coins to join.
            <button mat-button class="top-up-btn" (click)="goToWallet()">Top Up</button>
          </div>

          <!-- Join button -->
          <div class="actions" *ngIf="!(joinResponse$ | async)">
            <button mat-raised-button class="btn-gaming"
                    [disabled]="(loading$ | async) || (walletBalance$ | async)! < room.entryFee || room.status !== 'open'"
                    (click)="onJoin(room)">
              <span *ngIf="loading$ | async">Joining...</span>
              <span *ngIf="!(loading$ | async)">Join Room ({{ room.entryFee }} coins)</span>
            </button>
          </div>

          <!-- Success: show room credentials -->
          <div class="join-success" *ngIf="joinResponse$ | async as jr">
            <div class="success-header">✅ Joined Successfully!</div>
            <div class="credential-card">
              <div class="cred-row">
                <span class="cred-label">Room Name</span>
                <span class="cred-value">{{ jr.roomName }}</span>
              </div>
              <div class="cred-row" *ngIf="jr.adminRoomId">
                <span class="cred-label">Room ID / Password</span>
                <span class="cred-value highlight">{{ jr.adminRoomId }}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Players</span>
                <span class="cred-value">{{ jr.currentPlayers }} / {{ jr.maxPlayers }}</span>
              </div>
            </div>
            <p class="cred-note">Use the Room ID above to enter the match in Free Fire. Good luck!</p>
          </div>

          <div class="error-msg" *ngIf="error$ | async as err">{{ err }}</div>
          <div class="error-msg" *ngIf="liveError">{{ liveError }}</div>
        </mat-card-content>
      </mat-card>

      <!-- Loading skeleton -->
      <mat-card class="glass" *ngIf="!(room$ | async) && (loading$ | async)">
        <mat-card-content>
          <p style="color: rgba(255,255,255,0.5)">Loading room details...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 700px; margin: 0 auto; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-label { color: rgba(255,255,255,0.5); font-size: 0.8rem; text-transform: uppercase; }
    .info-value { color: white; font-weight: 600; }
    .status-open { color: #4caf50; }
    .status-in_progress { color: #ff9800; }
    .status-closed, .status-completed { color: #f44336; }
    .warn-banner { background: rgba(255,152,0,0.15); border: 1px solid rgba(255,152,0,0.4); color: #ff9800; border-radius: 10px; padding: 10px 14px; margin: 1rem 0; display: flex; align-items: center; gap: 1rem; }
    .top-up-btn { color: #ff6b35 !important; }
    .actions { margin-top: 1.5rem; }
    .btn-gaming { background: linear-gradient(45deg, #ff6b35, #f7931e) !important; color: white !important; border-radius: 25px !important; padding: 12px 32px !important; font-weight: bold !important; width: 100%; }
    .join-success { margin-top: 1.5rem; }
    .success-header { color: #4caf50; font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; }
    .credential-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
    .cred-value { color: white; font-weight: 600; }
    .cred-value.highlight { color: #ff6b35; font-size: 1.1rem; letter-spacing: 0.05em; }
    .cred-note { color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 1rem; }
    .error-msg { color: #f44336; margin-top: 1rem; }
  `]
})
export class RoomComponent implements OnInit, OnDestroy {
  roomId = '';
  room$: Observable<Room | null>;
  joinResponse$: Observable<JoinRoomResponse | null>;
  walletBalance$: Observable<number>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userFreeFireId: string | null = null;
  liveError = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private ws: WebSocketService,
  ) {
    this.room$          = this.store.select(selectSelectedRoom);
    this.joinResponse$  = this.store.select(selectJoinResponse);
    this.walletBalance$ = this.store.select(selectWalletBalance);
    this.loading$       = this.store.select(selectLeagueLoading);
    this.error$         = this.store.select(selectLeagueError);
  }

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.store.dispatch(clearSelectedRoom());
    this.store.dispatch(loadRoom({ roomId: this.roomId }));
    this.store.dispatch(loadWallet());

    // Cache user's UID for joins; enforce profile completeness.
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$), filter(u => !!u))
      .subscribe(user => this.userFreeFireId = user!.freeFireId || null);

    // Live updates via WebSocket: refresh room snapshot when server broadcasts.
    this.ws.connectRoom(this.roomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((update: WsRoomUpdate) => {
        if (update.room_id === this.roomId) {
          this.store.dispatch(loadRoom({ roomId: this.roomId }));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(); 
    this.destroy$.complete();
    this.ws.disconnect();
  }

  onJoin(room: Room) {
    if (!this.userFreeFireId) {
      this.liveError = 'Add your Free Fire UID in Profile before joining.';
      this.router.navigate(['/profile']);
      return;
    }
    this.liveError = '';
    this.store.dispatch(joinRoom({
      joinData: { roomId: room.id, freeFireId: this.userFreeFireId }
    }));
  }

  goToWallet() {
    this.router.navigate(['/wallet']);
  }
}
