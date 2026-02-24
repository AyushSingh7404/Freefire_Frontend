import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { LeaderboardEntry } from '../../../core/models/leaderboard.model';

@Component({
  selector: 'app-leaderboard-entry',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="leaderboard-entry">
      <div class="rank">{{ entry.rank }}</div>
      <div class="user">
        <img [src]="entry.avatarUrl || '/assets/default-avatar.png'" alt="{{ entry.username }}">
        <div>
          <div class="name">{{ entry.username }}</div>
          <div class="stats">Winnings: {{ entry.totalWinnings }} • Win rate: {{ entry.winRate }}%</div>
        </div>
      </div>
      <div class="points">{{ entry.points }}</div>
    </mat-card>
  `,
  styles: [`
    .leaderboard-entry {
      display: grid;
      grid-template-columns: 80px 1fr 100px;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    }
    .rank {
      font-size: 1.75rem;
      color: #ff6b35;
      text-align: center;
    }
    .user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #ff6b35;
      object-fit: cover;
    }
    .name {
      font-weight: 600;
    }
    .stats {
      color: rgba(255,255,255,0.75);
      font-size: 0.85rem;
    }
    .points {
      text-align: right;
      font-weight: bold;
      color: #f7931e;
    }
  `]
})
export class LeaderboardEntryComponent {
  @Input() entry!: LeaderboardEntry;
}
