import { createReducer, on } from '@ngrx/store';
import { Wallet, Transaction } from '../../core/models/wallet.model';
import * as WalletActions from './wallet.actions';

export interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null
};

export const walletReducer = createReducer(
  initialState,
  on(WalletActions.loadWallet, WalletActions.loadTransactions, 
     WalletActions.processPayment, WalletActions.redeemCode, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(WalletActions.loadWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallet,
    loading: false
  })),
  on(WalletActions.loadTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    loading: false
  })),
  on(WalletActions.processPaymentSuccess, WalletActions.redeemCodeSuccess, (state) => ({
    ...state,
    loading: false
  })),
  on(WalletActions.loadWalletFailure, WalletActions.loadTransactionsFailure,
     WalletActions.processPaymentFailure, WalletActions.redeemCodeFailure, 
     (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);