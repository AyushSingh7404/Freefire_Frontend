import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { login, clearError } from '../../../store/auth/auth.actions';
import {
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <!-- Header -->
        <div class="auth-header">
          <div class="logo-ring">
            <span class="logo-icon">&#9889;</span>
          </div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to your Aurex account</p>
        </div>

        <!-- Error banner -->
        <div class="error-banner" *ngIf="error$ | async as err">
          <span class="error-icon">&#9888;</span>
          <span>{{ err }}</span>
          <button class="error-close" (click)="clearError()">&#10005;</button>
        </div>

        <!-- Login form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" novalidate>

          <div class="field-group">
            <label class="field-label">Email Address</label>
            <input
              type="email"
              class="field-input"
              [class.invalid]="emailInvalid"
              formControlName="email"
              placeholder="your@email.com"
              autocomplete="email"
            />
            <span class="field-error" *ngIf="emailInvalid">
              Please enter a valid email address.
            </span>
          </div>

          <div class="field-group">
            <label class="field-label">
              Password
              <a routerLink="/auth/forgot-password" class="forgot-link">Forgot?</a>
            </label>
            <div class="password-wrap">
              <input
                [type]="showPwd ? 'text' : 'password'"
                class="field-input"
                [class.invalid]="pwdInvalid"
                formControlName="password"
                placeholder="��������"
                autocomplete="current-password"
              />
              <button type="button" class="pwd-toggle" (click)="showPwd = !showPwd" tabindex="-1">
                {{ showPwd ? '&#128065;' : '&#128274;' }}
              </button>
            </div>
            <span class="field-error" *ngIf="pwdInvalid">
              Password is required.
            </span>
          </div>

          <button
            type="submit"
            class="submit-btn"
            [disabled]="(loading$ | async) || form.invalid"
          >
            <span class="spinner" *ngIf="loading$ | async"></span>
            <span *ngIf="!(loading$ | async)">Sign In</span>
            <span *ngIf="loading$ | async">Signing in...</span>
          </button>

        </form>

        <!-- Footer -->
        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/auth/register" class="auth-link">Create one free</a>
        </p>

      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 50%, #1a0a2e 100%);
      padding: 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2.5rem 2rem;
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .logo-ring {
      width: 72px; height: 72px;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
      font-size: 2rem;
    }
    .logo-icon { line-height: 1; }
    .auth-title { color: #fff; font-size: 1.6rem; font-weight: 700; margin: 0 0 .3rem; }
    .auth-subtitle { color: rgba(255,255,255,0.5); font-size: .9rem; margin: 0; }

    .error-banner {
      display: flex; align-items: center; gap: .6rem;
      background: rgba(244,67,54,0.15);
      border: 1px solid rgba(244,67,54,0.4);
      border-radius: 10px;
      padding: .65rem .9rem;
      color: #f44336;
      font-size: .88rem;
      margin-bottom: 1.25rem;
    }
    .error-icon { font-size: 1rem; flex-shrink: 0; }
    .error-close {
      margin-left: auto; background: none; border: none;
      color: #f44336; cursor: pointer; font-size: .85rem; padding: 0;
    }

    .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }
    .field-group { display: flex; flex-direction: column; gap: .35rem; }
    .field-label {
      display: flex; justify-content: space-between; align-items: center;
      color: rgba(255,255,255,0.8); font-size: .875rem; font-weight: 600;
    }
    .forgot-link { color: #ff6b35; font-size: .8rem; text-decoration: none; font-weight: 500; }
    .forgot-link:hover { text-decoration: underline; }

    .field-input {
      width: 100%; padding: 11px 14px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px; color: #fff;
      font-size: .95rem; outline: none;
      transition: border-color .2s;
      box-sizing: border-box;
    }
    .field-input::placeholder { color: rgba(255,255,255,0.3); }
    .field-input:focus { border-color: #ff6b35; }
    .field-input.invalid { border-color: #f44336; }

    .password-wrap { position: relative; }
    .password-wrap .field-input { padding-right: 44px; }
    .pwd-toggle {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0; line-height: 1;
    }

    .field-error { color: #f44336; font-size: .78rem; }

    .submit-btn {
      width: 100%; padding: 13px;
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      border: none; border-radius: 12px;
      color: #fff; font-size: 1rem; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .5rem;
      transition: opacity .2s, transform .1s;
      margin-top: .5rem;
    }
    .submit-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-footer {
      text-align: center; color: rgba(255,255,255,0.5); font-size: .88rem; margin: 1.5rem 0 0;
    }
    .auth-link { color: #ff6b35; font-weight: 600; text-decoration: none; }
    .auth-link:hover { text-decoration: underline; }
  `],
})
export class LoginComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  showPwd = false;

  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  private destroy$ = new Subject<void>();
  private returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loading$ = this.store.select(selectAuthLoading);
    this.error$   = this.store.select(selectAuthError);

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Clear any leftover error from a previous session
    this.store.dispatch(clearError());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get emailInvalid(): boolean {
    const c = this.form.get('email');
    return !!(c?.invalid && c?.touched);
  }

  get pwdInvalid(): boolean {
    const c = this.form.get('password');
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value;
    this.store.dispatch(login({ email, password }));
  }

  clearError(): void {
    this.store.dispatch(clearError());
  }
}
