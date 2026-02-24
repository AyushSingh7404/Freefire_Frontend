import { createReducer, on } from '@ngrx/store';
import { Wallet, Transaction, PaymentInitiateResponse } from '../../core/models/wallet.model';
import * as WalletActions from './wallet.actions';

export interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  // Razorpay flow
  pendingOrder: PaymentInitiateResponse | null;
  paymentLoading: boolean;
  lastCreditedCoins: number | null;
}

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
  pendingOrder: null,
  paymentLoading: false,
  lastCreditedCoins: null,
};

export const walletReducer = createReducer(
  initialState,

  // ── Load wallet ────────────────────────────────────────────────────────
  on(WalletActions.loadWallet, (state) => ({ ...state, loading: true, error: null })),
  on(WalletActions.loadWalletSuccess, (state, { wallet }) => ({ ...state, wallet, loading: false })),
  on(WalletActions.loadWalletFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // ── Load transactions ──────────────────────────────────────────────────
  on(WalletActions.loadTransactions, (state) => ({ ...state, loading: true, error: null })),
  on(WalletActions.loadTransactionsSuccess, (state, { transactions }) => ({ ...state, transactions, loading: false })),
  on(WalletActions.loadTransactionsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // ── Initiate payment ───────────────────────────────────────────────────
  on(WalletActions.initiatePayment, (state) => ({ ...state, paymentLoading: true, error: null, pendingOrder: null })),
  on(WalletActions.initiatePaymentSuccess, (state, { order }) => ({ ...state, paymentLoading: false, pendingOrder: order })),
  on(WalletActions.initiatePaymentFailure, (state, { error }) => ({ ...state, paymentLoading: false, error })),

  // ── Verify payment ─────────────────────────────────────────────────────
  on(WalletActions.verifyPayment, (state) => ({ ...state, paymentLoading: true, error: null })),
  on(WalletActions.verifyPaymentSuccess, (state, { coinsCredited }) => ({
    ...state,
    paymentLoading: false,
    pendingOrder: null,
    lastCreditedCoins: coinsCredited,
  })),
  on(WalletActions.verifyPaymentFailure, (state, { error }) => ({ ...state, paymentLoading: false, error })),

  // ── Clear error ────────────────────────────────────────────────────────
  on(WalletActions.clearWalletError, (state) => ({ ...state, error: null })),
);
