import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AdminComponent } from "./features/admin/admin.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, AdminComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <!-- <app-admin></app-admin> -->
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
    }
    
    .main-content {
      min-height: calc(100vh - 80px);
      padding-top: 80px;
    }
  `]
})
export class AppComponent {
  title = 'Fantasy Esports';
}