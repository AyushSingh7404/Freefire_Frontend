import { createAction, props } from '@ngrx/store';
import { User, AuthResponse, RegisterRequest } from '../../core/models/user.model';

// ── Direct login: credentials → tokens (no OTP) ────────────────────────────
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: AuthResponse }>()
);
export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// ── Register step 1: create account + send OTP ─────────────────────────────
export const initiateRegister = createAction(
  '[Auth] Initiate Register',
  props<{ userData: RegisterRequest }>()
);
export const initiateRegisterSuccess = createAction(
  '[Auth] Initiate Register Success',
  props<{ email: string; message: string }>()
);
export const initiateRegisterFailure = createAction(
  '[Auth] Initiate Register Failure',
  props<{ error: string }>()
);

// ── Register step 2: verify OTP → tokens ───────────────────────────────────
export const verifyRegister = createAction(
  '[Auth] Verify Register',
  props<{ email: string; otp: string }>()
);
export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ response: AuthResponse }>()
);
export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// ── OTP resend (register or forgot_password only) ──────────────────────────
export const sendOtp = createAction(
  '[Auth] Send OTP',
  props<{ email: string; purpose: 'register' | 'forgot_password' }>()
);
export const sendOtpSuccess = createAction('[Auth] Send OTP Success');
export const sendOtpFailure = createAction('[Auth] Send OTP Failure', props<{ error: string }>());

// ── Forgot / Reset password ─────────────────────────────────────────────────
export const forgotPassword = createAction(
  '[Auth] Forgot Password',
  props<{ email: string }>()
);
export const forgotPasswordSuccess = createAction(
  '[Auth] Forgot Password Success',
  props<{ email: string }>()
);
export const forgotPasswordFailure = createAction(
  '[Auth] Forgot Password Failure',
  props<{ error: string }>()
);

export const resetPassword = createAction(
  '[Auth] Reset Password',
  props<{ email: string; otp: string; newPassword: string }>()
);
export const resetPasswordSuccess = createAction('[Auth] Reset Password Success');
export const resetPasswordFailure = createAction(
  '[Auth] Reset Password Failure',
  props<{ error: string }>()
);

// ── Token refresh ───────────────────────────────────────────────────────────
export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ accessToken: string; refreshToken: string }>()
);
export const refreshTokenFailure = createAction('[Auth] Refresh Token Failure');

// ── Load full profile after app boot (token already in localStorage) ────────
export const loadMe = createAction('[Auth] Load Me');
export const loadMeSuccess = createAction('[Auth] Load Me Success', props<{ user: User }>());
export const loadMeFailure = createAction('[Auth] Load Me Failure');

// ── Update user object in store after profile PUT ──────────────────────────
export const updateUserInStore = createAction(
  '[Auth] Update User In Store',
  props<{ user: User }>()
);

// ── Common ──────────────────────────────────────────────────────────────────
export const logout   = createAction('[Auth] Logout');
export const clearError = createAction('[Auth] Clear Error');
