import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import {
  loadWallet, loadTransactions,
  initiatePayment, verifyPayment,
} from '../../store/wallet/wallet.actions';
import {
  selectWalletBalance, selectTransactions,
  selectPendingOrder, selectPaymentLoading, selectWalletError,
} from '../../store/wallet/wallet.selectors';
import { Transaction, PaymentInitiateResponse } from '../../core/models/wallet.model';
import { CoinPackage } from '../../core/models/coin-package.model';
import { CoinPackagesService } from '../../core/services/coin-packages.service';

declare var Razorpay: any;

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="wallet-page">

      <!-- ── Header ──────────────────────────────────────────────────── -->
      <div class="page-header">
        <h1>Wallet</h1>
        <p class="subtitle">Manage your Aurex coins</p>
      </div>

      <!-- ── Closed economy notice ────────────────────────────────────── -->
      <div class="economy-notice">
        <lucide-icon name="info" class="notice-icon"></lucide-icon>
        <p>
          Aurex coins are for in-platform tournament participation only.
          Coins <strong>cannot be withdrawn</strong> as real money and have no
          real-world cash value. Aurex is a competitive esports platform, not
          a real-money gaming operator.
        </p>
      </div>

      <div class="wallet-grid">

        <!-- ── Left col: balance + packages ─────────────────────────── -->
        <div class="left-col">

          <!-- Balance card -->
          <div class="card balance-card">
            <div class="balance-label">Your Coin Balance</div>
            <div class="balance-amount">
              <lucide-icon name="coins" class="coin-icon"></lucide-icon>
              <span>{{ balance$ | async | number:'1.0-0' }}</span>
            </div>
            <div class="balance-sub">coins available to spend in tournaments</div>
          </div>

          <!-- Buy coins -->
          <div class="card packages-card">
            <h3 class="card-title">Buy Coins</h3>

            <!-- Loading state -->
            <div class="pkg-loading" *ngIf="packagesLoading">
              <lucide-icon name="loader" class="spin"></lucide-icon>
              Loading packages…
            </div>

            <!-- Error state -->
            <div class="pkg-error" *ngIf="packagesError">
              Could not load packages. Please refresh.
            </div>

            <!-- Packages grid -->
            <div class="packages-grid" *ngIf="!packagesLoading && !packagesError">
              <button
                *ngFor="let p of packages"
                class="pkg"
                [class.popular]="p.isPopular"
                [disabled]="paymentLoading$ | async"
                (click)="onBuy(p)">
                <div class="popular-badge" *ngIf="p.isPopular">Popular</div>
                <div class="pkg-coins">
                  <lucide-icon name="coins" class="icon-sm"></lucide-icon>
                  {{ p.coins | number }}
                </div>
                <div class="pkg-price">₹{{ p.priceInr }}</div>
                <div class="pkg-cta">
                  {{ (paymentLoading$ | async) ? 'Processing…' : 'Buy' }}
                </div>
              </button>
            </div>
          </div>

        </div>

        <!-- ── Right col: transaction history ───────────────────────── -->
        <div class="card history-card">
          <h3 class="card-title">Transaction History</h3>

          <div class="empty-state" *ngIf="!(transactions$ | async)?.length">
            <lucide-icon name="receipt" class="empty-icon"></lucide-icon>
            <p>No transactions yet</p>
            <span>Your deposits and tournament activity will appear here</span>
          </div>

          <div class="txn-list" *ngIf="(transactions$ | async)?.length">
            <div class="txn-item" *ngFor="let t of transactions$ | async">
              <div class="txn-left">
                <div class="txn-icon" [class.credit]="t.type === 'credit'" [class.debit]="t.type === 'debit'">
                  <lucide-icon [name]="t.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'" class="icon-sm"></lucide-icon>
                </div>
                <div class="txn-info">
                  <div class="txn-desc">{{ t.description }}</div>
                  <div class="txn-date">{{ t.createdAt | date:'dd MMM yyyy, h:mm a' }}</div>
                </div>
              </div>
              <div class="txn-amount" [class.credit]="t.type === 'credit'" [class.debit]="t.type === 'debit'">
                {{ t.type === 'credit' ? '+' : '-' }}{{ t.amount }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Error banner -->
      <div class="error-banner" *ngIf="error$ | async as err">
        <lucide-icon name="alert-circle" class="icon-sm"></lucide-icon>
        {{ err }}
      </div>

    </div>
  `,
  styles: [`
    .wallet-page { max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem; color: #fff; }
    .page-header { margin-bottom: 1.25rem; }
    .page-header h1 { font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0; }
    .subtitle { color: rgba(255,255,255,.5); margin: .25rem 0 0; font-size: .95rem; }

    .economy-notice {
      display: flex; align-items: flex-start; gap: .75rem;
      background: rgba(247,147,30,.08); border: 1px solid rgba(247,147,30,.25);
      border-radius: 12px; padding: .9rem 1.1rem; margin-bottom: 1.5rem;
      color: rgba(255,255,255,.8); font-size: .88rem; line-height: 1.55;
    }
    .notice-icon { width: 18px; height: 18px; color: #f7931e; flex-shrink: 0; margin-top: 2px; }
    .economy-notice strong { color: #f7931e; }

    .wallet-grid { display: grid; grid-template-columns: 340px 1fr; gap: 1.25rem; align-items: start; }
    .left-col { display: flex; flex-direction: column; gap: 1.25rem; }

    .card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 16px; padding: 1.25rem; }
    .card-title { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: rgba(255,255,255,.9); }

    .balance-label { font-size: .82rem; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .08em; margin-bottom: .5rem; }
    .balance-amount { display: flex; align-items: center; gap: .5rem; font-size: 2.4rem; font-weight: 900; color: #f7931e; }
    .coin-icon { width: 28px; height: 28px; }
    .balance-sub { margin-top: .4rem; font-size: .8rem; color: rgba(255,255,255,.4); }

    .pkg-loading, .pkg-error { display: flex; align-items: center; gap: .5rem; padding: 1rem 0; color: rgba(255,255,255,.5); font-size: .9rem; }
    .pkg-error { color: #f44336; }
    .spin { width: 16px; height: 16px; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .packages-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }
    .pkg {
      position: relative;
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      border-radius: 12px; padding: .9rem .6rem;
      cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: .3rem;
      transition: all .15s; color: #fff;
    }
    .pkg:hover:not(:disabled) { background: rgba(255,107,53,.12); border-color: rgba(255,107,53,.4); transform: translateY(-1px); }
    .pkg.popular { border-color: rgba(247,147,30,.5); background: rgba(247,147,30,.07); }
    .pkg:disabled { opacity: .45; cursor: not-allowed; }
    .popular-badge { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg,#ff6b35,#f7931e); color: #fff; font-size: .68rem; font-weight: 800; padding: 2px 8px; border-radius: 99px; white-space: nowrap; }
    .pkg-coins { display: flex; align-items: center; gap: .3rem; font-weight: 800; font-size: 1rem; color: #f7931e; }
    .pkg-price { color: rgba(255,255,255,.55); font-size: .8rem; }
    .pkg-cta { background: linear-gradient(135deg,#ff6b35,#f7931e); color: #fff; border-radius: 6px; padding: .25rem .7rem; font-size: .78rem; font-weight: 700; margin-top: .15rem; }

    .history-card { min-height: 300px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 2.5rem 1rem; gap: .4rem; color: rgba(255,255,255,.35); text-align: center; }
    .empty-icon { width: 36px; height: 36px; margin-bottom: .5rem; }
    .empty-state p { margin: 0; font-size: .95rem; }

    .txn-list { display: flex; flex-direction: column; gap: .6rem; }
    .txn-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 10px; padding: .7rem .85rem; }
    .txn-left { display: flex; align-items: center; gap: .7rem; }
    .txn-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .txn-icon.credit { background: rgba(76,175,80,.15); color: #4caf50; }
    .txn-icon.debit  { background: rgba(244,67,54,.12); color: #f44336; }
    .txn-desc { font-size: .88rem; color: rgba(255,255,255,.85); }
    .txn-date { font-size: .75rem; color: rgba(255,255,255,.38); margin-top: .1rem; }
    .txn-amount { font-weight: 700; font-size: .95rem; }
    .txn-amount.credit { color: #4caf50; }
    .txn-amount.debit  { color: #f44336; }

    .icon-sm { width: 15px; height: 15px; }
    .error-banner { display: flex; align-items: center; gap: .5rem; background: rgba(244,67,54,.1); border: 1px solid rgba(244,67,54,.3); border-radius: 10px; padding: .75rem 1rem; color: #f44336; font-size: .9rem; margin-top: 1rem; }

    @media (max-width: 768px) { .wallet-grid { grid-template-columns: 1fr; } .packages-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 480px) { .packages-grid { grid-template-columns: 1fr 1fr; } .wallet-page { padding: 1.25rem .85rem; } }
  `]
})
export class WalletComponent implements OnInit, OnDestroy {
  balance$: Observable<number>;
  transactions$: Observable<Transaction[]>;
  paymentLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  packages: CoinPackage[] = [];
  packagesLoading = true;
  packagesError = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private coinPackagesService: CoinPackagesService,
  ) {
    this.balance$        = this.store.select(selectWalletBalance);
    this.transactions$   = this.store.select(selectTransactions);
    this.paymentLoading$ = this.store.select(selectPaymentLoading);
    this.error$          = this.store.select(selectWalletError);
  }

  ngOnInit(): void {
    this.store.dispatch(loadWallet());
    this.store.dispatch(loadTransactions());

    // Load packages from API — single source of truth
    this.coinPackagesService.getPackages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pkgs) => { this.packages = pkgs; this.packagesLoading = false; },
        error: ()    => { this.packagesLoading = false; this.packagesError = true; },
      });

    // Open Razorpay modal when backend confirms order creation
    this.store.select(selectPendingOrder)
      .pipe(takeUntil(this.destroy$), filter((o): o is PaymentInitiateResponse => !!o))
      .subscribe(order => this.openRazorpayModal(order));
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  onBuy(pkg: CoinPackage) {
    this.store.dispatch(initiatePayment({ packageId: pkg.id }));
  }

  private openRazorpayModal(order: PaymentInitiateResponse) {
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
      },
      theme: { color: '#ff6b35' },
      modal: { ondismiss: () => {} },
    };
    new Razorpay(options).open();
  }
}
