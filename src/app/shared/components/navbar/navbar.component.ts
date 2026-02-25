import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { User } from '../../../core/models/user.model';
import { PaymentInitiateResponse } from '../../../core/models/wallet.model';
import { selectCurrentUser, selectIsAuthenticated, selectIsAdmin } from '../../../store/auth/auth.selectors';
import { selectWalletBalance, selectPendingOrder } from '../../../store/wallet/wallet.selectors';
import { logout } from '../../../store/auth/auth.actions';
import { loadWallet, initiatePayment, verifyPayment } from '../../../store/wallet/wallet.actions';
import { CoinPackage } from '../../../core/models/coin-package.model';
import { CoinPackagesService } from '../../../core/services/coin-packages.service';

declare var Razorpay: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  /*
   * IMPORTANT: The template root is a plain <div>, NOT <mat-toolbar>.
   * mat-toolbar applies overflow:hidden which clips the sidebar/coin-shop
   * overlays. By making the overlays siblings of <nav> (not children),
   * they render at the document level and work correctly on all screen sizes.
   */
  template: `
    <!-- ── Navbar bar ──────────────────────────────────────────────────── -->
    <nav class="navbar">
      <div class="bar-content">

        <!-- LEFT GROUP: logo + coins + brand text -->
        <div class="left-group">

          <!-- 1. Aurex logo image — always visible, links to home -->
          <a class="logo-link" routerLink="/" title="Home">
            <img src="/assets/navbar/Aurex-Esports.jpg" alt="Aurex" class="aurex-logo" />
          </a>

          <!-- 2. Coins pill — visible when logged in -->
          <div class="wallet-pill" *ngIf="isAuthenticated$ | async" (click)="openCoinShop()">
            <lucide-icon name="coins" class="icon"></lucide-icon>
            <span class="coins-num">{{ walletBalance$ | async | number:'1.0-0' }}</span>
            <lucide-icon name="plus" class="icon"></lucide-icon>
          </div>

          <!-- 3. AUREX brand text — always visible, links to home -->
          <a class="brand-text" routerLink="/">AUREX</a>
        </div>

        <!-- RIGHT GROUP: hamburger only -->
        <div class="right-group">
          <button class="hamburger" (click)="toggleSidebar()" aria-label="Open menu">
            <lucide-icon name="menu" class="icon"></lucide-icon>
          </button>
        </div>

      </div>
    </nav>

    <!-- ── SIDEBAR overlay — sibling of <nav>, NOT inside it ─────────── -->
    <div class="overlay" *ngIf="sidebarOpen" (click)="closeSidebar()">
      <aside class="sidebar" (click)="$event.stopPropagation()">

        <!-- Sidebar header: logo + close -->
        <div class="sidebar-header">
          <a class="logo-link" routerLink="/" (click)="closeSidebar()">
            <img src="/assets/navbar/Aurex-Esports.jpg" alt="Aurex" class="aurex-logo sidebar-logo" />
          </a>
          <button class="close-btn" (click)="closeSidebar()" aria-label="Close menu">✕</button>
        </div>

        <!-- ── Authenticated menu ── -->
        <ng-container *ngIf="isAuthenticated$ | async; else guestMenu">

          <!-- User info strip -->
          <div class="sidebar-user" *ngIf="currentUser$ | async as user">
            <div class="avatar-circle">
              <!-- Show uploaded avatar if available, else fallback icon -->
              <img *ngIf="user.avatarUrl"
                   [src]="user.avatarUrl"
                   [alt]="user.username"
                   class="avatar-img" />
              <lucide-icon *ngIf="!user.avatarUrl" name="user" class="icon-md"></lucide-icon>
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.username || 'Player' }}</div>
              <div class="user-balance">
                <lucide-icon name="coins" class="icon-sm"></lucide-icon>
                {{ walletBalance$ | async | number:'1.0-0' }} coins
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Nav items -->
          <button *ngIf="isAdmin$ | async" class="nav-item admin" (click)="goTo('/admin')">
            <lucide-icon name="shield" class="icon-md"></lucide-icon>
            <span>Admin Panel</span>
          </button>

          <button class="nav-item" (click)="goTo('/profile')">
            <lucide-icon name="user" class="icon-md"></lucide-icon>
            <span>My Profile</span>
          </button>

          <button class="nav-item" (click)="goTo('/leaderboard')">
            <lucide-icon name="trophy" class="icon-md"></lucide-icon>
            <span>Leaderboard</span>
          </button>

          <button class="nav-item" (click)="goTo('/history')">
            <lucide-icon name="history" class="icon-md"></lucide-icon>
            <span>Match History</span>
          </button>

          <button class="nav-item" (click)="openCoinShop()">
            <lucide-icon name="coins" class="icon-md"></lucide-icon>
            <span>Buy Coins</span>
          </button>

          <button class="nav-item" (click)="goTo('/wallet')">
            <lucide-icon name="wallet" class="icon-md"></lucide-icon>
            <span>Wallet</span>
          </button>

          <div class="spacer"></div>

          <button class="nav-item logout" (click)="onLogout()">
            <lucide-icon name="log-out" class="icon-md"></lucide-icon>
            <span>Logout</span>
          </button>
        </ng-container>

        <!-- ── Guest menu ── -->
        <ng-template #guestMenu>
          <div class="divider"></div>
          <button class="nav-item" (click)="goTo('/auth/login')">
            <lucide-icon name="log-in" class="icon-md"></lucide-icon>
            <span>Login</span>
          </button>
          <button class="nav-item highlight" (click)="goTo('/auth/register')">
            <lucide-icon name="user-plus" class="icon-md"></lucide-icon>
            <span>Sign Up</span>
          </button>
        </ng-template>

      </aside>
    </div>

    <!-- ── COIN SHOP overlay — also a sibling of <nav> ────────────────── -->
    <div class="overlay shop-overlay" *ngIf="coinShopOpen" (click)="closeCoinShop()">
      <div class="coin-shop" (click)="$event.stopPropagation()">
        <div class="shop-header">
          <h3>Buy Coins</h3>
          <button class="close-btn" (click)="closeCoinShop()">✕</button>
        </div>
        <div class="packages">
          <div class="shop-loading" *ngIf="packagesLoading">
            Loading packages…
          </div>
          <div class="package" *ngFor="let p of coinPackages">
            <div class="pkg-coins">
              <lucide-icon name="coins" class="icon"></lucide-icon>
              <span>{{ p.coins }}</span>
            </div>
            <div class="pkg-price">₹{{ p.priceInr }}</div>
            <button class="buy-btn" [disabled]="buying" (click)="onBuy(p)">
              {{ buying && activePkg === p.id ? '...' : 'Buy' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Host: allows overlays to escape the component box ──────────────── */
    :host {
      display: block;
      position: relative;
      z-index: 1000;
    }

    /* ── Navbar ──────────────────────────────────────────────────────────── */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0;
      height: 64px;
      background: rgba(13, 13, 30, 0.97);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 1000;
    }
    .bar-content {
      max-width: 1280px;
      margin: 0 auto;
      height: 100%;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ── Left group: logo | coins | brand text ───────────────────────────── */
    .left-group {
      display: flex;
      align-items: center;
      gap: .6rem;
      min-width: 0;
    }

    /* Logo image */
    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
    }
    .aurex-logo {
      height: 36px;
      width: 36px;
      border-radius: 8px;
      object-fit: cover;
      display: block;
    }

    /* Coins pill */
    .wallet-pill {
      display: flex;
      align-items: center;
      gap: .3rem;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #fff;
      padding: .32rem .75rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 700;
      font-size: .87rem;
      user-select: none;
      transition: transform .15s, opacity .15s;
      flex-shrink: 0;
    }
    .wallet-pill:hover { transform: translateY(-1px); opacity: .92; }
    .coins-num { min-width: 2ch; text-align: right; }

    /* Brand text */
    .brand-text {
      font-weight: 900;
      font-size: 1.15rem;
      letter-spacing: .12em;
      color: #ff6b35;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      transition: color .15s;
    }
    .brand-text:hover { color: #f7b261; }

    /* ── Right group ─────────────────────────────────────────────────────── */
    .right-group {
      display: flex;
      align-items: center;
      gap: .5rem;
      flex-shrink: 0;
    }

    /* Hamburger */
    .hamburger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      cursor: pointer;
      transition: background .15s;
      flex-shrink: 0;
    }
    .hamburger:hover { background: rgba(255, 255, 255, 0.13); }

    /* ── Icon sizes ──────────────────────────────────────────────────────── */
    .icon    { width: 17px; height: 17px; }
    .icon-sm { width: 13px; height: 13px; }
    .icon-md { width: 19px; height: 19px; }

    /* ── Shared overlay backdrop ─────────────────────────────────────────── */
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 1200;
      background: rgba(6, 6, 18, 0.78);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      /* sidebar slides in from the right */
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
    }
    /* coin shop uses a centred drop-down */
    .shop-overlay {
      align-items: flex-start;
      justify-content: center;
    }

    /* ── Sidebar ─────────────────────────────────────────────────────────── */
    .sidebar {
      width: min(300px, 88vw);
      height: 100%;
      background: linear-gradient(160deg, #0b0b1f 0%, #161630 100%);
      border-left: 1px solid rgba(255, 255, 255, 0.09);
      display: flex;
      flex-direction: column;
      padding: 1rem .9rem;
      gap: .35rem;
      overflow-y: auto;
    }

    /* Sidebar header row */
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: .8rem;
    }
    .sidebar-logo { height: 30px; width: 30px; border-radius: 6px; }

    .close-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6);
      width: 30px; height: 30px;
      border-radius: 8px;
      cursor: pointer;
      font-size: .9rem;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    .close-btn:hover { background: rgba(255,255,255,.12); color: #fff; }

    /* User strip */
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: .75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: .75rem;
      margin-bottom: .2rem;
    }
    .avatar-circle {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: rgba(255, 107, 53, 0.15);
      border: 1px solid rgba(255, 107, 53, 0.3);
      display: flex; align-items: center; justify-content: center;
      color: #ff6b35; flex-shrink: 0;
      overflow: hidden;
    }
    .avatar-img {
      width: 100%; height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: block;
    }
    .user-name {
      color: #fff; font-weight: 700; font-size: .95rem;
    }
    .user-balance {
      display: flex; align-items: center; gap: .3rem;
      color: #f7931e; font-size: .78rem; margin-top: .15rem;
    }

    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.07);
      margin: .2rem 0 .35rem;
    }

    /* Nav items */
    .nav-item {
      display: flex;
      align-items: center;
      gap: .7rem;
      width: 100%;
      padding: .72rem .9rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
      color: rgba(255, 255, 255, 0.88);
      font-size: .9rem;
      cursor: pointer;
      text-align: left;
      transition: background .15s, border-color .15s;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
    .nav-item.admin {
      color: #ff6b35;
      background: rgba(255, 107, 53, 0.1);
      border-color: rgba(255, 107, 53, 0.3);
    }
    .nav-item.logout {
      color: #ff7070;
      background: rgba(255, 80, 80, 0.07);
      border-color: rgba(255, 80, 80, 0.2);
    }
    .nav-item.highlight {
      color: #f7931e;
      background: rgba(247, 147, 30, 0.1);
      border-color: rgba(247, 147, 30, 0.3);
    }

    .spacer { flex: 1 1 auto; min-height: .5rem; }

    /* ── Coin shop panel ─────────────────────────────────────────────────── */
    .coin-shop {
      margin-top: 72px;
      width: 580px;
      max-width: calc(100vw - 2rem);
      background: #0f0f26;
      border: 1px solid rgba(255, 255, 255, 0.11);
      border-radius: 16px;
      padding: 1.25rem;
      color: #fff;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    }
    .shop-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .shop-header h3 { margin: 0; color: #ff6b35; font-size: 1.1rem; }

    .packages {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .7rem;
    }
    .package {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 12px;
      padding: .85rem .6rem;
      display: flex; flex-direction: column;
      align-items: center; gap: .45rem;
      text-align: center;
    }
    .pkg-coins {
      display: flex; align-items: center; gap: .35rem;
      font-weight: 700; color: #f7931e; font-size: 1.05rem;
    }
    .pkg-price { color: rgba(255,255,255,.6); font-size: .85rem; }
    .buy-btn {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #fff; border: none; border-radius: 8px;
      padding: .4rem .9rem; cursor: pointer;
      font-weight: 700; font-size: .85rem; width: 100%;
      transition: opacity .15s;
    }
    .buy-btn:hover:not(:disabled) { opacity: .85; }
    .buy-btn:disabled { opacity: .4; cursor: not-allowed; }

    /* ── Mobile ──────────────────────────────────────────────────────────── */
    @media (max-width: 600px) {
      .navbar { height: 58px; }
      .bar-content { padding: 0 .85rem; }
      .aurex-logo { height: 32px; width: 32px; }
      .brand-text { font-size: 1rem; letter-spacing: .08em; }
      .wallet-pill { padding: .28rem .65rem; font-size: .82rem; }
      .hamburger { width: 38px; height: 38px; border-radius: 10px; }
      .coin-shop {
        margin-top: 58px;
        max-width: calc(100vw - 1.25rem);
        border-radius: 14px;
      }
      .packages { grid-template-columns: repeat(2, 1fr); gap: .55rem; }
    }

    @media (max-width: 380px) {
      .brand-text { display: none; }   /* very small phones: drop text, keep logo + coins */
      .left-group { gap: .45rem; }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  walletBalance$: Observable<number>;

  sidebarOpen  = false;
  coinShopOpen = false;
  buying       = false;
  activePkg    = '';

  coinPackages: CoinPackage[] = [];
  packagesLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private coinPackagesService: CoinPackagesService,
  ) {
    this.currentUser$     = this.store.select(selectCurrentUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isAdmin$         = this.store.select(selectIsAdmin);
    this.walletBalance$   = this.store.select(selectWalletBalance);
  }

  ngOnInit() {
    this.store.dispatch(loadWallet());

    // Load packages from API — single source of truth
    this.coinPackagesService.getPackages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pkgs) => { this.coinPackages = pkgs; this.packagesLoading = false; },
        error: ()    => { this.packagesLoading = false; },
      });

    this.store.select(selectPendingOrder)
      .pipe(takeUntil(this.destroy$), filter((o): o is PaymentInitiateResponse => !!o))
      .subscribe(order => this.openRazorpay(order));
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  /* ── Coin purchase ─────────────────────────────────────────────────── */
  onBuy(pkg: CoinPackage) {
    this.buying    = true;
    this.activePkg = pkg.id;
    this.store.dispatch(initiatePayment({ packageId: pkg.id }));
  }

  private openRazorpay(order: PaymentInitiateResponse) {
    const options = {
      key:         order.razorpay_key_id,
      amount:      order.amount_paise,
      currency:    order.currency,
      name:        'Aurex',
      description: `${order.coins} Coins`,
      order_id:    order.razorpay_order_id,
      handler: (response: any) => {
        this.store.dispatch(verifyPayment({
          verifyData: {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            coins: order.coins,
          },
        }));
        this.buying    = false;
        this.activePkg = '';
        this.closeCoinShop();
      },
      modal: { ondismiss: () => { this.buying = false; this.activePkg = ''; } },
      theme: { color: '#ff6b35' },
    };
    new Razorpay(options).open();
  }

  /* ── Panel controls ────────────────────────────────────────────────── */
  toggleSidebar() {
    this.sidebarOpen  = !this.sidebarOpen;
    this.coinShopOpen = false;   // close shop if open
  }
  openCoinShop() {
    this.coinShopOpen = true;
    this.sidebarOpen  = false;   // close sidebar if open
  }
  closeSidebar()  { this.sidebarOpen  = false; }
  closeCoinShop() { this.coinShopOpen = false; }

  /* ── Navigation ────────────────────────────────────────────────────── */
  goTo(path: string) {
    this.sidebarOpen  = false;
    this.coinShopOpen = false;
    this.router.navigate([path]);
  }
  onLogout() {
    this.sidebarOpen  = false;
    this.coinShopOpen = false;
    this.store.dispatch(logout());
  }
}
