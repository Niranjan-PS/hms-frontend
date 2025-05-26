import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
}

@Component({
  selector: 'app-admin-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-dashboard-home.component.html',
  styleUrl: './admin-dashboard-home.component.css'
})
export class AdminDashboardHomeComponent implements OnInit {
  stats: DashboardStats = {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  };

  loading = true;
  currentUser: any;
  error: string | null = null;

  // API endpoints
  private readonly API_BASE = 'http://localhost:3000/api';
  private readonly PATIENTS_API = `${this.API_BASE}/patients`;
  private readonly DOCTORS_API = `${this.API_BASE}/doctors`;
  private readonly APPOINTMENTS_API = `${this.API_BASE}/appointments`;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.loading = true;
    this.error = null;

    // Get authentication token
    const token = this.authService.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Make parallel API calls to get all statistics
    forkJoin({
      patients: this.http.get<any[]>(this.PATIENTS_API, { headers }).pipe(
        catchError(error => {
          console.error('Error fetching patients:', error);
          return of([]);
        })
      ),
      doctors: this.http.get<any[]>(this.DOCTORS_API, { headers }).pipe(
        catchError(error => {
          console.error('Error fetching doctors:', error);
          return of([]);
        })
      ),
      appointments: this.http.get<any[]>(this.APPOINTMENTS_API, { headers }).pipe(
        catchError(error => {
          console.error('Error fetching appointments:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (data) => {
        // Calculate statistics from the fetched data
        this.stats = {
          totalPatients: data.patients.length,
          totalDoctors: data.doctors.length,
          totalAppointments: data.appointments.length,
          pendingAppointments: this.calculatePendingAppointments(data.appointments)
        };
        this.loading = false;
        console.log('Dashboard stats loaded:', this.stats);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.error = 'Failed to load dashboard statistics. Please try again.';
        this.loading = false;
        this.showErrorMessage('Failed to load dashboard data');
      }
    });
  }

  private calculatePendingAppointments(appointments: any[]): number {
    if (!appointments || appointments.length === 0) {
      return 0;
    }

    // Count appointments with status 'pending' or 'scheduled'
    return appointments.filter(appointment =>
      appointment.status === 'pending' ||
      appointment.status === 'scheduled' ||
      appointment.status === 'confirmed'
    ).length;
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  navigateToPatients(): void {
    this.router.navigate(['/admin/patients']);
  }

  navigateToDoctors(): void {
    this.router.navigate(['/doctors']);
  }

  navigateToAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  refreshStats(): void {
    this.loadDashboardStats();
  }
}
