import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatCardModule, AdminSidebarComponent],
  template: `
    <div class="container">
      <div class="layout">
        <app-admin-sidebar (navigate)="view = $event"></app-admin-sidebar>
        <div class="content">
          <mat-card class="glass" *ngIf="view === 'dashboard'">
            <h3 class="gradient-text">Dashboard</h3>
            <div class="grid">
              <div class="stat">Rooms: 12</div>
              <div class="stat">Players: 340</div>
              <div class="stat">Coins: 125,000</div>
            </div>
          </mat-card>

          <mat-card class="glass" *ngIf="view === 'rooms'">
            <h3 class="gradient-text">Rooms Management</h3>
            <p>Create, assign IDs, publish/unpublish rooms.</p>
          </mat-card>

          <mat-card class="glass" *ngIf="view === 'leaderboards'">
            <h3 class="gradient-text">Leaderboards Management</h3>
            <p>Approve and settle matches, update results.</p>
          </mat-card>

          <mat-card class="glass" *ngIf="view === 'wallet'">
            <h3 class="gradient-text">Wallet Management</h3>
            <p>Credit/debit coins for users.</p>
          </mat-card>

          <mat-card class="glass" *ngIf="view === 'users'">
            <h3 class="gradient-text">User Management</h3>
            <p>Ban/revoke users and view profiles.</p>
          </mat-card>

          <mat-card class="glass" *ngIf="view === 'audit'">
            <h3 class="gradient-text">Audit Logs</h3>
            <p>Read-only audit trail.</p>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .layout { display: grid; grid-template-columns: 240px 1fr; gap: 1rem; }
    .content { display: grid; gap: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
    .stat { background: rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; }
    @media (max-width: 768px) { .layout { grid-template-columns: 1fr; } }
  `]
})
export class AdminComponent {
  view: string = 'dashboard';
}
