import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  // Commented out routes for components that don't exist yet
  // Uncomment these as you implement each component
  
  {
    path: 'league/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/league/league.component').then(m => m.LeagueComponent)
  },
  {
    path: 'room/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/room/room.component').then(m => m.RoomComponent)
  },
  {
    path: 'wallet',
    canActivate: [authGuard],
    loadComponent: () => import('./features/wallet/wallet.component').then(m => m.WalletComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'leaderboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
  },
  
  {
    path: '**',
    redirectTo: ''
  }
];
