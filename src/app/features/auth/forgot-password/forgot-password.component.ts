import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Reset Password</mat-card-title>
          <mat-card-subtitle>Enter your email to reset your password</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <div class="form-field">
              <label for="email">Email</label>
              <input id="email" type="email" class="text-input" placeholder="Enter your email" formControlName="email" autocomplete="email">
              <div class="field-error" *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
                Email is required
              </div>
              <div class="field-error" *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
                Please enter a valid email
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" mat-stroked-button class="secondary-btn" (click)="onSendOtp()">
                Send OTP
              </button>
            </div>

            <div class="form-field">
              <label for="otp">OTP</label>
              <input id="otp" type="text" class="text-input" placeholder="Enter 6-digit OTP" formControlName="otp">
            </div>

            <div class="form-field">
              <label for="newPassword">New Password</label>
              <div class="input-with-action">
                <input id="newPassword" [type]="hidePassword ? 'password' : 'text'" class="text-input" placeholder="Enter new password" formControlName="newPassword">
                <button type="button" mat-icon-button (click)="hidePassword = !hidePassword">
                </button>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" 
                      mat-raised-button 
                      class="primary-btn"
                      [disabled]="forgotPasswordForm.invalid">
                Reset Password
              </button>
              
              <a routerLink="/auth/login" class="back-to-login">
                Back to Login
              </a>
            </div>
          </form>
        </mat-card-content>
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
    
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .form-field label {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
    }
    .text-input {
      width: 100%;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background-color: rgba(255, 255, 255, 0.05);
      color: white;
      outline: none;
    }
    .text-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    .text-input:focus {
      border-color: #ff6b35;
      box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.25);
    }
    .input-with-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .field-error {
      color: #f44336;
      font-size: 0.85rem;
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
    
    .back-to-login {
      color: #ff6b35;
      text-decoration: none;
      text-align: center;
      font-size: 0.9rem;
    }
    
    .back-to-login:hover {
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  hidePassword = true;
  statusMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const { email, otp, newPassword } = this.forgotPasswordForm.value;
      this.authService.verifyOtp({ email, otp }).subscribe(res => {
        if (res.success) {
          this.authService.resetPassword('mock-token', newPassword).subscribe(() => {
            this.statusMessage = 'Password reset successful.';
          });
        } else {
          this.statusMessage = 'Invalid OTP.';
        }
      });
    }
  }

  onSendOtp() {
    const emailCtrl = this.forgotPasswordForm.get('email');
    if (emailCtrl?.valid) {
      this.authService.sendOtp(emailCtrl.value).subscribe(() => {
        this.statusMessage = 'OTP sent to your email.';
      });
    } else {
      this.statusMessage = 'Please enter a valid email to receive OTP.';
    }
  }
}
