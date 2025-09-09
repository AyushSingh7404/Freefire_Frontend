import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Wallet, 
  Transaction, 
  PaymentRequest, 
  RedeemCodeRequest 
} from '../models/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly apiUrl = `${environment.apiUrl}/wallet`;

  constructor(private http: HttpClient) {}

  // Mock data
  private mockWallet: Wallet = {
    id: '1',
    userId: '1',
    balance: 1500,
    lockedBalance: 100,
    updatedAt: new Date()
  };

  private mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: '1',
      type: 'credit',
      amount: 1000,
      description: 'Initial bonus',
      reference: 'BONUS001',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: '2',
      userId: '1',
      type: 'debit',
      amount: 50,
      description: 'Room entry fee',
      reference: 'ROOM001',
      status: 'completed',
      createdAt: new Date(Date.now() - 43200000)
    },
    {
      id: '3',
      userId: '1',
      type: 'credit',
      amount: 200,
      description: 'Tournament win',
      reference: 'WIN001',
      status: 'completed',
      createdAt: new Date(Date.now() - 21600000)
    }
  ];

  getWallet(): Observable<Wallet> {
    return of(this.mockWallet).pipe(delay(500));
  }

  getTransactions(): Observable<Transaction[]> {
    return of(this.mockTransactions).pipe(delay(500));
  }

  processPayment(paymentData: PaymentRequest): Observable<{ success: boolean; transactionId: string }> {
    return of({
      success: true,
      transactionId: 'TXN' + Date.now()
    }).pipe(delay(2000));
  }

  redeemCode(codeData: RedeemCodeRequest): Observable<{ success: boolean; amount: number }> {
    return of({
      success: true,
      amount: 100
    }).pipe(delay(1000));
  }

  deductCoins(amount: number): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(500));
  }

  addCoins(amount: number, description: string): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(500));
  }
}