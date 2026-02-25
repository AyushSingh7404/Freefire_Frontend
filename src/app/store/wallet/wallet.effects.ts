import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { WalletService } from '../../core/services/wallet.service';
import * as WalletActions from './wallet.actions';

@Injectable()
export class WalletEffects {

  loadWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadWallet, WalletActions.reloadWalletAfterPayment),
      exhaustMap(() =>
        this.walletService.getWallet().pipe(
          map(wallet => WalletActions.loadWalletSuccess({ wallet })),
          catchError(err => of(WalletActions.loadWalletFailure({ error: err.message })))
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
          catchError(err => of(WalletActions.loadTransactionsFailure({ error: err.message })))
        )
      )
    )
  );

  // Step 1: create Razorpay order on backend using the package UUID
  initiatePayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.initiatePayment),
      exhaustMap(({ packageId }) =>
        this.walletService.initiatePayment({ package_id: packageId }).pipe(
          map(order => WalletActions.initiatePaymentSuccess({ order })),
          catchError(err => of(WalletActions.initiatePaymentFailure({ error: err.message })))
        )
      )
    )
  );

  // Step 2: after Razorpay modal, verify the payment with backend
  verifyPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.verifyPayment),
      exhaustMap(({ verifyData }) =>
        this.walletService.verifyPayment(verifyData).pipe(
          map(res => WalletActions.verifyPaymentSuccess({ coinsCredited: res.coins_credited })),
          catchError(err => of(WalletActions.verifyPaymentFailure({ error: err.message })))
        )
      )
    )
  );

  // After payment verified: reload wallet so balance reflects immediately
  reloadAfterVerify$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.verifyPaymentSuccess),
      map(() => WalletActions.reloadWalletAfterPayment())
    )
  );

  constructor(
    private actions$: Actions,
    private walletService: WalletService
  ) {}
}
