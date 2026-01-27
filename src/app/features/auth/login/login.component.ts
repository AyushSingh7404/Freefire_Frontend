import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';
import { login, clearError } from '../../../store/auth/auth.actions';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Welcome Back</mat-card-title>
          <mat-card-subtitle>Login to your FireEsports account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput 
                     type="email" 
                     formControlName="email"
                     autocomplete="email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput 
                     [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password"
                     autocomplete="current-password">
              <button type="button" 
                      matSuffix 
                      mat-icon-button
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>OTP</mat-label>
              <input matInput 
                     type="text" 
                     formControlName="otp"
                     autocomplete="one-time-code">
              <mat-icon matSuffix>verified</mat-icon>
              <mat-error *ngIf="loginForm.get('otp')?.hasError('required') && otpRequired">
                OTP is required
              </mat-error>
            </mat-form-field>
            
            <div class="form-actions">
              <button type="button"
                      mat-stroked-button
                      class="secondary-btn"
                      (click)="onSendOtp()">
                Send OTP
              </button>
              <button type="submit" 
                      mat-raised-button 
                      class="primary-btn"
                      [disabled]="loginForm.invalid || (loading$ | async)">
                <mat-spinner *ngIf="loading$ | async" diameter="20"></mat-spinner>
                <span *ngIf="!(loading$ | async)">Verify & Login</span>
              </button>
              
              <a routerLink="/auth/forgot-password" class="forgot-password">
                Forgot Password?
              </a>
            </div>
            
            <div class="error-message" *ngIf="error$ | async as error">
              {{ error }}
            </div>
            <div class="text-center mt-2" *ngIf="statusMessage">
              {{ statusMessage }}
            </div>
          </form>
        </mat-card-content>
        
        <mat-card-actions class="auth-footer">
          <p>
            Don't have an account? 
            <a routerLink="/auth/register">Sign up</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
    }
    
    .auth-card {
      width: 100%;
      max-width: 400px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .mat-mdc-card-header {
      text-align: center;
      padding-bottom: 0;
    }
    
    .mat-mdc-card-title {
      color: #ff6b35;
      font-size: 2rem;
      font-weight: bold;
    }
    
    .mat-mdc-card-subtitle {
      color: rgba(255, 255, 255, 0.7);
      margin-top: 0.5rem;
    }
    
    .mat-mdc-card-content {
      padding-top: 2rem;
    }
    
    .mat-mdc-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }
    
    ::ng-deep .mat-mdc-form-field-input-control {
      color: white;
    }
    
    ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.7);
    }
    
    ::ng-deep .mat-mdc-outline {
      color: rgba(255, 255, 255, 0.3);
    }
    
    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .primary-btn {
      width: 100%;
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      border-radius: 25px;
      padding: 12px 24px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .forgot-password {
      color: #ff6b35;
      text-decoration: none;
      text-align: center;
      font-size: 0.9rem;
    }
    
    .forgot-password:hover {
      text-decoration: underline;
    }
    
    .error-message {
      color: #f44336;
      text-align: center;
      margin-top: 1rem;
      padding: 0.5rem;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 8px;
    }
    
    .auth-footer {
      text-align: center;
      padding-top: 0;
    }
    
    .auth-footer p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .auth-footer a {
      color: #ff6b35;
      text-decoration: none;
      font-weight: bold;
    }
    
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  otpRequired = false;
  statusMessage = '';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      otp: ['']
    });

    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit() {
    this.store.dispatch(clearError());
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, otp } = this.loginForm.value;
      if (!otp) {
        this.otpRequired = true;
        this.statusMessage = 'Please enter the OTP sent to your email.';
        return;
      }
      this.authService.verifyOtp({ email, otp }).subscribe(res => {
        if (res.success) {
          this.store.dispatch(login({ credentials: { email, password: this.loginForm.value.password } }));
        } else {
          this.statusMessage = 'Invalid OTP. Please try again.';
        }
      });
    }
  }

  onSendOtp() {
    const emailCtrl = this.loginForm.get('email');
    if (emailCtrl?.valid) {
      this.authService.sendOtp(emailCtrl.value).subscribe(() => {
        this.statusMessage = 'OTP sent to your email.';
        this.otpRequired = true;
      });
    } else {
      this.statusMessage = 'Please enter a valid email to receive OTP.';
    }
  }
}
