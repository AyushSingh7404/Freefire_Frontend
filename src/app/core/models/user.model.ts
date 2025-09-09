export interface User {
  id: string;
  username: string;
  email: string;
  freeFireId?: string;
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
  password: string;
  confirmPassword: string;
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