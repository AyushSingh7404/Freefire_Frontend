import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletState } from './wallet.reducer';

export const selectWalletState = createFeatureSelector<WalletState>('wallet');

export const selectWallet = createSelector(
  selectWalletState,
  (state: WalletState) => state.wallet
);

export const selectWalletBalance = createSelector(
  selectWallet,
  (wallet) => wallet?.balance || 0
);

export const selectTransactions = createSelector(
  selectWalletState,
  (state: WalletState) => state.transactions
);

export const selectWalletLoading = createSelector(
  selectWalletState,
  (state: WalletState) => state.loading
);

export const selectWalletError = createSelector(
  selectWalletState,
  (state: WalletState) => state.error
);