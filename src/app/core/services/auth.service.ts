import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  OtpRequest, 
  AuthResponse 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // Mock data for development
  private mockUser: User = {
    id: '1',
    username: 'TestPlayer',
    email: 'test@example.com',
    freeFireId: '123456789',
    avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100',
    isAdmin: false,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Mock implementation
    return of({
      user: this.mockUser,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    }).pipe(delay(1000));
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return of({
      user: { ...this.mockUser, username: userData.username, email: userData.email },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    }).pipe(delay(1000));
  }

  sendOtp(email: string): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(500));
  }

  verifyOtp(otpData: OtpRequest): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(500));
  }

  refreshToken(refreshToken: string): Observable<{ token: string }> {
    return of({ token: 'new-mock-jwt-token' }).pipe(delay(500));
  }

  forgotPassword(email: string): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(500));
  }

  resetPassword(token: string, newPassword: string): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(500));
  }
}