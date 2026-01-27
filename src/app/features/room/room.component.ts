import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { selectWalletBalance } from '../../store/wallet/wallet.selectors';
import { joinRoom } from '../../store/league/league.actions';
import { Room } from '../../core/models/league.model';
import { LeagueService } from '../../core/services/league.service';
import * as LeagueActions from '../../store/league/league.actions';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="container">
      <mat-card class="glass">
        <mat-card-header>
          <mat-card-title>Join Room</mat-card-title>
          <mat-card-subtitle>Room ID: {{roomId}}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="joinForm" (ngSubmit)="onJoin()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Free Fire ID</mat-label>
                <input matInput formControlName="freeFireId">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username">
              </mat-form-field>
            </div>
            <button mat-raised-button class="btn-gaming" [disabled]="joinForm.invalid">
              Confirm Join
            </button>
          </form>

          <div class="result mt-2" *ngIf="joinedRoomId">
            <p class="text-success">Joined successfully. Room ID: <strong>{{ joinedRoomId }}</strong></p>
          </div>
          <div class="mt-2">
            <p>Balance: {{ walletBalance$ | async }} coins</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
  `]
})
export class RoomComponent implements OnInit {
  roomId: string = '';
  joinForm!: FormGroup;
  walletBalance$: Observable<number>;
  joinedRoomId: string | null = null;
  private currentBalance = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private leagueService: LeagueService
  ) {
    this.walletBalance$ = this.store.select(selectWalletBalance);
  }

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.joinForm = this.fb.group({
      freeFireId: ['', [Validators.required]],
      username: ['', [Validators.required]]
    });

    this.actions$.pipe(ofType(LeagueActions.joinRoomSuccess)).subscribe(({ roomId }) => {
      this.joinedRoomId = roomId;
    });
    this.walletBalance$.subscribe(b => this.currentBalance = b || 0);
  }

  onJoin() {
    if (this.currentBalance < 20) {
      this.router.navigate(['/wallet']);
      return;
    }
    if (this.joinForm.valid) {
      this.store.dispatch(joinRoom({ joinData: { roomId: this.roomId, freeFireId: this.joinForm.value.freeFireId } }));
    }
  }
}
