import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { selectCurrentUser, selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { selectWalletBalance } from '../../../store/wallet/wallet.selectors';
import { logout } from '../../../store/auth/auth.actions';
import { loadWallet } from '../../../store/wallet/wallet.actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-content">
        <div class="navbar-brand" routerLink="/">
          <h2>🔥 FireEsports</h2>
        </div>
        
        <nav class="navbar-nav" *ngIf="isAuthenticated$ | async">
          <a routerLink="/leaderboard" routerLinkActive="active">Leaderboard</a>
        </nav>
        
        <div class="navbar-actions">
          <div *ngIf="isAuthenticated$ | async; else authButtons" class="user-section">
            <div class="wallet-balance" routerLink="/wallet">
              <mat-icon>account_balance_wallet</mat-icon>
              <span>{{ walletBalance$ | async | number:'1.0-0' }} coins</span>
            </div>
            
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
              <img [src]="(currentUser$ | async)?.avatar || '/assets/default-avatar.png'" 
                   class="user-avatar" 
                   [alt]="(currentUser$ | async)?.username">
              <span>{{ (currentUser$ | async)?.username }}</span>
              <mat-icon>keyboard_arrow_down</mat-icon>
            </button>
            
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item routerLink="/wallet">
                <mat-icon>account_balance_wallet</mat-icon>
                <span>Wallet</span>
              </button>
              <div *ngIf="(currentUser$ | async)?.isAdmin">
                <!-- <mat-divider></mat-divider> -->
                <button mat-menu-item routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon>
                  <span>Admin Panel</span>
                </button>
              </div>
              <!-- <mat-divider></mat-divider> -->
              <button mat-menu-item (click)="onLogout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
          
          <ng-template #authButtons>
            <button mat-button routerLink="/auth/login" class="auth-btn">Login</button>
            <button mat-raised-button routerLink="/auth/register" class="auth-btn primary">Sign Up</button>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(15, 15, 35, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      height: 80px;
    }
    
    .navbar-content {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
    }
    
    .navbar-brand h2 {
      color: #ff6b35;
      margin: 0;
      cursor: pointer;
      font-weight: bold;
    }
    
    .navbar-nav {
      display: flex;
      gap: 2rem;
    }
    
    .navbar-nav a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .navbar-nav a:hover,
    .navbar-nav a.active {
      color: #ff6b35;
    }
    
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .user-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .wallet-balance {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      transition: transform 0.2s ease;
      text-decoration: none;
      font-weight: 500;
    }
    
    .wallet-balance:hover {
      transform: translateY(-2px);
    }
    
    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 25px;
      padding: 0.5rem 1rem;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ff6b35;
    }
    
    .auth-btn {
      color: white;
      border-radius: 25px;
      padding: 0.5rem 1.5rem;
    }
    
    .auth-btn.primary {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
    }
    
    @media (max-width: 768px) {
      .navbar-content {
        padding: 0 1rem;
      }
      
      .navbar-nav {
        display: none;
      }
      
      .wallet-balance span {
        display: none;
      }
      
      .user-menu-trigger span {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  walletBalance$: Observable<number>;

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.walletBalance$ = this.store.select(selectWalletBalance);
  }

  ngOnInit() {
    this.store.dispatch(loadWallet());
  }

  onLogout() {
    this.store.dispatch(logout());
    this.router.navigate(['/']);
  }
}