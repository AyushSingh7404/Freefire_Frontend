import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { refreshTokenSuccess, refreshTokenFailure } from '../../store/auth/auth.actions';

/**
 * Error interceptor — outermost in the chain (runs first on response).
 *
 * 1. On 401: silently try to refresh access token using the stored refresh token.
 *    If refresh succeeds ? retry original request with new token.
 *    If refresh fails or no refresh token ? clear session, redirect to login.
 *
 * 2. On 403: redirect to home page (insufficient permissions).
 *
 * 3. All errors: extract FastAPI's { "detail": "..." } into a plain Error
 *    so effects can read err.message without knowing the API shape.
 *
 * NOTE: The fetch() call for token refresh bypasses the interceptor chain
 * intentionally — if we used HttpClient here it would create a circular
 * dependency and risk triggering this same interceptor recursively.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store  = inject(Store);
  const router = inject(Router);

  // Endpoints that should NEVER trigger a refresh attempt
  const isAuthCall = [
    '/auth/login', '/auth/register', '/auth/verify-register',
    '/auth/refresh', '/auth/forgot-password', '/auth/reset-password', '/auth/send-otp',
  ].some(p => req.url.includes(p));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // -- 401: try silent token refresh -------------------------------------
      if (error.status === 401 && !isAuthCall) {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          // Use fetch() to avoid going through our interceptors (no circular loop)
          const refreshPromise = fetch(`${environment.apiUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          }).then(res => {
            if (!res.ok) throw new Error('refresh_failed');
            return res.json();
          });

          return from(refreshPromise).pipe(
            switchMap((tokens: any) => {
              // Persist new tokens
              localStorage.setItem('access_token',  tokens.access_token);
              localStorage.setItem('refresh_token', tokens.refresh_token);
              store.dispatch(refreshTokenSuccess({
                accessToken:  tokens.access_token,
                refreshToken: tokens.refresh_token,
              }));
              // Retry original request with new token
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${tokens.access_token}` },
              });
              return next(retried);
            }),
            catchError(() => {
              // Refresh failed — clear session and force login
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              store.dispatch(refreshTokenFailure());
              router.navigate(['/auth/login']);
              return throwError(() => new Error('Session expired. Please log in again.'));
            })
          );
        }

        // No refresh token available — clear and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        store.dispatch(refreshTokenFailure());
        router.navigate(['/auth/login']);
      }

      // -- 403: forbidden -----------------------------------------------------
      if (error.status === 403) {
        router.navigate(['/']);
      }

      // -- Extract human-readable message from FastAPI error shape -------------
      // FastAPI:          { "detail": "message string" }
      // Pydantic 422:     { "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }
      const detail = error.error?.detail;
      let message: string;

      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        message = detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      } else {
        message = error.message || 'An unexpected error occurred.';
      }

      return throwError(() => new Error(message));
    })
  );
};
