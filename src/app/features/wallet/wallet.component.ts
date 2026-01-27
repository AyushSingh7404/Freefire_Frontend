import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadWallet, loadTransactions, processPayment, redeemCode } from '../../store/wallet/wallet.actions';
import { selectWalletBalance, selectTransactions } from '../../store/wallet/wallet.selectors';
import { Transaction } from '../../core/models/wallet.model';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="container">
      <div class="wallet-grid">
        <mat-card class="glass">
          <mat-card-header>
            <mat-card-title>Coins Balance</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="balance">
              <span class="amount">{{ balance$ | async }}</span>
              <span>coins</span>
            </div>
            <div class="actions">
              <button mat-raised-button class="btn-gaming" (click)="onBuyCoins()">Buy Coins</button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="glass">
          <mat-card-header>
            <mat-card-title>Redeem Code</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="redeemForm" (ngSubmit)="onRedeem()">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Code</mat-label>
                <input matInput formControlName="code">
              </mat-form-field>
              <button mat-raised-button class="btn-gaming" [disabled]="redeemForm.invalid">
                Redeem
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card class="glass">
          <mat-card-header>
            <mat-card-title>Transaction History</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-nav-list>
              <a mat-list-item *ngFor="let t of transactions$ | async">
                <span>{{ t.createdAt | date:'short' }}</span>
                <span class="ml-auto">{{ t.type === 'credit' ? '+' : '-' }}{{ t.amount }}</span>
                <span class="ml-2">{{ t.description }}</span>
              </a>
            </mat-nav-list>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .wallet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    .balance {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      color: white;
    }
    .amount {
      font-size: 2rem;
      color: #ff6b35;
      font-weight: bold;
    }
    .actions {
      margin-top: 1rem;
    }
    .ml-auto { margin-left: auto; }
    .ml-2 { margin-left: 0.5rem; }
  `]
})
export class WalletComponent implements OnInit {
  balance$: Observable<number>;
  transactions$: Observable<Transaction[]>;
  redeemForm!: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {
    this.balance$ = this.store.select(selectWalletBalance);
    this.transactions$ = this.store.select(selectTransactions);
  }

  ngOnInit(): void {
    this.store.dispatch(loadWallet());
    this.store.dispatch(loadTransactions());
    this.redeemForm = this.fb.group({
      code: ['', [Validators.required]]
    });
  }

  onBuyCoins() {
    this.store.dispatch(processPayment({ paymentData: { amount: 100, method: 'upi' } }));
  }

  onRedeem() {
    if (this.redeemForm.valid) {
      this.store.dispatch(redeemCode({ codeData: this.redeemForm.value }));
    }
  }
}
