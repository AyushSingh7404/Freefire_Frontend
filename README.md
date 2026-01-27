# Firesports Fantasy Esports (Angular 18)

Production-grade Angular 18 frontend for Free Fire fantasy esports tournaments with Gamesmash-like UI.

## Prerequisites
- Node.js 18+
- npm 9+

## Setup
1. Install dependencies:
   - `npm install`
2. Run in development:
   - `npm start`
   - App served at `http://localhost:4200/`
3. Build for production:
   - `npm run build`
   - Artifacts in `dist/demo`
4. Serve production build:
   - `npm run serve:prod`

## Tech Stack
- Angular 18 (standalone components, strict TS)
- NgRx Store/Effects for Auth, Wallet, League, Leaderboard
- Angular Material (minimal, for inputs/menus)
- Lucide Icons

## Key Features
- Home: Silver, Gold, Diamond, BR leagues
- League: Divisions (1v1, 2v2, 3v3, 4v4), rooms listing, BR weekend pre-booking
- Room Join: Free Fire ID/username confirmation, coin balance check
- Wallet: Balance, Buy Coins (mock UPI), Redeem Code, transactions
- Leaderboards: Global and league-specific
- Matches History
- Auth: Login/Register with email OTP; Forgot Password via OTP
- Admin: Dashboard, Rooms/Leaderboards/Wallet/User Mgmt, Audit Logs (skeleton)

## Environments
- `src/environments/environment.ts` (dev)
- `src/environments/environment.prod.ts` (prod)

## Guards & Interceptors
- AuthGuard, AdminGuard
- JWT injection, error handling

## i18n
- English default (extendable)

## Notes
- APIs are mocked in services for local running.
- WebSocketService simulates live room updates.
