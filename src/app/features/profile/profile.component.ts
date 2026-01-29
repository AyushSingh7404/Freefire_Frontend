import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Observable, firstValueFrom } from 'rxjs';
import { User } from '../../core/models/user.model';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { updateUser } from '../../store/auth/auth.actions';
import { selectWalletBalance } from '../../store/wallet/wallet.selectors';
import { deductCoins } from '../../store/wallet/wallet.actions';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm">
            <div class="info-row">
              <div class="info-item">
                <label>Login Email</label>
                <div class="readonly">{{ (user$ | async)?.email }}</div>
              </div>
              <div class="info-item">
                <label>Rank</label>
                <div class="readonly">{{ (user$ | async)?.rank || 'Diamond' }}</div>
              </div>
            </div>
            
            <div class="form-field">
              <label for="username">Username</label>
              <input id="username" type="text" class="text-input" formControlName="username" autocomplete="username">
            </div>
            
            <div class="form-field">
              <div class="field-header">
                <label for="freeFireId">Free Fire UID</label>
                <button type="button" class="edit-btn" (click)="enableEdit('freeFireId')">Edit (10 coins)</button>
              </div>
              <input id="freeFireId" type="text" class="text-input" formControlName="freeFireId" [disabled]="!uidEditable" placeholder="Enter your Free Fire UID">
            </div>
            
            <div class="form-field">
              <div class="field-header">
                <label for="freeFireName">Free Fire Username</label>
                <button type="button" class="edit-btn" (click)="enableEdit('freeFireName')">Edit (10 coins)</button>
              </div>
              <input id="freeFireName" type="text" class="text-input" formControlName="freeFireName" [disabled]="!nameEditable" placeholder="Enter your in-game name">
            </div>
            
            <div class="actions">
              <button mat-button type="button" class="cancel-btn" (click)="onCancel()">Cancel</button>
              <button mat-raised-button type="button" class="save-btn" (click)="onSave()" [disabled]="profileForm.invalid">Save</button>
            </div>
          </form>
          
          <div class="note">
            These details are important. Fill them correctly — you cannot join rooms if UID or name are incorrect.
          </div>
          <div class="status" *ngIf="statusMessage">{{ statusMessage }}</div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
    }
    .profile-card {
      width: 100%;
      max-width: 640px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    }
    .mat-mdc-card-title { color: #ff6b35; font-weight: bold; }
    .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .info-item label { color: rgba(255,255,255,0.9); font-weight: 600; }
    .readonly { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 12px; }
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .text-input { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.3); background-color: rgba(255, 255, 255, 0.05); color: white; outline: none; }
    .text-input::placeholder { color: rgba(255,255,255,0.6); }
    .text-input:focus { border-color: #ff6b35; box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.25); }
    .field-header { display: flex; align-items: center; justify-content: space-between; }
    .edit-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    .actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
    .save-btn { background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; border-radius: 25px; padding: 10px 18px; }
    .cancel-btn { color: white; border-radius: 25px; padding: 10px 18px; }
    .note { margin-top: 1rem; color: rgba(255,255,255,0.8); font-size: 0.9rem; }
    .status { margin-top: 0.5rem; color: #f44336; }
    @media (max-width: 600px) { .info-row { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  walletBalance$: Observable<number>;
  profileForm: FormGroup;
  uidEditable = false;
  nameEditable = false;
  originalValues: any;
  statusMessage = '';

  constructor(private fb: FormBuilder, private store: Store) {
    this.user$ = this.store.select(selectCurrentUser);
    this.walletBalance$ = this.store.select(selectWalletBalance);
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      freeFireId: ['', [Validators.pattern(/^[0-9]{6,12}$/)]],
      freeFireName: ['', [Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.user$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          username: user.username,
          freeFireId: user.freeFireId || '',
          freeFireName: user.freeFireName || ''
        });
        this.originalValues = this.profileForm.value;
      }
    });
  }

  async enableEdit(field: 'freeFireId' | 'freeFireName') {
    const balance = await firstValueFrom(this.walletBalance$);
    if (balance < 10) {
      this.statusMessage = 'Insufficient coins to edit.';
      return;
    }
    this.store.dispatch(deductCoins({ amount: 10, reason: `Edit ${field}` }));
    if (field === 'freeFireId') this.uidEditable = true;
    if (field === 'freeFireName') this.nameEditable = true;
    this.statusMessage = '';
  }

  onCancel() {
    this.profileForm.patchValue(this.originalValues);
    this.uidEditable = false;
    this.nameEditable = false;
    this.statusMessage = '';
  }

  onSave() {
    if (this.profileForm.valid) {
      this.store.dispatch(updateUser({ user: this.profileForm.value }));
      this.uidEditable = false;
      this.nameEditable = false;
      this.originalValues = this.profileForm.value;
      this.statusMessage = 'Profile updated.';
    }
  }
}
