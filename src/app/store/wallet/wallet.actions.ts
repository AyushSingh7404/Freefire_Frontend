import { createAction, props } from '@ngrx/store';
import { Wallet, Transaction, PaymentRequest, RedeemCodeRequest } from '../../core/models/wallet.model';

export const loadWallet = createAction('[Wallet] Load Wallet');

export const loadWalletSuccess = createAction(
  '[Wallet] Load Wallet Success',
  props<{ wallet: Wallet }>()
);

export const loadWalletFailure = createAction(
  '[Wallet] Load Wallet Failure',
  props<{ error: string }>()
);

export const loadTransactions = createAction('[Wallet] Load Transactions');

export const loadTransactionsSuccess = createAction(
  '[Wallet] Load Transactions Success',
  props<{ transactions: Transaction[] }>()
);

export const loadTransactionsFailure = createAction(
  '[Wallet] Load Transactions Failure',
  props<{ error: string }>()
);

export const processPayment = createAction(
  '[Wallet] Process Payment',
  props<{ paymentData: PaymentRequest }>()
);

export const processPaymentSuccess = createAction(
  '[Wallet] Process Payment Success'
);

export const processPaymentFailure = createAction(
  '[Wallet] Process Payment Failure',
  props<{ error: string }>()
);

export const redeemCode = createAction(
  '[Wallet] Redeem Code',
  props<{ codeData: RedeemCodeRequest }>()
);

export const redeemCodeSuccess = createAction(
  '[Wallet] Redeem Code Success',
  props<{ amount: number }>()
);

export const redeemCodeFailure = createAction(
  '[Wallet] Redeem Code Failure',
  props<{ error: string }>()
);

export const deductCoins = createAction(
  '[Wallet] Deduct Coins',
  props<{ amount: number; reason?: string }>()
);

export const deductCoinsSuccess = createAction(
  '[Wallet] Deduct Coins Success',
  props<{ amount: number }>()
);

export const deductCoinsFailure = createAction(
  '[Wallet] Deduct Coins Failure',
  props<{ error: string }>()
);
