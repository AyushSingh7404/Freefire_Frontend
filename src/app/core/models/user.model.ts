// ── Frontend model (camelCase) ─────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  age?: number;
  freeFireId?: string;
  freeFireName?: string;
  rank?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

// ── Minimal user shape returned alongside tokens ───────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
  avatarUrl?: string;
  freeFireId?: string;
}

// ── Auth response after OTP verification (loginSuccess / registerSuccess) ──
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// ── Request shapes ─────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  age: number;
  password: string;
  confirmPassword: string;
  freeFireId?: string;
  freeFireName?: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface UpdateProfileRequest {
  username?: string;
  age?: number;
  freeFireId?: string;
  freeFireName?: string;
}

// ── Raw API response shapes (snake_case — what FastAPI actually sends) ─────
// Used only inside service files for mapping; never used in components.
export interface ApiUser {
  id: string;
  username: string;
  email: string;
  age?: number;
  free_fire_id?: string;
  free_fire_name?: string;
  rank?: string;
  avatar_url?: string;
  is_admin: boolean;
  is_verified: boolean;
  is_banned: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface ApiAuthUser {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  is_verified: boolean;
  avatar_url?: string;
  free_fire_id?: string;
}

export interface ApiAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: ApiAuthUser;
}
