import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule } from 'lucide-angular';
import { Division } from '../../../core/models/league.model';

@Component({
  selector: 'app-division-tile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, LucideAngularModule],
  template: `
    <mat-card class="division-tile">
      <div class="thumb"></div>
      <div class="title">{{ division.name }}</div>
      <div class="meta">
        <div class="labels">
          <span>Entry:</span>
          <span class="right">{{ isKillMode ? (killAmount + ' coins/kill;') : 'Winner:' }}</span>
        </div>
        <div class="values">
          <div class="left">
            <span class="num">{{ entryAmount }}</span>
            <lucide-icon name="coins" class="coin"></lucide-icon>
            <span class="extra" *ngIf="entryEach">/each</span>
          </div>
          <div class="right" *ngIf="!isKillMode">
            <span class="num">{{ winnerAmount }}</span>
            <lucide-icon name="coins" class="coin"></lucide-icon>
            <span class="extra" *ngIf="winnerEach">/each</span>
          </div>
          <div class="right" *ngIf="isKillMode">
            <span class="mvp">MVP: </span>
            <span class="num">{{ mvpAmount }}</span>
            <lucide-icon name="coins" class="coin"></lucide-icon>
          </div>
        </div>
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
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: rgba(255,255,255,0.9);
    }
    .labels { display: grid; grid-template-columns: 1fr 1fr; }
    .values { display: grid; grid-template-columns: 1fr 1fr; align-items: center; }
    .left { text-align: left; display: inline-flex; align-items: center; gap: 6px; }
    .right { text-align: right; display: inline-flex; align-items: center; gap: 6px; justify-content: flex-end; }
    .coin { width: 16px; height: 16px; color: #f7931e; }
    .num { font-weight: 700; }
    .mvp { opacity: 0.9; margin-right: 4px; }
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

  get isKillMode(): boolean {
    return this.division?.id === '3v3' || this.division?.id === '4v4';
  }

  get entryAmount(): number {
    const m = this.division?.entryFeeLabel?.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  get entryEach(): boolean {
    return this.division?.id === '2v2' || this.division?.id === '3v3' || this.division?.id === '4v4';
  }

  get winnerAmount(): number {
    const m = this.division?.rewardsLabel?.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  get winnerEach(): boolean {
    return this.division?.id === '2v2';
  }

  get killAmount(): number {
    const nums = this.division?.rewardsLabel?.match(/(\d+)/g);
    return nums && nums.length ? parseInt(nums[0], 10) : 0;
  }

  get mvpAmount(): number {
    const nums = this.division?.rewardsLabel?.match(/(\d+)/g);
    return nums && nums.length > 1 ? parseInt(nums[1], 10) : 0;
  }
}
