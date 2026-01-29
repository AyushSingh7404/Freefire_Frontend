export interface User {
  id: string;
  username: string;
  email: string;
  age?: number;
  freeFireId?: string;
  freeFireName?: string;
  rank?: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

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

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
