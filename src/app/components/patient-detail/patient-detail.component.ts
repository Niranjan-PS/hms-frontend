import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { PatientService } from '../../patient.service';
import { AppointmentService } from '../../appointment.service';
import { AuthService } from '../../auth.service';
import { Patient } from '../../patient';
import { Appointment } from '../../appointment';

// Interface for appointment response
interface AppointmentResponse {
  success: boolean;
  count?: number;
  appointments: Appointment[];
  error?: string;
}

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule
  ],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  appointments: Appointment[] = [];
  loading: boolean = false;
  error: string | null = null;
  patientId: string | null = null;
  isDoctor: boolean = false;

  // Table columns for appointments
  readonly displayedColumns: string[] = ['date', 'reason', 'status'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.showSnackbar('Please log in to view patient details', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.isDoctor = user.role === 'doctor';
    this.patientId = this.route.snapshot.params['id'];

    if (this.patientId) {
      this.loadPatientDetails();

      // Only load appointments for doctors
      if (this.isDoctor) {
        this.loadPatientAppointments();
      }
    } else {
      this.error = 'Patient ID not provided';
      this.loading = false;
    }
  }

  loadPatientDetails(): void {
    if (!this.patientId) {
      this.error = 'Patient ID not provided';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.patientService.getPatient(this.patientId).subscribe({
      next: (patient: Patient) => {
        if (patient && patient.user) {
          this.patient = patient;
          this.error = null;
        } else {
          this.error = 'Invalid patient data received';
          this.showSnackbar('Invalid patient data received', 'error');
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading patient details:', err);
        this.error = err.error?.message || 'Failed to load patient details';
        this.showSnackbar(this.error || 'Failed to load patient details', 'error');
        this.loading = false;
      }
    });
  }

  loadPatientAppointments(): void {
    if (!this.patientId) return;

    // For doctors, we'll get all appointments and filter by patient
    this.appointmentService.getAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        console.log('Patient appointments response:', appointments);

        // Filter appointments for this specific patient
        this.appointments = appointments.filter(
          (appointment: Appointment) => appointment.patient._id === this.patientId
        );
        console.log('Filtered patient appointments:', this.appointments);
      },
      error: (err: any) => {
        console.error('Error loading patient appointments:', err);
        this.showSnackbar('Failed to load appointment history', 'error');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  goBack(): void {
    if (this.isDoctor) {
      this.router.navigate(['/doctor']);
    } else {
      this.router.navigate(['/admin/patients']);
    }
  }

  // Method to retry loading patient details
  retryLoadPatientDetails(): void {
    this.error = null;
    this.loadPatientDetails();

    if (this.isDoctor) {
      this.loadPatientAppointments();
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
