import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { WalletService } from '../../core/services/wallet.service';
import * as WalletActions from './wallet.actions';

@Injectable()
export class WalletEffects {
  
  loadWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadWallet),
      exhaustMap(() =>
        this.walletService.getWallet().pipe(
          map(wallet => WalletActions.loadWalletSuccess({ wallet })),
          catchError(error => of(WalletActions.loadWalletFailure({ error: error.message })))
        )
      )
    )
  );

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadTransactions),
      exhaustMap(() =>
        this.walletService.getTransactions().pipe(
          map(transactions => WalletActions.loadTransactionsSuccess({ transactions })),
          catchError(error => of(WalletActions.loadTransactionsFailure({ error: error.message })))
        )
      )
    )
  );

  processPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.processPayment),
      exhaustMap(({ paymentData }) =>
        this.walletService.processPayment(paymentData).pipe(
          map(() => WalletActions.processPaymentSuccess()),
          catchError(error => of(WalletActions.processPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  redeemCode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.redeemCode),
      exhaustMap(({ codeData }) =>
        this.walletService.redeemCode(codeData).pipe(
          map(({ amount }) => WalletActions.redeemCodeSuccess({ amount })),
          catchError(error => of(WalletActions.redeemCodeFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private walletService: WalletService
  ) {}
}