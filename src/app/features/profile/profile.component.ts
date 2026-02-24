import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Observable, firstValueFrom } from 'rxjs';
import { User } from '../../core/models/user.model';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { updateUserInStore } from '../../store/auth/auth.actions';
import { selectWalletBalance } from '../../store/wallet/wallet.selectors';
import { AuthService } from '../../core/services/auth.service';

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
          <div class="avatar-row">
            <div class="avatar-wrapper">
              <img [src]="avatarPreview || (user$ | async)?.avatarUrl || 'https://ui-avatars.com/api/?name=' + ((user$ | async)?.username || 'Player')"
                   alt="Avatar" class="avatar-img">
              <div class="avatar-actions">
                <button mat-button type="button" class="edit-btn" (click)="fileInput.click()" [disabled]="uploading">
                  {{ uploading ? 'Uploading...' : 'Change Avatar' }}
                </button>
                <div class="hint">PNG/JPG under 2 MB</div>
              </div>
            </div>
            <input #fileInput type="file" accept="image/*" hidden (change)="onAvatarSelected($event)">
          </div>

          <form [formGroup]="profileForm">
            <div class="info-row">
              <div class="info-item">
                <label>Email</label>
                <div class="readonly">{{ (user$ | async)?.email }}</div>
              </div>
              <div class="info-item">
                <label>Rank</label>
                <div class="readonly">{{ (user$ | async)?.rank || '—' }}</div>
              </div>
            </div>

            <div class="form-field">
              <label for="username">Username</label>
              <input id="username" type="text" class="text-input" formControlName="username" autocomplete="username">
            </div>

            <div class="form-field">
              <div class="field-header">
                <label for="freeFireId">Free Fire UID</label>
                <button type="button" class="edit-btn" (click)="enableEdit('freeFireId')">
                  Edit (10 coins)
                </button>
              </div>
              <input id="freeFireId" type="text" class="text-input" formControlName="freeFireId"
                     placeholder="Enter your Free Fire UID">
            </div>

            <div class="form-field">
              <div class="field-header">
                <label for="freeFireName">Free Fire Username</label>
                <button type="button" class="edit-btn" (click)="enableEdit('freeFireName')">
                  Edit (10 coins)
                </button>
              </div>
              <input id="freeFireName" type="text" class="text-input" formControlName="freeFireName"
                     placeholder="Enter your in-game name">
            </div>

            <div class="actions">
              <button mat-button type="button" class="cancel-btn" (click)="onCancel()">Cancel</button>
              <button mat-raised-button type="button" class="save-btn"
                      (click)="onSave()" [disabled]="profileForm.invalid || saving">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>

          <div class="note">
            Fill these details correctly — you cannot join rooms if your UID or in-game name are incorrect.
          </div>
          <div class="status success" *ngIf="successMessage">{{ successMessage }}</div>
          <div class="status error"   *ngIf="errorMessage">{{ errorMessage }}</div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%); }
    .profile-card { width: 100%; max-width: 640px; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); color: white; }
    .mat-mdc-card-title { color: #ff6b35; font-weight: bold; }
    .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .info-item label { color: rgba(255,255,255,0.9); font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 0.3rem; }
    .readonly { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 12px; color: rgba(255,255,255,0.7); }
    .form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .form-field > label { color: rgba(255,255,255,0.9); font-weight: 600; font-size: 0.9rem; }
    .text-input { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); color: white; outline: none; box-sizing: border-box; }
    .text-input:disabled { opacity: 0.4; cursor: not-allowed; }
    .text-input:focus { border-color: #ff6b35; box-shadow: 0 0 0 3px rgba(255,107,53,0.25); }
    .field-header { display: flex; align-items: center; justify-content: space-between; }
    .edit-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,107,53,0.9); border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 0.8rem; }
    .actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
    .save-btn { background: linear-gradient(45deg, #ff6b35, #f7931e) !important; color: white !important; border-radius: 25px !important; padding: 10px 24px !important; }
    .cancel-btn { color: rgba(255,255,255,0.7) !important; }
    .note { margin-top: 1rem; color: rgba(255,217,0,0.8); font-size: 0.85rem; background: rgba(255,217,0,0.08); border-radius: 8px; padding: 8px 12px; }
    .status { margin-top: 0.75rem; font-size: 0.9rem; }
    .status.success { color: #4caf50; }
    .status.error { color: #f44336; }
    @media (max-width: 600px) { .info-row { grid-template-columns: 1fr; } }
    .avatar-row { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .avatar-wrapper { display: flex; align-items: center; gap: 1rem; }
    .avatar-img { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.2); }
    .avatar-actions { display: flex; flex-direction: column; gap: 0.3rem; }
    .hint { font-size: 0.75rem; color: rgba(255,255,255,0.6); }
  `]
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  walletBalance$: Observable<number>;
  profileForm: FormGroup;
  uidEditable = false;
  nameEditable = false;
  originalValues: any;
  saving = false;
  uploading = false;
  avatarPreview: string | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private store: Store, private authService: AuthService) {
    this.user$ = this.store.select(selectCurrentUser);
    this.walletBalance$ = this.store.select(selectWalletBalance);
    this.profileForm = this.fb.group({
      username:    ['', [Validators.required, Validators.minLength(3)]],
      freeFireId:  [{ value: '', disabled: true }, [Validators.pattern(/^[0-9]{6,12}$/)]],
      freeFireName:[{ value: '', disabled: true }, [Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.user$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          username:     user.username,
          freeFireId:   user.freeFireId || '',
          freeFireName: user.freeFireName || '',
        });
        this.originalValues = this.profileForm.getRawValue();
        this.avatarPreview = user.avatarUrl || null;
      }
    });
  }

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'Image must be under 2 MB.';
      return;
    }
    this.uploading = true;
    this.errorMessage = '';
    try {
      const res = await firstValueFrom(this.authService.uploadAvatar(file));
      this.avatarPreview = res.avatar_url;
      const user = await firstValueFrom(this.user$);
      if (user) {
        this.store.dispatch(updateUserInStore({ user: { ...user, avatarUrl: res.avatar_url } }));
      }
      this.successMessage = 'Avatar updated.';
    } catch (err: any) {
      this.errorMessage = err?.message || 'Failed to upload avatar.';
    } finally {
      this.uploading = false;
      input.value = '';
    }
  }

  async enableEdit(field: 'freeFireId' | 'freeFireName') {
    const balance = await firstValueFrom(this.walletBalance$);
    if (balance < 10) {
      this.errorMessage = 'You need at least 10 coins to edit this field.';
      return;
    }
    // The actual coin deduction happens when the user saves (backend deducts via updateProfile)
    this.profileForm.get(field)?.enable();
    if (field === 'freeFireId')   this.uidEditable = true;
    if (field === 'freeFireName') this.nameEditable = true;
    this.errorMessage = '';
  }

  onCancel() {
    this.profileForm.patchValue(this.originalValues);
    this.profileForm.get('freeFireId')?.disable();
    this.profileForm.get('freeFireName')?.disable();
    this.uidEditable = false;
    this.nameEditable = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSave() {
    if (this.profileForm.valid) {
      this.saving = true;
      this.successMessage = '';
      this.errorMessage = '';
      const raw = this.profileForm.getRawValue();
      this.authService.updateProfile({
        username: raw.username,
        freeFireId: raw.freeFireId || undefined,
        freeFireName: raw.freeFireName || undefined,
      }).subscribe({
        next: (updatedUser) => {
          this.store.dispatch(updateUserInStore({ user: updatedUser }));
          this.profileForm.get('freeFireId')?.disable();
          this.profileForm.get('freeFireName')?.disable();
          this.uidEditable = false;
          this.nameEditable = false;
          this.originalValues = this.profileForm.getRawValue();
          this.saving = false;
          this.successMessage = 'Profile saved successfully.';
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.message || 'Failed to save profile.';
        }
      });
    }
  }
}
