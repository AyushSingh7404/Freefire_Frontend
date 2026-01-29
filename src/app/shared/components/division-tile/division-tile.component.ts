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
      <div class="thumb"></div>
      <div class="title">{{ division.name }}</div>
      <div class="meta">
        <div class="left">{{ division.entryFeeLabel }}</div>
        <div class="right">{{ division.rewardsLabel }}</div>
      </div>
      <button mat-raised-button class="join-btn" (click)="onSelect()">SELECT</button>
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
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .division-tile:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }
    .thumb {
      width: 100%;
      height: 100px;
      border-radius: 12px;
      background: radial-gradient(ellipse at center, rgba(255, 107, 53, 0.35), rgba(25,25,55,0.6) 60%), 
                  linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      border: 1px solid rgba(255,255,255,0.12);
    }
    .title {
      text-align: center;
      font-weight: 700;
      color: #ff6b35;
      font-size: 1.25rem;
      margin-top: 2px;
    }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      align-items: center;
      color: rgba(255,255,255,0.9);
    }
    .left { text-align: left; }
    .right { text-align: right; }
    .join-btn {
      width: 160px;
      align-self: center;
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
