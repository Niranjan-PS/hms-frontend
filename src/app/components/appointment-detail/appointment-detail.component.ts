import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../appointment.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../appointment';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.css'
})
export class AppointmentDetailComponent implements OnInit {
  appointmentForm: FormGroup;
  appointment: Appointment | null = null;
  isAdmin: boolean = false;
  isDoctor: boolean = false;
  isPatient: boolean = false;
  error: string | null = null;
  success: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.appointmentForm = this.fb.group({
      date: ['', Validators.required],
      reason: ['', Validators.required],
      status: [''],
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'admin';
    this.isDoctor = user?.role === 'doctor';
    this.isPatient = user?.role === 'patient';

    this.loading = true;
    this.error = null;

    const id = this.route.snapshot.params['id'];
    this.appointmentService.getAppointment(id).subscribe({
      next: (appointment: Appointment) => {
        this.appointment = appointment;
        this.appointmentForm.patchValue({
          date: new Date(appointment.date).toISOString().slice(0, 16),
          reason: appointment.reason,
          status: appointment.status,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load appointment';
        this.loading = false;

        this.snackBar.open('Failed to load appointment details', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  onSubmit(): void {
    console.log('AppointmentDetail - Submit triggered');
    console.log('AppointmentDetail - Form valid:', this.appointmentForm.valid);
    console.log('AppointmentDetail - Appointment ID:', this.appointment?._id);
    console.log('AppointmentDetail - Form value:', this.appointmentForm.value);

    if (!this.appointmentForm.valid) {
      this.error = 'Please fill all required fields correctly';
      this.showErrorSnackbar('Please fill all required fields correctly');
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }

    if (!this.appointment?._id) {
      this.error = 'Appointment ID is missing';
      this.showErrorSnackbar('Appointment ID is missing');
      return;
    }

    const updates = this.appointmentForm.value;

    // Validate patient restrictions
    if (this.isPatient && updates.status && updates.status !== 'cancelled') {
      this.error = 'Patients can only cancel appointments';
      this.showErrorSnackbar('Patients can only cancel appointments');
      return;
    }

    // Validate required fields
    if (!updates.date || !updates.reason) {
      this.error = 'Date and reason are required';
      this.showErrorSnackbar('Date and reason are required');
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    console.log('AppointmentDetail - Sending update request:', {
      appointmentId: this.appointment._id,
      updates: updates
    });

    this.appointmentService.updateAppointment(this.appointment._id, updates).subscribe({
      next: (updatedAppointment: Appointment) => {
        console.log('AppointmentDetail - Update successful:', updatedAppointment);
        this.appointment = updatedAppointment;
        this.success = 'Appointment updated successfully!';
        this.loading = false;

        this.showSuccessSnackbar('Appointment updated successfully!');
        setTimeout(() => this.router.navigate(['/appointments']), 2000);
      },
      error: (err: any) => {
        console.error('AppointmentDetail - Update error:', err);
        this.error = err.message || 'Failed to update appointment';
        this.loading = false;

        this.showErrorSnackbar(this.error || 'Failed to update appointment');
      },
    });
  }

  private markFormGroupTouched(formGroup: any): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccessSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  cancelAppointment(): void {
    if (!this.appointment?._id) {
      this.showErrorSnackbar('Appointment ID is missing');
      return;
    }

    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.loading = true;
      this.error = null;
      this.success = null;

      console.log('AppointmentDetail - Cancelling appointment:', this.appointment._id);

      this.appointmentService.cancelAppointment(this.appointment._id).subscribe({
        next: () => {
          console.log('AppointmentDetail - Cancel successful');
          this.success = 'Appointment cancelled!';
          this.loading = false;

          this.showSuccessSnackbar('Appointment cancelled successfully!');
          setTimeout(() => this.router.navigate(['/appointments']), 2000);
        },
        error: (err: any) => {
          console.error('AppointmentDetail - Cancel error:', err);
          this.error = err.message || 'Failed to cancel appointment';
          this.loading = false;

          this.showErrorSnackbar(this.error || 'Failed to cancel appointment');
        },
      });
    }
  }
}


