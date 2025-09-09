import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { walletReducer } from './store/wallet/wallet.reducer';
import { leagueReducer } from './store/league/league.reducer';
import { leaderboardReducer } from './store/leaderboard/leaderboard.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { WalletEffects } from './store/wallet/wallet.effects';
import { LeagueEffects } from './store/league/league.effects';
import { LeaderboardEffects } from './store/leaderboard/leaderboard.effects';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(BrowserAnimationsModule),
    provideStore({
      auth: authReducer,
      wallet: walletReducer,
      league: leagueReducer,
      leaderboard: leaderboardReducer
    }),
    provideEffects([
      AuthEffects,
      WalletEffects,
      LeagueEffects,
      LeaderboardEffects
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production
    })
  ]
};