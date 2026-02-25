// ── Frontend models (camelCase) ────────────────────────────────────────────
/**
 * Closed coin economy — single balance only.
 * No withdrawals, no locked balance, no split between deposit vs winning coins.
 */
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
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
  /** UUID of the CoinPackage chosen by the user. Backend looks up price and coins. */
  package_id: string;
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

// Note: No withdrawal interfaces exist — Aurex uses a closed coin economy.
// Coins cannot be withdrawn as real money. See wallet.component for disclaimer.

// ── Raw API response shapes ────────────────────────────────────────────────
export interface ApiWallet {
  id: string;
  user_id: string;
  balance: number;
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
