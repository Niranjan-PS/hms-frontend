import { Component, OnInit } from '@angular/core';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-patient-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './patient-doctor-list.component.html',
  styleUrl: './patient-doctor-list.component.css'
})
export class PatientDoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  error: string | null = null;
  loading: boolean = false;
  patientName: string = '';

  // Define columns to display in the patient-friendly table
  displayedColumns: string[] = ['name', 'department', 'availability'];

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.patientName = user?.name || 'Patient';
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
        if (doctors.length === 0) {
          this.showSnackbar('No doctors found', 'info');
        }
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load doctors';
        this.loading = false;
        this.showSnackbar('Failed to load doctors', 'error');
      },
    });
  }

  // Format availability times for display
  formatAvailability(availability: { day: string; startTime: string; endTime: string }[] | undefined): string {
    if (!availability || availability.length === 0) {
      return 'No availability set';
    }

    return availability
      .map(slot => `${slot.day}: ${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)}`)
      .join(', ');
  }

  // Format time from 24-hour to 12-hour format (public for template access)
  formatTime(time: string): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Get unique department count for statistics
  getDepartmentCount(): number {
    if (!this.doctors || this.doctors.length === 0) {
      return 0;
    }

    const uniqueDepartments = new Set(
      this.doctors
        .filter(doctor => doctor.department)
        .map(doctor => doctor.department)
    );

    return uniqueDepartments.size;
  }

  // Get count of doctors with availability set
  getAvailableDoctorsCount(): number {
    if (!this.doctors || this.doctors.length === 0) {
      return 0;
    }

    return this.doctors.filter(doctor =>
      doctor.availability &&
      doctor.availability.length > 0
    ).length;
  }

  // Safe method to get total doctors count
  getTotalDoctorsCount(): number {
    return this.doctors ? this.doctors.length : 0;
  }

  // Check if a doctor has availability (safe method for template)
  hasAvailability(doctor: Doctor): boolean {
    return !!(doctor && doctor.availability && doctor.availability.length > 0);
  }

  // Navigate to appointment booking with selected doctor
  bookAppointment(doctor: Doctor): void {
    this.router.navigate(['/appointments/create'], {
      queryParams: { doctorId: doctor._id, doctorName: doctor.name }
    });
  }

  // Navigate back to patient dashboard
  goBackToDashboard(): void {
    this.router.navigate(['/patient/dashboard']);
  }

  // Helper method to show snackbar messages
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
