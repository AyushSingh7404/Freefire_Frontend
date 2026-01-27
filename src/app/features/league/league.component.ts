import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { loadLeagues, loadRooms } from '../../store/league/league.actions';
import { selectRooms } from '../../store/league/league.selectors';
import { LeagueService } from '../../core/services/league.service';
import { Division } from '../../core/models/league.model';
import { RoomTileComponent } from '../../shared/components/room-tile/room-tile.component';
import { DivisionTileComponent } from '../../shared/components/division-tile/division-tile.component';
import { WebSocketService } from '../../core/services/websocket.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-league',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RoomTileComponent,
    DivisionTileComponent
  ],
  template: `
    <div class="league-container">
      <div class="header">
        <h2 class="gradient-text">{{ leagueTitle }}</h2>
        <p class="subtitle">Select a division to view rooms</p>
      </div>

      <div class="divisions-grid" *ngIf="leagueId !== 'br'; else brTemplate">
        <app-division-tile
          *ngFor="let d of divisions$ | async"
          [division]="d"
          [select]="onSelectDivision.bind(this)">
        </app-division-tile>
      </div>

      <div class="rooms-section" *ngIf="leagueId !== 'br'">
        <h3 class="text-primary">Available Rooms</h3>
        <div class="rooms-grid">
          <app-room-tile 
            *ngFor="let room of roomsLive$ | async" 
            [room]="room">
          </app-room-tile>
        </div>
      </div>

      <ng-template #brTemplate>
        <mat-card class="glass">
          <div class="br-header">
            <h3>Battle Royale Pre-Booking</h3>
            <p>Enabled only on Saturdays and Sundays</p>
          </div>
          <div *ngIf="isWeekend(); else disabledTemplate">
            <form [formGroup]="prebookForm" (ngSubmit)="onPrebook()">
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
              <button mat-raised-button class="btn-gaming" [disabled]="prebookForm.invalid">
                Pre-book BR Slot
              </button>
            </form>
          </div>
          <ng-template #disabledTemplate>
            <p class="text-warning">Pre-booking is available only on weekends.</p>
          </ng-template>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .league-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      color: white;
    }
    .header {
      margin-bottom: 1rem;
    }
    .subtitle {
      color: rgba(255,255,255,0.75);
    }
    .divisions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin: 1rem 0 2rem 0;
    }
    .rooms-section h3 {
      margin-bottom: 0.75rem;
    }
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1rem;
    }
    .br-header h3 {
      color: #ff6b35;
      margin: 0;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    @media (max-width: 768px) {
      .divisions-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .rooms-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LeagueComponent implements OnInit {
  leagueId: string = '';
  leagueTitle = '';
  divisions$!: Observable<Division[]>;
  rooms$ = this.store.select(selectRooms);
  roomsLive$!: Observable<any>;
  private selectedDivision$ = new BehaviorSubject<'1v1'|'2v2'|'3v3'|'4v4'|null>(null);
  prebookForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private leagueService: LeagueService,
    private ws: WebSocketService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.leagueId = this.route.snapshot.paramMap.get('id') || '';
    this.store.dispatch(loadLeagues());
    if (this.leagueId) {
      this.store.dispatch(loadRooms({ leagueId: this.leagueId }));
      this.leagueTitle = this.leagueId === 'silver' ? 'Silver League' :
                         this.leagueId === 'gold' ? 'Gold League' :
                         this.leagueId === 'diamond' ? 'Diamond League' : 'Battle Royale';
      this.divisions$ = this.leagueService.getDivisionsForLeague(this.leagueId);
      this.roomsLive$ = combineLatest([this.rooms$, this.selectedDivision$]).pipe(
        switchMap(([rooms, div]) => this.ws.streamRoomUpdates(
          div ? rooms.filter(r => r.division === div) : rooms
        ))
      );
    }
    this.prebookForm = this.fb.group({
      freeFireId: ['', [Validators.required]],
      username: ['', [Validators.required]]
    });
  }

  onSelectDivision(d: Division) {
    this.selectedDivision$.next(d.id);
  }

  isWeekend(): boolean {
    const day = new Date().getDay();
    return day === 6 || day === 0;
  }

  onPrebook() {
    if (this.prebookForm.valid) {
      const { freeFireId, username } = this.prebookForm.value;
      console.log('Prebook BR:', { freeFireId, username });
    }
  }
}
