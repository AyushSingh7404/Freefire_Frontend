import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { loadLeagues, loadRooms } from '../../store/league/league.actions';

@Component({
  selector: 'app-league',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>League Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>League component is under construction</p>
          <p>League ID: {{leagueId}}</p>
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
  `]
})
export class LeagueComponent implements OnInit {
  leagueId: string = '';

  constructor(
    private route: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.leagueId = this.route.snapshot.paramMap.get('id') || '';
    this.store.dispatch(loadLeagues());
    if (this.leagueId) {
      this.store.dispatch(loadRooms({ leagueId: this.leagueId }));
    }
  }
}