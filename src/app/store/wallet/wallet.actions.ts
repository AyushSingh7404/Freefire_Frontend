import { createAction, props } from '@ngrx/store';
import { Wallet, Transaction, PaymentInitiateResponse, PaymentVerifyRequest } from '../../core/models/wallet.model';

// ── Load wallet balance ────────────────────────────────────────────────────
export const loadWallet = createAction('[Wallet] Load Wallet');
export const loadWalletSuccess = createAction('[Wallet] Load Wallet Success', props<{ wallet: Wallet }>());
export const loadWalletFailure = createAction('[Wallet] Load Wallet Failure', props<{ error: string }>());

// ── Load transaction history ───────────────────────────────────────────────
export const loadTransactions = createAction('[Wallet] Load Transactions');
export const loadTransactionsSuccess = createAction('[Wallet] Load Transactions Success', props<{ transactions: Transaction[] }>());
export const loadTransactionsFailure = createAction('[Wallet] Load Transactions Failure', props<{ error: string }>());

// ── Razorpay: step 1 — initiate payment order ─────────────────────────────
// packageId: UUID from GET /coin-packages — backend resolves price and coins
export const initiatePayment = createAction(
  '[Wallet] Initiate Payment',
  props<{ packageId: string }>()
);
export const initiatePaymentSuccess = createAction(
  '[Wallet] Initiate Payment Success',
  props<{ order: PaymentInitiateResponse }>()
);
export const initiatePaymentFailure = createAction('[Wallet] Initiate Payment Failure', props<{ error: string }>());

// ── Razorpay: step 2 — verify payment after modal success ─────────────────
export const verifyPayment = createAction(
  '[Wallet] Verify Payment',
  props<{ verifyData: PaymentVerifyRequest }>()
);
export const verifyPaymentSuccess = createAction(
  '[Wallet] Verify Payment Success',
  props<{ coinsCredited: number }>()
);
export const verifyPaymentFailure = createAction('[Wallet] Verify Payment Failure', props<{ error: string }>());

// ── Reload wallet after any successful payment ────────────────────────────
export const reloadWalletAfterPayment = createAction('[Wallet] Reload After Payment');

// ── Clear error ───────────────────────────────────────────────────────────
export const clearWalletError = createAction('[Wallet] Clear Error');
