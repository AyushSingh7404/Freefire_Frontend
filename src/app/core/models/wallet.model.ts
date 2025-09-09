export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PaymentRequest {
  amount: number;
  method: 'upi' | 'card' | 'netbanking';
}

export interface RedeemCodeRequest {
  code: string;
}