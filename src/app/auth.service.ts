import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { jwtDecode } from 'jwt-decode';
import { AuthResponse, User } from './auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // Adjust to your backend URL
  private userSubject = new BehaviorSubject<AuthResponse | null>(null);

  constructor(private http: HttpClient) {
    // Initialize user state from token on app load
    const token = this.getToken();
    if (token) {
      const user = this.decodeToken(token);
      if (user) this.userSubject.next(user);
    }
  }

  // Register user
  register(userData: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.userSubject.next(response);
        }
      })
    );
  }

  // Login user
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.userSubject.next(response);
        }
      })
    );
  }

  // Logout user
  logout(): Observable<any> {
    // Create an observable that will complete immediately after clearing local data
    const localLogout = new Observable(observer => {
      // Clear token from localStorage
      localStorage.removeItem('token');
      // Update user subject
      this.userSubject.next(null);
      // Complete the observable
      observer.next({ success: true });
      observer.complete();
    });

    // Try to call the backend logout endpoint, but fall back to local logout if it fails
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.userSubject.next(null);
      }),
      // If the HTTP request fails, still perform local logout
      catchError(error => {
        console.warn('Backend logout failed, performing local logout:', error);
        return localLogout;
      })
    );
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get current user
  getCurrentUser(): AuthResponse | null {
    return this.userSubject.value;
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Decode token to get user data
  private decodeToken(token: string): AuthResponse | null {
    try {
      const decoded: any = jwtDecode(token);
      return {
        _id: decoded.id,
        name: decoded.name || '',
        email: decoded.email || '',
        role: decoded.role,
        token,
      };
    } catch (error) {
      console.error('Token decode error:', error);
      localStorage.removeItem('token'); // Remove invalid token
      return null;
    }
  }

  // Get the dashboard route based on user role
  getRoleDashboardRoute(): string {
    const role = this.getUserRole();
    switch (role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/patient';
      default:
        return '/login';
    }
  }

  // Perform a local logout without calling the backend
  // This is useful as a fallback or for situations where the backend call is not necessary
  logoutLocally(): void {
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  // Observable for user state
  user$ = this.userSubject.asObservable();
}