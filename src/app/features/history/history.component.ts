import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatchService } from '../../core/services/match.service';
import { Match } from '../../core/models/match.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="container">
      <h2 class="gradient-text">Matches History</h2>
      <div class="grid">
        <mat-card class="glass" *ngFor="let m of matches">
          <div class="row">
            <strong>{{ m.roomName }}</strong>
            <span class="ml-auto">{{ m.playedAt | date:'short' }}</span>
          </div>
          <div class="row">
            <span>{{ m.leagueId | titlecase }} • {{ m.division }}</span>
            <span class="ml-auto">{{ m.result | titlecase }}</span>
          </div>
          <div class="row">
            <span>Kills: {{ m.kills }}</span>
            <span class="ml-auto">Coins: {{ m.coinsWon }}</span>
          </div>
        </mat-card>
      </div>

      <div class="load-more" *ngIf="!endOfList">
        <button mat-raised-button class="btn-gaming" (click)="loadMore()" [disabled]="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>

      <div class="empty-state" *ngIf="!loading && matches.length === 0">
        No matches played yet.
      </div>
      <div class="error-msg" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
    .row { display: flex; align-items: baseline; gap: 0.5rem; color: white; }
    .ml-auto { margin-left: auto; }
    .load-more { display: flex; justify-content: center; margin: 1.5rem 0; }
    .empty-state { color: rgba(255,255,255,0.6); text-align: center; margin-top: 1rem; }
    .error-msg { color: #f44336; margin-top: 1rem; text-align: center; }
  `]
})
export class HistoryComponent implements OnInit {
  matches: Match[] = [];
  page = 1;
  readonly limit = 10;
  loading = false;
  endOfList = false;
  error = '';

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.loadMore();
  }

  loadMore() {
    if (this.loading || this.endOfList) return;
    this.loading = true;
    this.error = '';
    this.matchService.getHistory(this.page, this.limit).subscribe({
      next: (data) => {
        this.matches = [...this.matches, ...data];
        if (data.length < this.limit) this.endOfList = true;
        this.page += 1;
      },
      error: (err) => { this.error = err.message || 'Failed to load history'; },
      complete: () => { this.loading = false; }
    });
  }
}
