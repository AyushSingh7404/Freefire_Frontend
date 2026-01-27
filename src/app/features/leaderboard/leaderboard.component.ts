import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadGlobalLeaderboard, loadLeagueLeaderboard } from '../../store/leaderboard/leaderboard.actions';
import { selectGlobalLeaderboard, selectLeagueLeaderboard } from '../../store/leaderboard/leaderboard.selectors';
import { LeaderboardEntry } from '../../core/models/leaderboard.model';
import { LeaderboardEntryComponent } from '../../shared/components/leaderboard-entry/leaderboard-entry.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, LeaderboardEntryComponent],
  template: `
    <div class="container">
      <div class="grid">
        <div>
          <h2 class="gradient-text">Global Leaderboard</h2>
          <div class="entries">
            <app-leaderboard-entry 
              *ngFor="let e of global$ | async" 
              [entry]="e">
            </app-leaderboard-entry>
          </div>
        </div>
        <div>
          <h2 class="gradient-text">League Leaderboards</h2>
          <div class="filters">
            <button mat-raised-button class="btn-gaming" (click)="loadLeague('silver')">Silver</button>
            <button mat-raised-button class="btn-gaming" (click)="loadLeague('gold')">Gold</button>
            <button mat-raised-button class="btn-gaming" (click)="loadLeague('diamond')">Diamond</button>
          </div>
          <div class="entries" *ngIf="leagueEntries$ | async as entries">
            <app-leaderboard-entry 
              *ngFor="let e of entries.entries" 
              [entry]="e">
            </app-leaderboard-entry>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .entries {
      display: grid;
      gap: 0.75rem;
    }
    .filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  global$: Observable<LeaderboardEntry[]>;
  leagueEntries$!: Observable<{ leagueId: string; leagueName: string; entries: LeaderboardEntry[] } | undefined>;

  constructor(private store: Store) {
    this.global$ = this.store.select(selectGlobalLeaderboard);
    this.leagueEntries$ = this.store.select(selectLeagueLeaderboard('silver'));
  }

  ngOnInit(): void {
    this.store.dispatch(loadGlobalLeaderboard());
    this.store.dispatch(loadLeagueLeaderboard({ leagueId: 'silver' }));
  }

  loadLeague(id: string) {
    this.store.dispatch(loadLeagueLeaderboard({ leagueId: id }));
    this.leagueEntries$ = this.store.select(selectLeagueLeaderboard(id));
  }
}
