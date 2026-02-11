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
    MatIconModule,
    LucideAngularModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-content">
        <div class="left-cluster" *ngIf="isAuthenticated$ | async">
          <div class="medal-icon">
            <img src="/assets/navbar/Diamond_rank.png" alt="Rank" />
          </div>
          <button mat-button (click)="goToProfile()" class="user-menu-trigger">
            <lucide-icon name="user" class="icon"></lucide-icon>
            <span>{{ (currentUser$ | async)?.username || 'Guest' }}</span>
          </button>
          <div class="wallet-balance" (click)="openCoinShop()">
            <lucide-icon name="coins" class="icon"></lucide-icon>
            <span>{{ walletBalance$ | async | number:'1.0-0' }}</span>
            <lucide-icon name="plus" class="icon"></lucide-icon>
          </div>
        </div>
        
        <div class="brand" routerLink="/">
          <h2>Firesports</h2>
        </div>

        
        <div class="navbar-actions">
          <div class="right-icons" *ngIf="isAuthenticated$ | async">
            <a class="icon-link" routerLink="/leaderboard" routerLinkActive="active">
              <lucide-icon name="trophy" class="icon"></lucide-icon>
            </a>
            <a class="icon-link" routerLink="/history" routerLinkActive="active">
              <lucide-icon name="history" class="icon"></lucide-icon>
            </a>
          </div>
          <div *ngIf="isAuthenticated$ | async; else authButtons" class="user-section"></div>
          
          <ng-template #authButtons>
            <button mat-button routerLink="/auth/login" class="auth-btn">
              <span class="hide-mobile">Login</span>
            </button>
            <button mat-raised-button routerLink="/auth/register" class="auth-btn primary">
              <span class="hide-mobile">Sign Up</span>
            </button>
          </ng-template>
          
          <button mat-icon-button class="hamburger" (click)="toggleSidebar()">
            <lucide-icon name="menu" class="icon"></lucide-icon>
          </button>
        </div>
      </div>
      
      <div class="overlay" *ngIf="sidebarOpen" (click)="closeOverlays()">
        <div class="sidebar" (click)="$event.stopPropagation()">
          <div class="sidebar-header">
            <span>Menu</span>
          </div>
          <ng-container *ngIf="isAuthenticated$ | async; else loggedOutMenu">
            <button class="sidebar-item" (click)="goToProfile()">
              <lucide-icon name="user" class="icon"></lucide-icon>
              <span>Profile</span>
            </button>
            <button class="sidebar-item" (click)="openHelp()">
              <lucide-icon name="history" class="icon"></lucide-icon>
              <span>Help & Support</span>
            </button>
            <button class="sidebar-item" (click)="openTerms()">
              <lucide-icon name="history" class="icon"></lucide-icon>
              <span>Terms & Conditions</span>
            </button>
            <div class="sidebar-spacer"></div>
            <button class="sidebar-item danger" (click)="onLogout()">
              <span>Logout</span>
            </button>
          </ng-container>
          <ng-template #loggedOutMenu>
            <button class="sidebar-item" routerLink="/auth/login" (click)="closeOverlays()">
              <span>Login</span>
            </button>
            <button class="sidebar-item" (click)="openHelp()">
              <span>Help & Support</span>
            </button>
            <button class="sidebar-item" (click)="openTerms()">
              <span>Terms & Conditions</span>
            </button>
          </ng-template>
        </div>
      </div>
      
      <div class="overlay" *ngIf="coinShopOpen" (click)="closeOverlays()">
        <div class="coin-shop" (click)="$event.stopPropagation()">
          <h3>Buy Coins</h3>
          <div class="packages">
            <div class="package" *ngFor="let p of coinPackages">
              <div class="amount">
                <lucide-icon name="coins" class="icon"></lucide-icon>
                <span>{{ p.amount }}</span>
              </div>
              <div class="price">₹{{ p.price }}</div>
              <button class="buy-btn">Buy</button>
            </div>
          </div>
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
    
    .left-cluster { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
    .medal-icon img { width: 36px; height: 36px; }
    
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-left: auto;
    }
    .right-icons { display: inline-flex; align-items: center; gap: 0.5rem; }
    
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
        padding: 0 0.75rem;
        gap: 0.5rem;
        flex-wrap: nowrap;
      }
      .brand h2 {
        font-size: 1.25rem;
      }
      .center-actions { display: none; }
      .medal-icon img { width: 24px; height: 24px; }
      .wallet-balance {
        padding: 0.25rem 0.5rem;
        height: 28px;
        border-radius: 18px;
      }
      .wallet-balance span {
        display: inline;
        font-weight: 600;
      }
      .user-menu-trigger {
        padding: 0.25rem 0.5rem;
        height: 28px;
        border-radius: 18px;
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
      .navbar-actions {
        margin-left: 0;
      }
    }
    .icon { width: 20px; height: 20px; color: white; }
    .icon-link { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 20px; background: rgba(255,255,255,0.08); }
    
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(10,10,25,0.72);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      z-index: 1100;
    }
    .sidebar {
      width: 280px;
      height: 100%;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
      border-left: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      padding: 1rem;
      gap: 0.5rem;
    }
    .sidebar-header { color: white; font-weight: 600; margin-bottom: 0.5rem; }
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      cursor: pointer;
    }
    .sidebar-item.danger {
      color: #ff4d4f;
      border-color: rgba(255,77,79,0.4);
      background: rgba(255,77,79,0.1);
      margin-top: auto;
    }
    .sidebar-spacer { flex: 1 1 auto; }
    
    .coin-shop {
      width: 720px;
      max-width: 95vw;
      margin: 80px auto 2rem;
      background: #12122b;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 1rem 1.25rem;
      color: white;
      box-shadow: 0 20px 40px rgba(0,0,0,0.35);
    }
    .packages {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
      margin-top: 0.75rem;
    }
    .package {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .package .amount { display: flex; align-items: center; gap: 0.5rem; }
    .package .price { font-weight: 600; }
    .buy-btn {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      border-radius: 10px;
      padding: 0.4rem 0.75rem;
      border: none;
      cursor: pointer;
    }
    @media (max-width: 480px) {
      .packages { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .coin-shop { margin: 64px auto 1rem; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  walletBalance$: Observable<number>;
  sidebarOpen = false;
  coinShopOpen = false;
  coinPackages = [
    { amount: 100, price: 80 },
    { amount: 310, price: 250 },
    { amount: 520, price: 400 },
    { amount: 1060, price: 800 },
    { amount: 2180, price: 1600 },
    { amount: 5600, price: 4000 }
  ];

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

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openCoinShop() {
    this.coinShopOpen = true;
  }

  closeOverlays() {
    this.sidebarOpen = false;
    this.coinShopOpen = false;
  }

  openHelp() {
    this.sidebarOpen = false;
  }

  openTerms() {
    this.sidebarOpen = false;
  }

  onLogout() {
    this.closeOverlays();
    this.store.dispatch(logout());
    this.router.navigate(['/']);
  }
}
