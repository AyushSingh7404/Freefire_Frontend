import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { loadGlobalLeaderboard, loadLeagueLeaderboard } from '../../store/leaderboard/leaderboard.actions';
import { selectGlobalLeaderboard, selectLeagueLeaderboard, selectLeaderboardLoading, selectLeaderboardError } from '../../store/leaderboard/leaderboard.selectors';
import { selectLeagues } from '../../store/league/league.selectors';
import { loadLeagues } from '../../store/league/league.actions';
import { LeaderboardEntry } from '../../core/models/leaderboard.model';
import { LeaderboardEntryComponent } from '../../shared/components/leaderboard-entry/leaderboard-entry.component';
import { League } from '../../core/models/league.model';

type Tier = 'silver' | 'gold' | 'diamond';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, LeaderboardEntryComponent],
  template: `
    <div class="container">
      <div class="grid">

        <!-- Global leaderboard (left column) -->
        <div>
          <h2 class="gradient-text">Global Leaderboard</h2>
          <div *ngIf="loading$ | async" class="muted">Loading...</div>
          <div class="entries" *ngIf="!(loading$ | async)">
            <app-leaderboard-entry
              *ngFor="let e of global$ | async"
              [entry]="e">
            </app-leaderboard-entry>
            <div class="muted" *ngIf="(global$ | async)?.length === 0">No entries yet.</div>
          </div>
        </div>

        <!-- Per-league leaderboard (right column) -->
        <div>
          <h2 class="gradient-text">League Leaderboard</h2>

          <div class="filters">
            <button mat-raised-button class="btn-gaming"
                    [class.active]="activeTier === 'silver'"
                    [disabled]="!tierToId['silver']"
                    (click)="switchLeague('silver')">Silver</button>
            <button mat-raised-button class="btn-gaming"
                    [class.active]="activeTier === 'gold'"
                    [disabled]="!tierToId['gold']"
                    (click)="switchLeague('gold')">Gold</button>
            <button mat-raised-button class="btn-gaming"
                    [class.active]="activeTier === 'diamond'"
                    [disabled]="!tierToId['diamond']"
                    (click)="switchLeague('diamond')">Diamond</button>
          </div>

          <!-- Leagues not loaded yet -->
          <div class="muted" *ngIf="!leaguesLoaded">Loading leagues...</div>

          <!-- No league found for this tier -->
          <div class="muted"
               *ngIf="leaguesLoaded && !tierToId[activeTier]">
            No {{ activeTier }} league exists yet.
          </div>

          <!-- Leaderboard entries -->
          <ng-container *ngIf="leaguesLoaded && tierToId[activeTier]">
            <div *ngIf="loading$ | async" class="muted">Loading...</div>
            <div class="entries" *ngIf="!(loading$ | async)">
              <ng-container *ngIf="leagueEntries$ | async as data">
                <app-leaderboard-entry
                  *ngFor="let e of data?.entries"
                  [entry]="e">
                </app-leaderboard-entry>
                <div class="muted" *ngIf="!data || data.entries.length === 0">
                  No entries yet for this league.
                </div>
              </ng-container>
            </div>
          </ng-container>

          <div class="error-msg" *ngIf="error$ | async as err">{{ err }}</div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .entries { display: grid; gap: 0.75rem; }
    .filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .btn-gaming.active { box-shadow: 0 0 0 2px rgba(255,255,255,0.35) inset; filter: saturate(1.3); }
    .muted { color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-top: 0.5rem; }
    .error-msg { color: #f44336; margin-top: 0.5rem; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  global$!: Observable<LeaderboardEntry[]>;
  leagueEntries$!: Observable<{ leagueId: string; leagueName: string; entries: LeaderboardEntry[] } | undefined>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  activeTier: Tier = 'silver';
  /** Maps tier string -> actual league UUID */
  tierToId: Record<string, string> = {};
  leaguesLoaded = false;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.global$   = this.store.select(selectGlobalLeaderboard);
    this.loading$  = this.store.select(selectLeaderboardLoading);
    this.error$    = this.store.select(selectLeaderboardError);

    // Always show something while we wait for the UUID map.
    this.leagueEntries$ = this.store.select(selectLeagueLeaderboard('__pending__'));

    // Kick off global leaderboard immediately.
    this.store.dispatch(loadGlobalLeaderboard());

    // Make sure leagues are in store (home may have loaded them, but dispatch anyway).
    this.store.dispatch(loadLeagues());

    // Wait for leagues to arrive, then build the tier->UUID map and load the
    // default (silver) league leaderboard.
    this.store.select(selectLeagues).pipe(
      filter((leagues: League[]) => leagues.length > 0),
      take(1),
      takeUntil(this.destroy$),
    ).subscribe((leagues: League[]) => {
      // Build map: 'silver' -> UUID, 'gold' -> UUID, etc.
      for (const l of leagues) {
        if (l.tier === 'silver' || l.tier === 'gold' || l.tier === 'diamond') {
          this.tierToId[l.tier] = l.id;
        }
      }
      this.leaguesLoaded = true;

      // Load the initial tier using its real UUID.
      const initialId = this.tierToId[this.activeTier];
      if (initialId) {
        this.store.dispatch(loadLeagueLeaderboard({ leagueId: initialId }));
        this.leagueEntries$ = this.store.select(selectLeagueLeaderboard(initialId));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchLeague(tier: Tier): void {
    this.activeTier = tier;
    const id = this.tierToId[tier];
    if (!id) return; // button is disabled when tierToId[tier] is undefined, so this is a safety guard
    this.store.dispatch(loadLeagueLeaderboard({ leagueId: id }));
    // Re-point the observable so the template reflects the right slice of state.
    this.leagueEntries$ = this.store.select(selectLeagueLeaderboard(id));
  }
}
