import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { logout } from '../../store/auth/auth.actions';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        store.dispatch(logout());
        router.navigate(['/auth/login']);
      }
      
      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};