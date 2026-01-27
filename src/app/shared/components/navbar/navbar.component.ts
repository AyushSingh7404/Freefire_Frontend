import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule } from 'lucide-angular';
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
    MatIconModule,
    LucideAngularModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-content">
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
            <button mat-menu-item routerLink="/admin">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Admin Panel</span>
            </button>
          </div>
          <button mat-menu-item (click)="onLogout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
        <div class="left-cluster">
          <div class="medal-icon">
            <img src="/assets/medals/ruby.png" alt="Rank" />
          </div>
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
            <lucide-icon name="user" class="icon"></lucide-icon>
            <span>{{ (currentUser$ | async)?.username || 'Guest' }}</span>
          </button>
          <div class="wallet-balance" routerLink="/wallet">
            <lucide-icon name="coins" class="icon"></lucide-icon>
            <span>{{ walletBalance$ | async | number:'1.0-0' }}</span>
            <lucide-icon name="plus" class="icon"></lucide-icon>
          </div>
        </div>
        
        <div class="brand" routerLink="/">
          <h2>Firesports</h2>
        </div>
        
        <div class="center-actions hide-mobile">
          <a class="icon-link" routerLink="/leaderboard" routerLinkActive="active">
            <lucide-icon name="trophy" class="icon"></lucide-icon>
          </a>
          <a class="icon-link" routerLink="/history" routerLinkActive="active">
            <lucide-icon name="history" class="icon"></lucide-icon>
          </a>
        </div>
        
        <div class="navbar-actions">
          <div *ngIf="isAuthenticated$ | async; else authButtons" class="user-section"></div>
          
          <ng-template #authButtons>
            <button mat-button routerLink="/auth/login" class="auth-btn">
              <span class="hide-mobile">Login</span>
            </button>
            <button mat-raised-button routerLink="/auth/register" class="auth-btn primary">
              <span class="hide-mobile">Sign Up</span>
            </button>
          </ng-template>
          
          <button mat-icon-button class="hamburger">
            <lucide-icon name="menu" class="icon"></lucide-icon>
          </button>
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
    
    .brand h2 { color: #ff6b35; margin: 0; cursor: pointer; font-weight: bold; }
    
    .left-cluster { display: flex; align-items: center; gap: 0.75rem; }
    .medal-icon img { width: 36px; height: 36px; }
    
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
    
    .user-menu-trigger { display: flex; align-items: center; gap: 0.5rem; color: white; background: rgba(255,255,255,0.1); border-radius: 25px; padding: 0.5rem 1rem; }
    
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
      .navbar {
        height: 64px;
      }
      .navbar-content {
        padding: 0 1rem;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .brand h2 {
        font-size: 1.25rem;
      }
      .center-actions { display: none; }
      .medal-icon { display: none; }
      .wallet-balance {
        padding: 0.25rem 0.75rem;
      }
      .wallet-balance span {
        display: none;
      }
      .user-menu-trigger {
        padding: 0.25rem 0.5rem;
      }
      .user-menu-trigger span {
        display: none;
      }
      .auth-btn {
        padding: 0.25rem 0.5rem;
        min-width: 40px;
      }
      .auth-btn .mat-icon {
        margin: 0;
      }
    }
    .icon { width: 20px; height: 20px; color: white; }
    .icon-link { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 20px; background: rgba(255,255,255,0.08); }
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
