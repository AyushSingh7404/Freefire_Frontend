import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {

  // ── Login: single step, returns tokens immediately ───────────────────────
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(err => of(AuthActions.loginFailure({ error: err.message || 'Login failed' })))
        )
      )
    )
  );

  // ── Register step 1: send OTP ─────────────────────────────────────────────
  initiateRegister$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initiateRegister),
      exhaustMap(({ userData }) =>
        this.authService.initiateRegister(userData).pipe(
          map(res => AuthActions.initiateRegisterSuccess({ email: userData.email, message: res.message })),
          catchError(err => of(AuthActions.initiateRegisterFailure({ error: err.message || 'Registration failed' })))
        )
      )
    )
  );

  // ── Register step 2: verify OTP → tokens ─────────────────────────────────
  verifyRegister$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyRegister),
      exhaustMap(({ email, otp }) =>
        this.authService.verifyRegister(email, otp).pipe(
          map(response => AuthActions.registerSuccess({ response })),
          catchError(err => of(AuthActions.registerFailure({ error: err.message || 'OTP verification failed' })))
        )
      )
    )
  );

  // ── Persist tokens + load full profile after any auth success ─────────────
  onAuthSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(({ response }) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
      }),
      map(() => AuthActions.loadMe())
    )
  );

  // ── Navigate to home after successful auth ────────────────────────────────
  navigateAfterAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(() => this.router.navigate(['/']))
    ),
    { dispatch: false }
  );

  // ── Load full user profile (GET /users/me) ────────────────────────────────
  loadMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMe),
      exhaustMap(() =>
        this.authService.getMe().pipe(
          map(user => AuthActions.loadMeSuccess({ user })),
          catchError(() => of(AuthActions.loadMeFailure()))
        )
      )
    )
  );

  // ── If token is invalid on app start → clear and redirect ────────────────
  loadMeFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMeFailure),
      tap(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
    ),
    { dispatch: false }
  );

  // ── OTP resend ────────────────────────────────────────────────────────────
  sendOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sendOtp),
      exhaustMap(({ email, purpose }) =>
        this.authService.sendOtp(email, purpose).pipe(
          map(() => AuthActions.sendOtpSuccess()),
          catchError(err => of(AuthActions.sendOtpFailure({ error: err.message || 'Failed to send OTP' })))
        )
      )
    )
  );

  // ── Forgot password: send reset OTP ──────────────────────────────────────
  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      exhaustMap(({ email }) =>
        this.authService.forgotPassword(email).pipe(
          map(() => AuthActions.forgotPasswordSuccess({ email })),
          catchError(err => of(AuthActions.forgotPasswordFailure({ error: err.message || 'Failed to send OTP' })))
        )
      )
    )
  );

  // ── Reset password: verify OTP + set new password ────────────────────────
  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      exhaustMap(({ email, otp, newPassword }) =>
        // Backend only needs { email, otp, new_password } — no confirmPassword
        this.authService.resetPassword(email, otp, newPassword).pipe(
          map(() => AuthActions.resetPasswordSuccess()),
          catchError(err => of(AuthActions.resetPasswordFailure({ error: err.message || 'Reset failed' })))
        )
      )
    )
  );

  // ── Navigate to login after password reset ────────────────────────────────
  afterResetSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPasswordSuccess),
      tap(() => this.router.navigate(['/auth/login']))
    ),
    { dispatch: false }
  );

  // ── Logout: clear localStorage + navigate ────────────────────────────────
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
  ) {}
}
