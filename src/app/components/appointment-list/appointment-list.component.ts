import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppointmentService } from '../../appointment.service';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../appointment';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  isAdmin: boolean = false;
  isDoctor: boolean = false;
  isPatient: boolean = false;
  error: string | null = null;
  loading: boolean = false;
  today: Date = new Date();
  private navigationSubscription: Subscription = new Subscription();

  // Define columns to display in the table
  displayedColumns: string[] = ['patient', 'doctor', 'department', 'date', 'reason', 'status', 'actions'];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'admin';
    this.isDoctor = user?.role === 'doctor';
    this.isPatient = user?.role === 'patient';
    this.loadAppointments();

    // Listen for navigation events to refresh data when returning from other pages
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/appointments') {
          console.log('AppointmentList - Returned to appointments page, refreshing data');
          this.refreshAppointments();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  loadAppointments(): void {
    console.log('AppointmentList - Loading appointments');
    this.loading = true;
    this.error = null;

    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        console.log('AppointmentList - Fetched appointments:', appointments);
        this.appointments = appointments;
        this.loading = false;

        // Show message if no appointments found
        if (appointments.length === 0) {
          this.showSnackbar('No appointments found', 'info');
        }
      },
      error: (err) => {
        console.error('AppointmentList - Fetch error:', err);
        this.error = err.message || 'Failed to load appointments';
        this.loading = false;
        this.showSnackbar(this.error || 'Failed to load appointments', 'error');
      },
    });
  }

  // Method to refresh appointments (can be called after updates)
  refreshAppointments(): void {
    console.log('AppointmentList - Refreshing appointments');
    this.loadAppointments();
  }

  navigateToCreate(): void {
    this.router.navigate(['/appointments/create']);
  }

  cancelAppointment(id: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.loading = true;

      this.appointmentService.cancelAppointment(id).subscribe({
        next: () => {
          console.log('Appointment cancelled:', id);
          this.appointments = this.appointments.map((appt) =>
            appt._id === id ? { ...appt, status: 'cancelled' } : appt
          );
          this.loading = false;
          this.showSnackbar('Appointment cancelled successfully', 'success');
        },
        error: (err) => {
          console.error('Cancel error:', err);
          this.error = err.message || 'Failed to cancel appointment';
          this.loading = false;
          this.showSnackbar(this.error || 'Failed to cancel appointment', 'error');
        },
      });
    }
  }

  isPastAppointment(appointmentDate: string): boolean {
    const appointment = new Date(appointmentDate);
    return appointment < this.today;
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

 getPatientName(appointment: Appointment): string {
    return appointment.patient.user.name || 'Unknown';
  }

  getDoctorName(appointment: Appointment): string {
    if (appointment.doctor.user && appointment.doctor.user.name) {
      return appointment.doctor.user.name;
    } else if (appointment.doctor.name) {
      return appointment.doctor.name;
    } else {
      return 'N/A';
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