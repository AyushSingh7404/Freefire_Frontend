import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatchService } from '../../core/services/match.service';
import { Observable } from 'rxjs';
import { Match } from '../../core/models/match.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container">
      <h2 class="gradient-text">Matches History</h2>
      <div class="grid">
        <mat-card class="glass" *ngFor="let m of history$ | async">
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
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
    .row { display: flex; align-items: baseline; gap: 0.5rem; color: white; }
    .ml-auto { margin-left: auto; }
  `]
})
export class HistoryComponent implements OnInit {
  history$!: Observable<Match[]>;
  constructor(private matchService: MatchService) {}
  ngOnInit(): void {
    this.history$ = this.matchService.getHistory();
  }
}
