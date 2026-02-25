/**
 * CoinPackage — matches GET /coin-packages API response.
 * Single source of truth for pricing, fetched from the backend.
 * Admin manages packages via /admin/coin-packages.
 */
export interface CoinPackage {
  id: string;
  coins: number;
  priceInr: number;
  isPopular: boolean;
  sortOrder: number;
}

/** Raw API response shape (snake_case from backend) */
export interface ApiCoinPackage {
  id: string;
  coins: number;
  price_inr: number;
  is_popular: boolean;
  sort_order: number;
}
