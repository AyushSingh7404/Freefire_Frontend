import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, MatListModule],
  template: `
    <div class="sidebar glass">
      <mat-nav-list>
        <a mat-list-item (click)="navigate.emit('dashboard')">Dashboard</a>
        <a mat-list-item (click)="navigate.emit('rooms')">Rooms Mgmt</a>
        <a mat-list-item (click)="navigate.emit('leaderboards')">Leaderboards Mgmt</a>
        <a mat-list-item (click)="navigate.emit('wallet')">Wallet Mgmt</a>
        <a mat-list-item (click)="navigate.emit('users')">User Mgmt</a>
        <a mat-list-item (click)="navigate.emit('audit')">Audit Logs</a>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar { width: 240px; padding: 1rem; color: white; }
  `]
})
export class AdminSidebarComponent {
  @Output() navigate = new EventEmitter<string>();
}
