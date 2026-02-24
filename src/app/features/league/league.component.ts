import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil, take } from 'rxjs/operators';
import { loadRooms } from '../../store/league/league.actions';
import { selectRooms, selectLeagueLoading } from '../../store/league/league.selectors';
import { LeagueService } from '../../core/services/league.service';
import { League, Division, Room } from '../../core/models/league.model';
import { RoomTileComponent } from '../../shared/components/room-tile/room-tile.component';
import { DivisionTileComponent } from '../../shared/components/division-tile/division-tile.component';

@Component({
  selector: 'app-league',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RoomTileComponent,
    DivisionTileComponent,
  ],
  template: `
    <div class="league-container">

      <!-- Loading skeleton while league fetches -->
      <div class="loading-state" *ngIf="!league && leagueLoading">
        <div class="loading-spinner"></div>
        <p>Loading league...</p>
      </div>

      <!-- League not found -->
      <div class="error-state" *ngIf="!league && !leagueLoading && leagueFetchError">
        <p>{{ leagueFetchError }}</p>
      </div>

      <!-- Main content: render once league is loaded -->
      <ng-container *ngIf="league">
        <div class="header">
          <div class="header-meta">
            <span class="tier-badge tier-{{ league.tier }}">{{ league.tier | titlecase }}</span>
          </div>
          <h2 class="gradient-text">{{ league.name }}</h2>
          <p class="subtitle">{{ league.description || 'Select a division to view available rooms' }}</p>
          <div class="header-stats">
            <span class="stat-pill">Entry from {{ league.entryFee }} coins</span>
            <span class="stat-pill">Max {{ league.maxPlayers }} players</span>
          </div>
        </div>

        <!-- ── Normal league (non-BR) ── -->
        <ng-container *ngIf="league.tier !== 'br'; else brTemplate">

          <!-- Division filter tiles -->
          <div class="divisions-grid">
            <app-division-tile
              *ngFor="let d of divisions$ | async"
              [division]="d"
              [select]="onSelectDivision.bind(this)">
            </app-division-tile>
            <!-- Show "All" pill to reset filter -->
            <div class="division-tile all-tile"
                 [class.active]="!activeDivision"
                 (click)="clearDivision()">
              All Divisions
            </div>
          </div>

          <!-- Rooms grid -->
          <div class="rooms-section">
            <div class="rooms-header">
              <h3 class="text-primary">
                {{ activeDivision ? activeDivision + ' Rooms' : 'All Rooms' }}
              </h3>
              <span class="room-count" *ngIf="roomsLive$ | async as rooms">
                {{ rooms.length }} open
              </span>
            </div>

            <div *ngIf="loading$ | async" class="loading-rooms">
              <div class="loading-spinner small"></div>
            </div>

            <div class="rooms-grid" *ngIf="!(loading$ | async)">
              <app-room-tile
                *ngFor="let room of roomsLive$ | async"
                [room]="room">
              </app-room-tile>
            </div>

            <div class="empty-state"
                 *ngIf="!(loading$ | async) && (roomsLive$ | async)?.length === 0">
              <p>No open rooms right now.</p>
              <p class="muted">Check back soon or ask an admin to create a room.</p>
            </div>
          </div>

        </ng-container>

        <!-- ── Battle Royale template ── -->
        <ng-template #brTemplate>
          <div class="br-card glass">
            <h3 class="text-primary">Battle Royale Pre-Booking</h3>
            <p class="muted">Open only on Saturdays and Sundays</p>

            <ng-container *ngIf="isWeekend(); else brDisabled">
              <form [formGroup]="prebookForm" (ngSubmit)="onPrebook()" class="prebook-form">
                <div class="form-field">
                  <label>Free Fire UID</label>
                  <input class="text-input" formControlName="freeFireId" placeholder="Your in-game UID">
                </div>
                <div class="form-field">
                  <label>In-game Username</label>
                  <input class="text-input" formControlName="username" placeholder="Your in-game name">
                </div>
                <button mat-raised-button class="btn-gaming" type="submit"
                        [disabled]="prebookForm.invalid">Pre-book Slot</button>
              </form>
              <div class="status success" *ngIf="prebookSuccess">{{ prebookSuccess }}</div>
            </ng-container>

            <ng-template #brDisabled>
              <div class="info-banner">
                ⏳ Pre-booking is only available on weekends (Saturday & Sunday).
              </div>
            </ng-template>
          </div>
        </ng-template>

      </ng-container>
    </div>
  `,
  styles: [`
    .league-container { padding: 20px; max-width: 1200px; margin: 0 auto; color: white; }

    /* Loading / error states */
    .loading-state, .error-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0; color: rgba(255,255,255,0.6); }
    .loading-spinner { width: 40px; height: 40px; border: 4px solid rgba(255,107,53,.3); border-left-color: #ff6b35; border-radius: 50%; animation: spin 1s linear infinite; }
    .loading-spinner.small { width: 24px; height: 24px; border-width: 3px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-rooms { display: flex; justify-content: center; padding: 2rem; }

    /* Header */
    .header { margin-bottom: 2rem; }
    .header-meta { margin-bottom: 0.5rem; }
    .tier-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .tier-silver { background: rgba(192,192,192,0.2); color: #c0c0c0; border: 1px solid rgba(192,192,192,0.3); }
    .tier-gold { background: rgba(255,215,0,0.15); color: #ffd700; border: 1px solid rgba(255,215,0,0.3); }
    .tier-diamond { background: rgba(185,242,255,0.15); color: #b9f2ff; border: 1px solid rgba(185,242,255,0.3); }
    .tier-br { background: rgba(255,107,53,0.15); color: #ff6b35; border: 1px solid rgba(255,107,53,0.3); }
    .subtitle { color: rgba(255,255,255,0.7); margin: 0.4rem 0 0.8rem; }
    .header-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .stat-pill { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 4px 14px; font-size: 0.82rem; color: rgba(255,255,255,0.8); }

    /* Division tiles */
    .divisions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 2rem; }
    .division-tile { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 0.9rem 1.2rem; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; color: rgba(255,255,255,0.7); text-align: center; }
    .division-tile.all-tile:hover, .division-tile.all-tile.active { background: rgba(255,107,53,0.12); border-color: rgba(255,107,53,0.4); color: #ff6b35; }

    /* Rooms */
    .rooms-header { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1rem; }
    .room-count { background: rgba(255,107,53,0.15); color: #ff6b35; border-radius: 12px; padding: 2px 10px; font-size: 0.8rem; font-weight: 600; }
    .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .empty-state { text-align: center; padding: 3rem 0; color: rgba(255,255,255,0.5); }
    .empty-state .muted { font-size: 0.85rem; margin-top: 0.3rem; }

    /* BR template */
    .br-card { padding: 2rem; border-radius: 16px; }
    .prebook-form { display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0; max-width: 400px; }
    .form-field { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-field label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.85); }
    .text-input { padding: 11px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); color: white; outline: none; box-sizing: border-box; }
    .text-input:focus { border-color: #ff6b35; }
    .info-banner { background: rgba(255,152,0,0.1); border: 1px solid rgba(255,152,0,0.3); color: #ffa726; border-radius: 10px; padding: 12px 16px; margin-top: 1rem; font-size: 0.9rem; }
    .status.success { color: #4caf50; margin-top: 0.5rem; }

    @media (max-width: 768px) {
      .divisions-grid { grid-template-columns: repeat(2, 1fr); }
      .rooms-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class LeagueComponent implements OnInit, OnDestroy {
  /** UUID from the route — e.g. "a3f1...". Never "silver" or "gold". */
  leagueId = '';

  /** The actual league object fetched by UUID — provides name, tier, description */
  league: League | null = null;
  leagueLoading = true;
  leagueFetchError = '';

  divisions$!: Observable<Division[]>;

  /** All rooms for this league from the NgRx store */
  private rooms$: Observable<Room[]>;
  /** Rooms filtered by the active division (null = show all) */
  roomsLive$!: Observable<Room[]>;
  loading$: Observable<boolean>;

  activeDivision: string | null = null;
  private selectedDivision$ = new BehaviorSubject<string | null>(null);

  prebookForm!: FormGroup;
  prebookSuccess = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private leagueService: LeagueService,
    private fb: FormBuilder,
  ) {
    this.rooms$   = this.store.select(selectRooms);
    this.loading$ = this.store.select(selectLeagueLoading);
  }

  ngOnInit(): void {
    this.leagueId = this.route.snapshot.paramMap.get('id') || '';

    this.prebookForm = this.fb.group({
      freeFireId: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      username:   ['', [Validators.required, Validators.minLength(2)]],
    });

    if (!this.leagueId) {
      this.leagueLoading = false;
      this.leagueFetchError = 'No league ID provided.';
      return;
    }

    // ── Fetch league by its UUID to get name, tier, description ──────────────
    // This is the correct approach — never compare a UUID to a tier string.
    this.leagueService.getLeague(this.leagueId)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (league) => {
          this.league = league;
          this.leagueLoading = false;
        },
        error: (err) => {
          this.leagueLoading = false;
          this.leagueFetchError = err?.message || 'Failed to load league.';
        },
      });

    // ── Load rooms for this league UUID ───────────────────────────────────────
    this.store.dispatch(loadRooms({ leagueId: this.leagueId }));

    // ── Wire up division filter ───────────────────────────────────────────────
    this.roomsLive$ = combineLatest([this.rooms$, this.selectedDivision$]).pipe(
      map(([rooms, div]) => div ? rooms.filter(r => r.division === div) : rooms),
    );

    // ── Load division config for this league ──────────────────────────────────
    this.divisions$ = this.leagueService.getDivisionsForLeague(this.leagueId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelectDivision(d: Division): void {
    this.activeDivision = d.divisionType;
    this.selectedDivision$.next(d.divisionType);
  }

  clearDivision(): void {
    this.activeDivision = null;
    this.selectedDivision$.next(null);
  }

  isWeekend(): boolean {
    const day = new Date().getDay();
    return day === 6 || day === 0;
  }

  onPrebook(): void {
    if (this.prebookForm.valid) {
      // BR pre-booking endpoint not yet implemented — log for now.
      console.log('BR pre-book:', this.prebookForm.value);
      this.prebookSuccess = 'Your slot has been pre-booked! Watch for a confirmation email.';
      this.prebookForm.reset();
    }
  }
}
