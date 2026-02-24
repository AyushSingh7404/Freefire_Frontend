import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',      icon: '📊' },
  { id: 'leagues',     label: 'League Mgmt',     icon: '🏆' },
  { id: 'rooms',       label: 'Room Mgmt',       icon: '🚪' },
  { id: 'leaderboards',label: 'Match Settlement', icon: '⚔️'  },
  { id: 'wallet',      label: 'Wallet Mgmt',     icon: '💰' },
  { id: 'users',       label: 'User Mgmt',       icon: '👥' },
  { id: 'audit',       label: 'Audit Logs',      icon: '📋' },
];

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar glass">
      <div class="sidebar-header">Admin Panel</div>
      <nav>
        <button
          *ngFor="let item of items"
          class="nav-btn"
          [class.active]="active === item.id"
          (click)="select(item.id)">
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar { padding: 1rem 0.75rem; color: white; min-height: 100%; }
    .sidebar-header { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: rgba(255,107,53,0.8); text-transform: uppercase; padding: 0 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 0.75rem; }
    nav { display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-btn { display: flex; align-items: center; gap: 0.6rem; width: 100%; background: none; border: none; color: rgba(255,255,255,0.7); padding: 0.6rem 0.75rem; border-radius: 8px; cursor: pointer; font-size: 0.88rem; text-align: left; transition: all 0.15s; }
    .nav-btn:hover { background: rgba(255,255,255,0.07); color: white; }
    .nav-btn.active { background: rgba(255,107,53,0.15); color: #ff6b35; font-weight: 600; }
    .icon { font-size: 1rem; flex-shrink: 0; }
  `],
})
export class AdminSidebarComponent {
  @Output() navigate = new EventEmitter<string>();
  @Input() active = 'dashboard';

  items = NAV_ITEMS;

  select(id: string) {
    this.active = id;
    this.navigate.emit(id);
  }
}
