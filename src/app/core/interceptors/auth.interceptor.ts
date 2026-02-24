import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth interceptor: attaches the JWT Bearer token to every outgoing request.
 *
 * Reads directly from localStorage (not the NgRx store) for two reasons:
 *  1. The store may not be initialised yet during app boot (e.g. loadMe call).
 *  2. Avoids a circular-dependency chain (Store ? HTTP ? interceptor ? Store).
 *
 * Token keys: 'access_token' and 'refresh_token' are the canonical keys
 * used by auth.effects.ts when persisting tokens after login/register.
 *
 * Skip token injection for auth endpoints themselves
 * (login, register, refresh, forgot-password, reset-password) since they
 * either don't need a token or are exchanging one.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Don't inject tokens for auth endpoints — they don't need them
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/verify-register') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password') ||
    req.url.includes('/auth/send-otp');

  if (isAuthEndpoint) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
