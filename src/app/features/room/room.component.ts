import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Room Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Room component is under construction</p>
          <p>Room ID: {{roomId}}</p>
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
export class RoomComponent implements OnInit {
  roomId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
  }
}