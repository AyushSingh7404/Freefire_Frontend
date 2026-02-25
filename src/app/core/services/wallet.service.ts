import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Wallet, Transaction, TransactionListResponse,
  PaymentInitiateRequest, PaymentInitiateResponse, PaymentVerifyRequest,
  ApiWallet, ApiTransaction, ApiTransactionList,
} from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly base = `${environment.apiUrl}/wallet`;

  constructor(private http: HttpClient) {}

  // ── Mappers ──────────────────────────────────────────────────────────────

  private mapWallet(w: ApiWallet): Wallet {
    return {
      id: w.id,
      userId: w.user_id,
      balance: w.balance,
      updatedAt: new Date(w.updated_at),
    };
  }

  private mapTx(t: ApiTransaction): Transaction {
    return {
      id: t.id,
      type: t.type as 'credit' | 'debit',
      amount: t.amount,
      description: t.description,
      reference: t.reference,
      status: t.status as 'pending' | 'completed' | 'failed',
      createdAt: new Date(t.created_at),
    };
  }

  // ── GET /wallet — current user's coin balance ─────────────────────────────
  getWallet(): Observable<Wallet> {
    return this.http
      .get<ApiWallet>(`${this.base}`)
      .pipe(map(w => this.mapWallet(w)));
  }

  // ── GET /wallet/transactions — paginated history ───────────────────────────
  getTransactions(page = 1, limit = 20): Observable<Transaction[]> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http
      .get<ApiTransactionList>(`${this.base}/transactions`, { params })
      .pipe(map(res => res.transactions.map(t => this.mapTx(t))));
  }

  // ── Razorpay step 1 — POST /wallet/payment/initiate ───────────────────────
  initiatePayment(req: PaymentInitiateRequest): Observable<PaymentInitiateResponse> {
    return this.http.post<PaymentInitiateResponse>(
      `${this.base}/payment/initiate`, req
    );
  }

  // ── Razorpay step 2 — POST /wallet/payment/verify ────────────────────────
  verifyPayment(req: PaymentVerifyRequest): Observable<{ message: string; coins_credited: number }> {
    return this.http.post<{ message: string; coins_credited: number }>(
      `${this.base}/payment/verify`, req
    );
  }
}
