import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Division } from '../../../core/models/league.model';

@Component({
  selector: 'app-division-tile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="division-tile">
      <div class="division-header">
        <h3>{{ division.name }}</h3>
      </div>
      <div class="division-body">
        <div class="line">
          <mat-icon>monetization_on</mat-icon>
          <span>{{ division.entryFeeLabel }}</span>
        </div>
        <div class="line">
          <mat-icon>emoji_events</mat-icon>
          <span>{{ division.rewardsLabel }}</span>
        </div>
      </div>
      <div class="division-actions">
        <button mat-raised-button class="join-btn" (click)="onSelect()">
          <mat-icon>play_arrow</mat-icon>
          Select
        </button>
      </div>
    </mat-card>
  `,
  styles: [`
    .division-tile {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      transition: all 0.3s ease;
    }
    .division-tile:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }
    .division-header h3 {
      margin: 0;
      color: #ff6b35;
      font-weight: bold;
    }
    .division-body {
      display: grid;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.85);
    }
    .division-actions {
      margin-top: 0.75rem;
    }
    .join-btn {
      width: 100%;
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      border-radius: 25px;
      font-weight: bold;
      text-transform: uppercase;
    }
  `]
})
export class DivisionTileComponent {
  @Input() division!: Division;
  @Input() select?: (d: Division) => void;

  onSelect() {
    if (this.select) this.select(this.division);
  }
}
