import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser     = createSelector(selectAuthState, s => s.user);
export const selectIsAuthenticated = createSelector(selectAuthState, s => s.isAuthenticated);
export const selectAuthToken       = createSelector(selectAuthState, s => s.token);
export const selectAuthLoading     = createSelector(selectAuthState, s => s.loading);
export const selectAuthError       = createSelector(selectAuthState, s => s.error);

// Register OTP flow
export const selectRegisterOtpSent = createSelector(selectAuthState, s => s.registerOtpSent);
export const selectPendingEmail    = createSelector(selectAuthState, s => s.pendingEmail);

// Forgot/reset password
export const selectResetOtpSent    = createSelector(selectAuthState, s => s.resetOtpSent);
export const selectResetSuccess    = createSelector(selectAuthState, s => s.resetSuccess);

export const selectIsAdmin = createSelector(selectCurrentUser, u => u?.isAdmin ?? false);
