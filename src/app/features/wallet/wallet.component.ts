import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import {
  loadWallet, loadTransactions,
  initiatePayment, verifyPayment
} from '../../store/wallet/wallet.actions';
import {
  selectWalletBalance, selectTransactions,
  selectPendingOrder, selectPaymentLoading, selectWalletError
} from '../../store/wallet/wallet.selectors';
import { Transaction, PaymentInitiateResponse } from '../../core/models/wallet.model';

// Razorpay is loaded via script tag in index.html
declare var Razorpay: any;

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatListModule, ReactiveFormsModule
  ],
  template: `
    <div class="container">
      <div class="wallet-grid">

        <!-- Balance card -->
        <mat-card class="glass">
          <mat-card-header>
            <mat-card-title>Coins Balance</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="balance">
              <span class="amount">{{ balance$ | async }}</span>
              <span class="label">coins</span>
            </div>

            <!-- Coin packages -->
            <div class="packages">
              <button mat-raised-button class="pkg-btn" (click)="onBuyCoins(50, 49)"
                      [disabled]="paymentLoading$ | async">
                50 coins — ₹49
              </button>
              <button mat-raised-button class="pkg-btn" (click)="onBuyCoins(120, 99)"
                      [disabled]="paymentLoading$ | async">
                120 coins — ₹99
              </button>
              <button mat-raised-button class="pkg-btn" (click)="onBuyCoins(300, 199)"
                      [disabled]="paymentLoading$ | async">
                300 coins — ₹199
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Transaction history -->
        <mat-card class="glass">
          <mat-card-header>
            <mat-card-title>Transaction History</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="(transactions$ | async)?.length === 0" class="empty-state">
              No transactions yet.
            </div>
            <mat-nav-list>
              <a mat-list-item *ngFor="let t of transactions$ | async">
                <span class="tx-date">{{ t.createdAt | date:'dd MMM, h:mm a' }}</span>
                <span class="tx-amount" [class.credit]="t.type === 'credit'" [class.debit]="t.type === 'debit'">
                  {{ t.type === 'credit' ? '+' : '-' }}{{ t.amount }}
                </span>
                <span class="tx-desc">{{ t.description }}</span>
              </a>
            </mat-nav-list>
          </mat-card-content>
        </mat-card>

      </div>

      <div class="error-msg" *ngIf="error$ | async as err">{{ err }}</div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .wallet-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    .balance { display: flex; align-items: baseline; gap: 0.5rem; color: white; margin-bottom: 1.5rem; }
    .amount { font-size: 2.5rem; color: #ff6b35; font-weight: bold; }
    .label { color: rgba(255,255,255,0.6); }
    .packages { display: flex; flex-direction: column; gap: 0.75rem; }
    .pkg-btn { background: linear-gradient(45deg, #ff6b35, #f7931e) !important; color: white !important; border-radius: 10px !important; padding: 10px !important; text-align: left !important; }
    .tx-date { color: rgba(255,255,255,0.5); font-size: 0.8rem; min-width: 120px; }
    .tx-amount { font-weight: bold; margin: 0 0.75rem; }
    .tx-amount.credit { color: #4caf50; }
    .tx-amount.debit { color: #f44336; }
    .tx-desc { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
    .empty-state { color: rgba(255,255,255,0.5); padding: 1rem 0; text-align: center; }
    .error-msg { color: #f44336; margin-top: 1rem; text-align: center; }
  `]
})
export class WalletComponent implements OnInit, OnDestroy {
  balance$: Observable<number>;
  transactions$: Observable<Transaction[]>;
  pendingOrder$: Observable<PaymentInitiateResponse | null>;
  paymentLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  private destroy$ = new Subject<void>();

  constructor(private store: Store, private fb: FormBuilder) {
    this.balance$       = this.store.select(selectWalletBalance);
    this.transactions$  = this.store.select(selectTransactions);
    this.pendingOrder$  = this.store.select(selectPendingOrder);
    this.paymentLoading$ = this.store.select(selectPaymentLoading);
    this.error$         = this.store.select(selectWalletError);
  }

  ngOnInit(): void {
    this.store.dispatch(loadWallet());
    this.store.dispatch(loadTransactions());

    // When backend creates the Razorpay order, open the Razorpay modal
    this.store.select(selectPendingOrder)
      .pipe(takeUntil(this.destroy$), filter(o => !!o))
      .subscribe(order => this.openRazorpayModal(order!));
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  onBuyCoins(coins: number, amountInr: number) {
    this.store.dispatch(initiatePayment({ amountInr, coins }));
  }

  private openRazorpayModal(order: PaymentInitiateResponse) {
    const options = {
      key: order.razorpay_key_id,
      amount: order.amount_paise,
      currency: order.currency,
      name: 'Aurex',
      description: `${order.coins} Coins`,
      order_id: order.razorpay_order_id,
      handler: (response: any) => {
        // Razorpay calls this on successful payment
        this.store.dispatch(verifyPayment({
          verifyData: {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            coins: order.coins,
          }
        }));
      },
      theme: { color: '#ff6b35' },
      modal: {
        ondismiss: () => {
          // User dismissed the modal — nothing to do
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}
