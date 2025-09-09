import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Room } from '../../../core/models/league.model';

@Component({
  selector: 'app-room-tile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressBarModule
  ],
  template: `
    <mat-card class="room-tile" [class.closed]="room.status === 'closed'">
      <mat-card-header>
        <mat-card-title>{{ room.name }}</mat-card-title>
        <mat-card-subtitle>
          <span class="status-badge" [class]="'status-' + room.status">
            {{ room.status | titlecase }}
          </span>
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="room-info">
          <div class="info-item">
            <mat-icon>monetization_on</mat-icon>
            <span>{{ room.entryFee }} coins</span>
          </div>
          
          <div class="info-item">
            <mat-icon>schedule</mat-icon>
            <span>{{ room.startsAt | date:'short' }}</span>
          </div>
        </div>
        
        <div class="players-progress">
          <div class="progress-info">
            <span>Players: {{ room.currentPlayers }}/{{ room.maxPlayers }}</span>
            <span>{{ getProgressPercentage() }}%</span>
          </div>
          <mat-progress-bar 
            mode="determinate" 
            [value]="getProgressPercentage()"
            [color]="getProgressColor()">
          </mat-progress-bar>
        </div>
        
        <div *ngIf="room.roomId" class="room-id">
          <strong>Room ID: {{ room.roomId }}</strong>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-raised-button 
                [routerLink]="['/room', room.id]"
                class="join-btn"
                [disabled]="room.status === 'closed' || room.currentPlayers >= room.maxPlayers">
          <mat-icon>{{ room.status === 'closed' ? 'lock' : 'play_arrow' }}</mat-icon>
          {{ getButtonText() }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .room-tile {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      color: white;
    }
    
    .room-tile:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }
    
    .room-tile.closed {
      opacity: 0.6;
    }
    
    .mat-mdc-card-header {
      padding: 1rem 1rem 0.5rem 1rem;
    }
    
    .mat-mdc-card-title {
      color: #ff6b35;
      font-weight: bold;
      font-size: 1.2rem;
    }
    
    .mat-mdc-card-subtitle {
      margin-top: 0.5rem;
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-open {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
      border: 1px solid #4caf50;
    }
    
    .status-closed {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
      border: 1px solid #f44336;
    }
    
    .status-in-progress {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
      border: 1px solid #ffc107;
    }
    
    .room-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .info-item mat-icon {
      color: #ff6b35;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .players-progress {
      margin: 1rem 0;
    }
    
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .room-id {
      margin-top: 1rem;
      padding: 0.5rem;
      background: rgba(255, 107, 53, 0.1);
      border-radius: 8px;
      text-align: center;
      color: #ff6b35;
    }
    
    .join-btn {
      width: 100%;
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      border-radius: 25px;
      font-weight: bold;
      text-transform: uppercase;
      transition: all 0.3s ease;
    }
    
    .join-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
    }
    
    .join-btn:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.5);
    }
    
    .join-btn mat-icon {
      margin-right: 0.5rem;
    }
  `]
})
export class RoomTileComponent {
  @Input() room!: Room;

  getProgressPercentage(): number {
    return Math.round((this.room.currentPlayers / this.room.maxPlayers) * 100);
  }

  getProgressColor(): 'primary' | 'accent' | 'warn' {
    const percentage = this.getProgressPercentage();
    if (percentage < 50) return 'primary';
    if (percentage < 80) return 'accent';
    return 'warn';
  }

  getButtonText(): string {
    if (this.room.status === 'closed') return 'Room Closed';
    if (this.room.currentPlayers >= this.room.maxPlayers) return 'Room Full';
    return 'Join Room';
  }
}