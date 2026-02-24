import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User, AuthUser, AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest,
  ApiUser, ApiAuthUser, ApiAuthResponse
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base      = `${environment.apiUrl}/auth`;
  private readonly usersBase = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // ── Mapping helpers ──────────────────────────────────────────────────────

  private mapApiUser(u: ApiUser): User {
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      age: u.age,
      freeFireId: u.free_fire_id,
      freeFireName: u.free_fire_name,
      rank: u.rank,
      avatarUrl: u.avatar_url,
      isAdmin: u.is_admin,
      isVerified: u.is_verified,
      isBanned: u.is_banned,
      createdAt: new Date(u.created_at),
      lastLoginAt: u.last_login_at ? new Date(u.last_login_at) : undefined,
    };
  }

  private mapApiAuthUser(u: ApiAuthUser): AuthUser {
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      isAdmin: u.is_admin,
      isVerified: u.is_verified,
      avatarUrl: u.avatar_url,
      freeFireId: u.free_fire_id,
    };
  }

  private mapApiAuthResponse(r: ApiAuthResponse): AuthResponse {
    return {
      accessToken: r.access_token,
      refreshToken: r.refresh_token,
      user: this.mapApiAuthUser(r.user),
    };
  }

  // ── LOGIN: single step — credentials → tokens immediately (NO OTP) ───────
  // Backend LoginRequest uses JSON body with `email` field (NOT OAuth2 form-encoded).
  // POST /auth/login → {access_token, refresh_token, token_type, user}
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<ApiAuthResponse>(`${this.base}/login`, { email, password })
      .pipe(map(r => this.mapApiAuthResponse(r)));
  }

  // ── REGISTER step 1: create unverified account + send OTP ────────────────
  // Backend validates confirm_password == password server-side too.
  initiateRegister(userData: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/register`, {
      username:         userData.username,
      email:            userData.email,
      age:              userData.age,
      password:         userData.password,
      confirm_password: userData.confirmPassword,  // required by backend schema
      free_fire_id:     userData.freeFireId,
      free_fire_name:   userData.freeFireName,
    });
  }

  // ── REGISTER step 2: verify OTP → receive tokens ─────────────────────────
  verifyRegister(email: string, otp: string): Observable<AuthResponse> {
    return this.http
      .post<ApiAuthResponse>(`${this.base}/verify-register`, { email, otp })
      .pipe(map(r => this.mapApiAuthResponse(r)));
  }

  // ── OTP resend (register or forgot_password purposes) ────────────────────
  sendOtp(email: string, purpose: 'register' | 'forgot_password'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/send-otp`, { email, purpose });
  }

  // ── Refresh access token ──────────────────────────────────────────────────
  refreshToken(refreshToken: string): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http
      .post<{ access_token: string; refresh_token: string }>(
        `${this.base}/refresh`,
        { refresh_token: refreshToken }
      )
      .pipe(map(r => ({ accessToken: r.access_token, refreshToken: r.refresh_token })));
  }

  // ── Forgot password: send OTP ─────────────────────────────────────────────
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/forgot-password`, { email });
  }

  // ── Reset password: OTP + new password ───────────────────────────────────
  // Backend ResetPasswordRequest requires BOTH new_password AND confirm_password,
  // and validates they match (Pydantic model_validator).
  // Frontend validates equality before dispatching — we pass newPassword for both.
  resetPassword(email: string, otp: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password`, {
      email,
      otp,
      new_password:     newPassword,
      confirm_password: newPassword,  // required by backend; equality already verified on FE
    });
  }

  // ── Get current user full profile ─────────────────────────────────────────
  // Backend: GET /users/me (NOT /auth/me)
  getMe(): Observable<User> {
    return this.http
      .get<ApiUser>(`${this.usersBase}/me`)
      .pipe(map(u => this.mapApiUser(u)));
  }

  // ── Update profile ────────────────────────────────────────────────────────
  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.http
      .put<ApiUser>(`${this.usersBase}/me`, {
        username:      data.username,
        age:           data.age,
        free_fire_id:  data.freeFireId,
        free_fire_name: data.freeFireName,
      })
      .pipe(map(u => this.mapApiUser(u)));
  }

  // ── Upload avatar ─────────────────────────────────────────────────────────
  uploadAvatar(file: File): Observable<{ avatar_url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ avatar_url: string }>(`${this.usersBase}/me/avatar`, form);
  }
}
