import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Register OTP flow only (login is single-step, no OTP)
  registerOtpSent: boolean;
  pendingEmail: string | null;   // shared by register + forgot-password OTP flows
  // Forgot/reset password
  resetOtpSent: boolean;
  resetSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,
  registerOtpSent: false,
  pendingEmail: null,
  resetOtpSent: false,
  resetSuccess: false,
};

export const authReducer = createReducer(
  initialState,

  // ── Direct login (no OTP) ────────────────────────────────────────────────
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user as any,
    token: response.accessToken,
    refreshToken: response.refreshToken,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  // ── Register step 1 ──────────────────────────────────────────────────────
  on(AuthActions.initiateRegister, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.initiateRegisterSuccess, (state, { email }) => ({
    ...state, loading: false, registerOtpSent: true, pendingEmail: email,
  })),
  on(AuthActions.initiateRegisterFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  // ── Register step 2 ──────────────────────────────────────────────────────
  on(AuthActions.verifyRegister, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user as any,
    token: response.accessToken,
    refreshToken: response.refreshToken,
    isAuthenticated: true,
    loading: false,
    error: null,
    registerOtpSent: false,
    pendingEmail: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  // ── Token refresh ────────────────────────────────────────────────────────
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => ({
    ...state, token: accessToken, refreshToken,
  })),
  on(AuthActions.refreshTokenFailure, (state) => ({
    ...initialState, token: null, refreshToken: null, isAuthenticated: false,
  })),

  // ── Load full profile ────────────────────────────────────────────────────
  on(AuthActions.loadMeSuccess, (state, { user }) => ({ ...state, user })),
  on(AuthActions.loadMeFailure, (state) => ({
    ...initialState, token: null, refreshToken: null, isAuthenticated: false,
  })),

  // ── Update user in store after profile save ──────────────────────────────
  on(AuthActions.updateUserInStore, (state, { user }) => ({ ...state, user })),

  // ── Forgot password ──────────────────────────────────────────────────────
  on(AuthActions.forgotPassword, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.forgotPasswordSuccess, (state, { email }) => ({
    ...state, loading: false, resetOtpSent: true, pendingEmail: email,
  })),
  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  // ── Reset password ───────────────────────────────────────────────────────
  on(AuthActions.resetPassword, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.resetPasswordSuccess, (state) => ({
    ...state, loading: false, resetSuccess: true, resetOtpSent: false, pendingEmail: null,
  })),
  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  // ── OTP resend ───────────────────────────────────────────────────────────
  on(AuthActions.sendOtp, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.sendOtpSuccess, (state) => ({ ...state, loading: false })),
  on(AuthActions.sendOtpFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // ── Logout ───────────────────────────────────────────────────────────────
  on(AuthActions.logout, () => ({
    ...initialState,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  })),

  // ── Clear error ──────────────────────────────────────────────────────────
  on(AuthActions.clearError, (state) => ({ ...state, error: null })),
);
