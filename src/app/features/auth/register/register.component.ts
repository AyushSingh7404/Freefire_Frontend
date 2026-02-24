import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import {
  selectAuthLoading, selectAuthError,
  selectRegisterOtpSent, selectPendingEmail
} from '../../../store/auth/auth.selectors';
import { initiateRegister, verifyRegister, sendOtp, clearError } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Join Aurex</mat-card-title>
          <mat-card-subtitle>Create your account and start competing</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>

          <!-- ── Step 1: Registration form ── -->
          <form *ngIf="!(otpSent$ | async)" [formGroup]="regForm" (ngSubmit)="onRegister()">

            <div class="info-banner">
              ⚠️ Fill your Free Fire details correctly — incorrect UID or name will
              prevent you from joining rooms.
            </div>

            <div class="form-field">
              <label>Age</label>
              <input type="number" min="13" class="text-input"
                     placeholder="Your age (13–100)" formControlName="age">
              <div class="field-error" *ngIf="f['age'].touched && f['age'].errors?.['required']">Age is required</div>
              <div class="field-error" *ngIf="f['age'].touched && f['age'].errors?.['min']">Must be 13 or older</div>
              <div class="field-error" *ngIf="f['age'].touched && f['age'].errors?.['max']">Must be 100 or younger</div>
            </div>

            <div class="form-field">
              <label>Username</label>
              <input type="text" class="text-input"
                     placeholder="Letters, numbers, underscores only (3–30 chars)"
                     formControlName="username" autocomplete="username">
              <div class="field-error" *ngIf="f['username'].touched && f['username'].errors?.['required']">Username is required</div>
              <div class="field-error" *ngIf="f['username'].touched && f['username'].errors?.['minlength']">At least 3 characters</div>
              <div class="field-error" *ngIf="f['username'].touched && f['username'].errors?.['pattern']">Letters, numbers, underscores only</div>
            </div>

            <div class="form-field">
              <label>Email</label>
              <input type="email" class="text-input"
                     placeholder="Your email" formControlName="email" autocomplete="email">
              <div class="field-error" *ngIf="f['email'].touched && f['email'].errors?.['required']">Email is required</div>
              <div class="field-error" *ngIf="f['email'].touched && f['email'].errors?.['email']">Enter a valid email</div>
            </div>

            <div class="form-field">
              <label>Free Fire UID</label>
              <input type="text" class="text-input"
                     placeholder="In-game UID (6–12 digits)" formControlName="freeFireId">
              <div class="field-error" *ngIf="f['freeFireId'].touched && f['freeFireId'].invalid">UID must be 6–12 digits</div>
            </div>

            <div class="form-field">
              <label>Free Fire Username</label>
              <input type="text" class="text-input"
                     placeholder="Your exact in-game name" formControlName="freeFireName">
              <div class="field-error" *ngIf="f['freeFireName'].touched && f['freeFireName'].errors?.['required']">In-game name is required</div>
            </div>

            <div class="form-field">
              <label>Password</label>
              <div class="input-with-action">
                <input [type]="hidePw ? 'password' : 'text'" class="text-input"
                       placeholder="At least 8 characters" formControlName="password" autocomplete="new-password">
                <button type="button" class="toggle-btn" (click)="hidePw = !hidePw">{{ hidePw ? '👁' : '🙈' }}</button>
              </div>
              <!-- min 8 matches backend RegisterRequest.password_strong validator -->
              <div class="field-error" *ngIf="f['password'].touched && f['password'].errors?.['minlength']">At least 8 characters required</div>
            </div>

            <div class="form-field">
              <label>Confirm Password</label>
              <div class="input-with-action">
                <input [type]="hideCpw ? 'password' : 'text'" class="text-input"
                       placeholder="Repeat password" formControlName="confirmPassword" autocomplete="new-password">
                <button type="button" class="toggle-btn" (click)="hideCpw = !hideCpw">{{ hideCpw ? '👁' : '🙈' }}</button>
              </div>
              <div class="field-error"
                   *ngIf="regForm.errors?.['passwordMismatch'] && f['confirmPassword'].touched">
                Passwords do not match
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" mat-raised-button class="primary-btn"
                      [disabled]="regForm.invalid || (loading$ | async)">
                <mat-spinner *ngIf="loading$ | async" diameter="20"></mat-spinner>
                <span *ngIf="!(loading$ | async)">Create Account &amp; Send OTP</span>
              </button>
            </div>

          </form>

          <!-- ── Step 2: OTP verification ── -->
          <form *ngIf="otpSent$ | async" [formGroup]="otpForm" (ngSubmit)="onVerify()">
            <p class="otp-hint">
              An OTP has been sent to <strong>{{ pendingEmail$ | async }}</strong>.
              Check your inbox (and spam folder).
            </p>

            <div class="form-field">
              <label>6-digit OTP</label>
              <input type="text" class="text-input" placeholder="Enter OTP"
                     formControlName="otp" autocomplete="one-time-code" maxlength="6">
              <div class="field-error"
                   *ngIf="otpForm.get('otp')?.touched && otpForm.get('otp')?.invalid">
                Enter a valid 6-digit OTP
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" mat-raised-button class="primary-btn"
                      [disabled]="otpForm.invalid || (loading$ | async)">
                <mat-spinner *ngIf="loading$ | async" diameter="20"></mat-spinner>
                <span *ngIf="!(loading$ | async)">Verify &amp; Create Account</span>
              </button>
              <button type="button" class="resend-btn" (click)="onResend()"
                      [disabled]="loading$ | async">
                Resend OTP
              </button>
            </div>
          </form>

          <div class="error-message" *ngIf="error$ | async as err">{{ err }}</div>
          <div class="status-message" *ngIf="statusMsg">{{ statusMsg }}</div>
        </mat-card-content>

        <mat-card-actions class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;background:linear-gradient(135deg,#0f0f23 0%,#1a1a3a 100%)}
    .auth-card{width:100%;max-width:440px;background:rgba(255,255,255,.05);backdrop-filter:blur(10px);border-radius:20px;border:1px solid rgba(255,255,255,.1);color:#fff}
    .mat-mdc-card-title{color:#ff6b35;font-size:1.9rem;font-weight:700}
    .mat-mdc-card-subtitle{color:rgba(255,255,255,.7);margin-top:.5rem}
    .mat-mdc-card-content{padding-top:1.5rem}
    .info-banner{background:rgba(255,217,0,.1);border:1px solid rgba(255,217,0,.35);color:#ffd900;border-radius:10px;padding:10px 12px;margin-bottom:1rem;font-size:.85rem}
    .form-field{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.9rem}
    .form-field label{color:rgba(255,255,255,.9);font-weight:600;font-size:.88rem}
    .text-input{width:100%;padding:11px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.05);color:#fff;outline:none;box-sizing:border-box}
    .text-input:focus{border-color:#ff6b35;box-shadow:0 0 0 3px rgba(255,107,53,.25)}
    .input-with-action{display:flex;gap:.5rem;align-items:center}
    .toggle-btn{background:none;border:none;color:#fff;cursor:pointer;font-size:1rem;flex-shrink:0}
    .field-error{color:#f44336;font-size:.8rem}
    .form-actions{display:flex;flex-direction:column;gap:.8rem;margin-top:1rem}
    .primary-btn{width:100%;background:linear-gradient(45deg,#ff6b35,#f7931e)!important;color:#fff!important;border-radius:25px!important;padding:12px 24px!important;font-weight:700!important;text-transform:uppercase}
    .resend-btn{background:none;border:1px solid rgba(255,255,255,.25);color:rgba(255,107,53,.9);border-radius:25px;padding:10px;cursor:pointer;font-size:.9rem}
    .otp-hint{color:rgba(255,255,255,.7);margin-bottom:1rem}
    .otp-hint strong{color:#fff}
    .error-message{color:#f44336;text-align:center;margin-top:1rem;padding:.5rem;background:rgba(244,67,54,.1);border-radius:8px}
    .status-message{color:#4caf50;text-align:center;margin-top:.5rem;font-size:.9rem}
    .auth-footer{text-align:center}
    .auth-footer p{margin:0;color:rgba(255,255,255,.7)}
    .auth-footer a{color:#ff6b35;text-decoration:none;font-weight:700}
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  regForm: FormGroup;
  otpForm: FormGroup;
  hidePw = true;
  hideCpw = true;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  otpSent$: Observable<boolean>;
  pendingEmail$: Observable<string | null>;
  statusMsg = '';
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store) {
    this.regForm = this.fb.group({
      age:             ['', [Validators.required, Validators.min(13), Validators.max(100)]],
      username:        ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30),
                             Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email:           ['', [Validators.required, Validators.email]],
      freeFireId:      ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      freeFireName:    ['', [Validators.required, Validators.minLength(2)]],
      // min 8 to match backend RegisterRequest.password_strong validator
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatch });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    this.loading$      = this.store.select(selectAuthLoading);
    this.error$        = this.store.select(selectAuthError);
    this.otpSent$      = this.store.select(selectRegisterOtpSent);
    this.pendingEmail$ = this.store.select(selectPendingEmail);
  }

  ngOnInit() { this.store.dispatch(clearError()); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  get f() { return this.regForm.controls; }

  private passwordMatch(form: FormGroup) {
    const pw  = form.get('password')?.value;
    const cpw = form.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  onRegister() {
    if (this.regForm.valid) {
      const v = this.regForm.value;
      this.store.dispatch(initiateRegister({
        userData: {
          username:        v.username,
          email:           v.email,
          age:             Number(v.age),
          password:        v.password,
          confirmPassword: v.confirmPassword,
          freeFireId:      v.freeFireId,
          freeFireName:    v.freeFireName,
        }
      }));
    }
  }

  onVerify() {
    if (this.otpForm.valid) {
      // take(1) prevents multiple dispatches if the selector emits more than once
      this.store.select(selectPendingEmail).pipe(take(1), takeUntil(this.destroy$)).subscribe(email => {
        if (email) {
          this.store.dispatch(verifyRegister({ email, otp: this.otpForm.value.otp }));
        }
      });
    }
  }

  onResend() {
    this.store.select(selectPendingEmail).pipe(take(1), takeUntil(this.destroy$)).subscribe(email => {
      if (email) {
        this.store.dispatch(sendOtp({ email, purpose: 'register' }));
        this.statusMsg = 'OTP resent!';
        setTimeout(() => this.statusMsg = '', 3000);
      }
    });
  }
}
