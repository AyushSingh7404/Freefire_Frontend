// ── Frontend models (camelCase) ────────────────────────────────────────────
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  availableBalance: number;   // balance - lockedBalance, computed by backend
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface TransactionListResponse {
  total: number;
  page: number;
  limit: number;
  transactions: Transaction[];
}

// ── Razorpay payment flow ──────────────────────────────────────────────────
export interface PaymentInitiateRequest {
  amount_inr: number;   // in rupees
  coins: number;        // coins to credit on success
}

export interface PaymentInitiateResponse {
  razorpay_order_id: string;
  amount_paise: number;
  currency: string;
  coins: number;
  razorpay_key_id: string;
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  coins: number;
}

// Legacy - kept for backward compat with existing actions that reference it
export interface PaymentRequest {
  amount: number;
  method: string;
}

export interface RedeemCodeRequest {
  code: string;
}

// ── Raw API response shapes ────────────────────────────────────────────────
export interface ApiWallet {
  id: string;
  user_id: string;
  balance: number;
  locked_balance: number;
  available_balance: number;
  updated_at: string;
}

export interface ApiTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  reference?: string;
  status: string;
  created_at: string;
}

export interface ApiTransactionList {
  total: number;
  page: number;
  limit: number;
  transactions: ApiTransaction[];
}
