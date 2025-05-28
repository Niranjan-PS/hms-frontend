import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { jwtDecode } from 'jwt-decode';
import { AuthResponse, User } from './auth';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`; 
  private userSubject = new BehaviorSubject<AuthResponse | null>(null);

  constructor(private http: HttpClient) {
    
    const token = this.getToken();
    if (token) {
      const user = this.decodeToken(token);
      if (user) this.userSubject.next(user);
    }
  }

  
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

  
  logout(): Observable<any> {
    
    const localLogout = new Observable(observer => {
      
      localStorage.removeItem('token');
      
      this.userSubject.next(null);
    
      observer.next({ success: true });
      observer.complete();
    });

    
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.userSubject.next(null);
      }),
     
      catchError(error => {
        
        return localLogout;
      })
    );
  }

 
  getToken(): string | null {
    return localStorage.getItem('token');
  }

 
  getCurrentUser(): AuthResponse | null {
    return this.userSubject.value;
  }

 
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

 
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

 
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
      
      localStorage.removeItem('token'); 
      return null;
    }
  }

 
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

  logoutLocally(): void {
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  
  user$ = this.userSubject.asObservable();
}