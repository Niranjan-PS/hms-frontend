import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Appointment {
  _id: string;
  doctor: {
    name: string;
    department: string;
  };
  date: string;
  reason: string;
  status: string;
}

@Component({
  selector: 'app-patient-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-dashboard-home.component.html',
  styleUrl: './patient-dashboard-home.component.css'
})
export class PatientDashboardHomeComponent implements OnInit {
  patientName: string = '';
  appointments: Appointment[] = [];
  recentAppointments: Appointment[] = [];
  loading = true;
  error: string | null = null;

  displayedColumns: string[] = ['doctor', 'date', 'reason', 'status', 'actions'];

  private readonly API_BASE =`${environment.apiUrl}/api`;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('PatientDashboardHomeComponent - ngOnInit called');
    this.loadPatientData();
    this.loadAppointments();
  }

  private loadPatientData(): void {
    console.log('PatientDashboardHomeComponent - loadPatientData called');
    const user = this.authService.getCurrentUser();
    console.log('PatientDashboardHomeComponent - Current user:', user);
    this.patientName = user?.name || 'Patient';
    console.log('PatientDashboardHomeComponent - Patient name set to:', this.patientName);
  }

  private loadAppointments(): void {
    console.log('PatientDashboardHomeComponent - loadAppointments called');
    const token = this.authService.getToken();
    console.log('PatientDashboardHomeComponent - Token:', token ? 'Present' : 'Missing');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('PatientDashboardHomeComponent - Making API call to:', `${this.API_BASE}/appointments`);

    this.http.get<{success: boolean, count: number, appointments: Appointment[]}>(`${this.API_BASE}/appointments`, { headers })
      .subscribe({
        next: (response) => {
          console.log('PatientDashboardHomeComponent - Appointments response:', response);
          if (response.success && response.appointments) {
            this.appointments = response.appointments || [];
            this.recentAppointments = this.appointments.slice(0, 5); // Show only recent 5
            console.log('PatientDashboardHomeComponent - Processed appointments:', this.appointments.length);
          } else {
            console.error('PatientDashboardHomeComponent - Invalid response format:', response);
            this.appointments = [];
            this.recentAppointments = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('PatientDashboardHomeComponent - Error loading appointments:', error);
          console.error('PatientDashboardHomeComponent - Error status:', error.status);
          console.error('PatientDashboardHomeComponent - Error message:', error.message);
          this.error = 'Failed to load appointments';
          this.loading = false;
          this.showSnackbar('Failed to load appointments', 'error');
        }
      });
  }

  getDoctorName(appointment: Appointment): string {
    return appointment.doctor?.name || 'Unknown Doctor';
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info'): void {
    const panelClass = {
      'success': ['success-snackbar'],
      'error': ['error-snackbar'],
      'info': ['info-snackbar']
    }[type];

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass
    });
  }
}
