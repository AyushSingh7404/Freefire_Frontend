import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { League } from '../../../core/models/league.model';

@Component({
  selector: 'app-league-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="league-card" [class]="'league-' + league.tier">
      <div class="league-image">
        <img [src]="league.image" [alt]="league.name">
        <div class="league-overlay">
          <div class="league-tier">{{ league.tier | titlecase }}</div>
        </div>
      </div>
      
      <mat-card-content class="league-content">
        <h3>{{ league.name }}</h3>
        <p class="league-description">{{ league.description }}</p>
        
        <div class="league-stats">
          <div class="stat">
            <span>{{ league.entryFee }} coins</span>
          </div>
          <div class="stat">
            <span>Max {{ league.maxPlayers }}</span>
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions class="league-actions">
        <button mat-raised-button 
                [routerLink]="['/league', league.id]"
                class="join-btn"
                [disabled]="!league.isActive">
          Join League
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .league-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
    }
    
    .league-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .league-card.league-silver {
      border-color: rgba(192, 192, 192, 0.3);
    }
    
    .league-card.league-gold {
      border-color: rgba(255, 215, 0, 0.3);
    }
    
    .league-card.league-diamond {
      border-color: rgba(185, 242, 255, 0.3);
    }
    
    .league-card.league-br {
      border-color: rgba(255, 107, 53, 0.4);
    }
    
    .league-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    
    .league-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .league-card:hover .league-image img {
      transform: scale(1.1);
    }
    
    .league-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7));
      display: flex;
      align-items: flex-end;
      padding: 1rem;
    }
    
    .league-tier {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.875rem;
    }
    
    .league-content {
      padding: 1.5rem;
      color: white;
    }
    
    .league-content h3 {
      margin: 0 0 0.5rem 0;
      color: #ff6b35;
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .league-description {
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }
    
    .league-stats {
      display: flex;
      gap: 1rem;
    }
    
    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }
    
    .stat mat-icon {
      color: #ff6b35;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .league-actions {
      padding: 0 1.5rem 1.5rem 1.5rem;
    }
    
    .join-btn {
      width: 100%;
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      border-radius: 25px;
      padding: 12px 24px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
export class LeagueCardComponent {
  @Input() league!: League;
}
