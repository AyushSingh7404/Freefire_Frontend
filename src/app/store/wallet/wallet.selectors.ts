import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletState } from './wallet.reducer';

export const selectWalletState = createFeatureSelector<WalletState>('wallet');

export const selectWallet = createSelector(selectWalletState, (s) => s.wallet);

export const selectWalletBalance = createSelector(
  selectWallet,
  (wallet) => wallet?.balance ?? 0
);

export const selectAvailableBalance = createSelector(
  selectWallet,
  (wallet) => wallet?.availableBalance ?? 0
);

export const selectTransactions = createSelector(selectWalletState, (s) => s.transactions);

export const selectWalletLoading = createSelector(selectWalletState, (s) => s.loading);

export const selectPaymentLoading = createSelector(selectWalletState, (s) => s.paymentLoading);

export const selectPendingOrder = createSelector(selectWalletState, (s) => s.pendingOrder);

export const selectLastCreditedCoins = createSelector(selectWalletState, (s) => s.lastCreditedCoins);

export const selectWalletError = createSelector(selectWalletState, (s) => s.error);
