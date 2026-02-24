import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectAuthLoading, selectAuthError,
  selectResetOtpSent, selectResetSuccess, selectPendingEmail
} from '../../../store/auth/auth.selectors';
import { forgotPassword, resetPassword, sendOtp, clearError } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Reset Password</mat-card-title>
          <mat-card-subtitle>Enter your email to receive a reset OTP</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>

          <!-- ── Success screen ── -->
          <div *ngIf="resetSuccess$ | async" class="success-screen">
            <div class="success-icon">✅</div>
            <p>Password reset successfully!</p>
            <a routerLink="/auth/login" class="primary-link">Back to Login</a>
          </div>

          <!-- ── Step 1: email ── -->
          <form *ngIf="!(resetOtpSent$ | async) && !(resetSuccess$ | async)"
                [formGroup]="emailForm" (ngSubmit)="onSendOtp()">
            <div class="form-field">
              <label>Email</label>
              <input type="email" class="text-input" placeholder="Your account email"
                     formControlName="email" autocomplete="email">
              <div class="field-error"
                   *ngIf="emailForm.get('email')?.touched && emailForm.get('email')?.invalid">
                Enter a valid email
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" mat-raised-button class="primary-btn"
                      [disabled]="emailForm.invalid || (loading$ | async)">
                <mat-spinner *ngIf="loading$ | async" diameter="20"></mat-spinner>
                <span *ngIf="!(loading$ | async)">Send Reset OTP</span>
              </button>
              <a routerLink="/auth/login" class="back-link">Back to Login</a>
            </div>
          </form>

          <!-- ── Step 2: OTP + new password ── -->
          <form *ngIf="(resetOtpSent$ | async) && !(resetSuccess$ | async)"
                [formGroup]="resetForm" (ngSubmit)="onReset()">
            <p class="otp-hint">
              OTP sent to <strong>{{ pendingEmail$ | async }}</strong>
            </p>

            <div class="form-field">
              <label>6-digit OTP</label>
              <input type="text" class="text-input" placeholder="Enter OTP"
                     formControlName="otp" autocomplete="one-time-code" maxlength="6">
              <div class="field-error"
                   *ngIf="resetForm.get('otp')?.touched && resetForm.get('otp')?.invalid">
                Enter a valid 6-digit OTP
              </div>
            </div>

            <div class="form-field">
              <label>New Password</label>
              <div class="input-with-action">
                <input [type]="hidePw ? 'password' : 'text'" class="text-input"
                       placeholder="New password (min 6 chars)"
                       formControlName="newPassword" autocomplete="new-password">
                <button type="button" class="toggle-btn" (click)="hidePw = !hidePw">{{ hidePw ? '👁' : '🙈' }}</button>
              </div>
              <div class="field-error"
                   *ngIf="resetForm.get('newPassword')?.touched && resetForm.get('newPassword')?.invalid">
                At least 6 characters
              </div>
            </div>

            <div class="form-field">
              <label>Confirm New Password</label>
              <div class="input-with-action">
                <input [type]="hideCpw ? 'password' : 'text'" class="text-input"
                       placeholder="Repeat new password"
                       formControlName="confirmPassword" autocomplete="new-password">
                <button type="button" class="toggle-btn" (click)="hideCpw = !hideCpw">{{ hideCpw ? '👁' : '🙈' }}</button>
              </div>
              <div class="field-error"
                   *ngIf="resetForm.errors?.['passwordMismatch'] && resetForm.get('confirmPassword')?.touched">
                Passwords do not match
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" mat-raised-button class="primary-btn"
                      [disabled]="resetForm.invalid || (loading$ | async)">
                <mat-spinner *ngIf="loading$ | async" diameter="20"></mat-spinner>
                <span *ngIf="!(loading$ | async)">Reset Password</span>
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
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;background:linear-gradient(135deg,#0f0f23 0%,#1a1a3a 100%)}
    .auth-card{width:100%;max-width:400px;background:rgba(255,255,255,.05);backdrop-filter:blur(10px);border-radius:20px;border:1px solid rgba(255,255,255,.1);color:#fff}
    .mat-mdc-card-title{color:#ff6b35;font-size:2rem;font-weight:700}
    .mat-mdc-card-subtitle{color:rgba(255,255,255,.7);margin-top:.5rem}
    .mat-mdc-card-content{padding-top:2rem}
    .form-field{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1rem}
    .form-field label{color:rgba(255,255,255,.9);font-weight:600}
    .text-input{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.05);color:#fff;outline:none;box-sizing:border-box}
    .text-input:focus{border-color:#ff6b35;box-shadow:0 0 0 3px rgba(255,107,53,.25)}
    .input-with-action{display:flex;gap:.5rem;align-items:center}
    .toggle-btn{background:none;border:none;color:#fff;cursor:pointer;font-size:1rem;flex-shrink:0}
    .field-error{color:#f44336;font-size:.82rem}
    .form-actions{display:flex;flex-direction:column;gap:.8rem;margin-top:1rem}
    .primary-btn{width:100%;background:linear-gradient(45deg,#ff6b35,#f7931e)!important;color:#fff!important;border-radius:25px!important;padding:12px 24px!important;font-weight:700!important;text-transform:uppercase}
    .resend-btn,.back-link{background:none;border:1px solid rgba(255,255,255,.25);color:rgba(255,107,53,.9);border-radius:25px;padding:10px;cursor:pointer;font-size:.9rem;text-align:center;text-decoration:none;display:block}
    .otp-hint{color:rgba(255,255,255,.7);margin-bottom:1rem}
    .otp-hint strong{color:#fff}
    .error-message{color:#f44336;text-align:center;margin-top:1rem;padding:.5rem;background:rgba(244,67,54,.1);border-radius:8px}
    .status-message{color:#4caf50;text-align:center;margin-top:.5rem}
    .success-screen{text-align:center;padding:2rem 0}
    .success-icon{font-size:3rem;margin-bottom:1rem}
    .success-screen p{color:rgba(255,255,255,.8);margin-bottom:1.5rem}
    .primary-link{color:#ff6b35;text-decoration:none;font-weight:700}
  `]
})
export class ForgotPasswordComponent implements OnInit {
  emailForm: FormGroup;
  resetForm: FormGroup;
  hidePw = true;
  hideCpw = true;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  resetOtpSent$: Observable<boolean>;
  resetSuccess$: Observable<boolean>;
  pendingEmail$: Observable<string | null>;
  statusMsg = '';

  constructor(private fb: FormBuilder, private store: Store) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.resetForm = this.fb.group({
      otp:             ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatch });

    this.loading$      = this.store.select(selectAuthLoading);
    this.error$        = this.store.select(selectAuthError);
    this.resetOtpSent$ = this.store.select(selectResetOtpSent);
    this.resetSuccess$ = this.store.select(selectResetSuccess);
    this.pendingEmail$ = this.store.select(selectPendingEmail);
  }

  ngOnInit() { this.store.dispatch(clearError()); }

  private passwordMatch(form: FormGroup) {
    const pw = form.get('newPassword')?.value;
    const cpw = form.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  onSendOtp() {
    if (this.emailForm.valid) {
      this.store.dispatch(forgotPassword({ email: this.emailForm.value.email }));
    }
  }

  onReset() {
    if (this.resetForm.valid) {
      const { otp, newPassword } = this.resetForm.value;
      // Backend only needs { email, otp, new_password } — confirmPassword is frontend-only
      this.store.select(selectPendingEmail).subscribe(email => {
        if (email) {
          this.store.dispatch(resetPassword({ email, otp, newPassword }));
        }
      }).unsubscribe();
    }
  }

  onResend() {
    this.store.select(selectPendingEmail).subscribe(email => {
      if (email) {
        this.store.dispatch(sendOtp({ email, purpose: 'forgot_password' }));
        this.statusMsg = 'OTP resent!';
        setTimeout(() => this.statusMsg = '', 3000);
      }
    }).unsubscribe();
  }
}
