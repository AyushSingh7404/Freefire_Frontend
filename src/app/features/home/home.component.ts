import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { League } from '../../core/models/league.model';
import { LeagueCardComponent } from '../../shared/components/league-card/league-card.component';
import { selectLeagues, selectLeagueLoading } from '../../store/league/league.selectors';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { loadLeagues } from '../../store/league/league.actions';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    LeagueCardComponent
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>
              Dominate the 
              <span class="highlight">Battle Royale</span>
            </h1>
            <p>
              Join the ultimate Free Fire tournament experience. 
              Compete with players worldwide and win amazing prizes.
            </p>
            <div class="hero-actions" *ngIf="!(isAuthenticated$ | async)">
              <button mat-raised-button routerLink="/auth/register" class="primary-btn">
                Start Playing
              </button>
              <button mat-button routerLink="/auth/login" class="secondary-btn">
                Login
              </button>
            </div>
          </div>
          <div class="hero-image">
            <img src="https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600" 
                 alt="Gaming Setup">
          </div>
        </div>
      </section>

      <!-- Leagues Section -->
      <section class="leagues-section">
        <div class="section-header">
          <h2>Choose Your League</h2>
          <p>Select from three competitive tiers based on your skill level</p>
        </div>
        
        <div class="leagues-grid" *ngIf="!(leagueLoading$ | async); else loadingTemplate">
          <app-league-card 
            *ngFor="let league of leagues$ | async" 
            [league]="league">
          </app-league-card>
        </div>
        
        <ng-template #loadingTemplate>
          <div class="loading-container">
            <div class="loading-spinner"></div>
          </div>
        </ng-template>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="section-header">
          <h2>Why Choose FireEsports?</h2>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <h3>Competitive Tournaments</h3>
            <p>Join daily tournaments with real prizes and climb the leaderboards</p>
          </div>
          
          <div class="feature-card">
            <h3>Secure Payments</h3>
            <p>Safe and encrypted transactions with multiple payment options</p>
          </div>
          
          <div class="feature-card">
            <h3>Real-time Updates</h3>
            <p>Live match updates and instant notifications for all your games</p>
          </div>
          
          <div class="feature-card">
            <h3>Community Driven</h3>
            <p>Connect with fellow gamers and build your esports network</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 50vh;
      color: white;
    }
    
    .hero-section {
      min-height: 50vh;
      display: flex;
      align-items: center;
      padding: 2rem;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
    }
    
    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }
    
    .hero-text h1 {
      font-size: 3.5rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }
    
    .highlight {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-text p {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .hero-actions {
      display: flex;
      gap: 1rem;
    }
    
    .primary-btn {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      border-radius: 25px;
      padding: 12px 32px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .secondary-btn {
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 25px;
      padding: 12px 32px;
      font-weight: bold;
    }
    
    .hero-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .leagues-section,
    .features-section {
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .section-header h2 {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #ff6b35;
    }
    
    .section-header p {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .leagues-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }
    
    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-10px);
    }
    
    .feature-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ff6b35;
      margin-bottom: 1rem;
    }
    
    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      color: white;
    }
    
    .feature-card p {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 107, 53, 0.3);
      border-left-color: #ff6b35;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
      }
      
      .hero-text h1 {
        font-size: 2.2rem;
      }
      
      .hero-section {
        padding: 1rem;
      }
      
      .hero-image img {
        height: 220px;
      }
      
      .leagues-grid {
        grid-template-columns: 1fr;
      }
      
      .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      
      .section-header h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  leagues$: Observable<League[]>;
  leagueLoading$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;

  constructor(private store: Store) {
    this.leagues$ = this.store.select(selectLeagues);
    this.leagueLoading$ = this.store.select(selectLeagueLoading);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit() {
    this.store.dispatch(loadLeagues());
  }
}
