import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Doctor, DoctorService } from '../services/doctor.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../appointment.service';
import { Appointment } from '../appointment';


// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatExpansionModule,
    MatBadgeModule
  ],
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css'],
})
export class DoctorComponent implements OnInit {
  doctor: Doctor | null = null;
  availabilityForm: FormGroup;
  appointments: Appointment[] = [];
  patients: any[] = []; // Will store patients assigned to this doctor
  error: string | null = null;
  success: string | null = null;
  loading: boolean = false;

  // For the appointments table
  displayedColumns: string[] = ['patient', 'date', 'reason', 'status', 'actions'];

  // For the patients table
  patientColumns: string[] = ['name', 'gender', 'phone', 'actions'];

  // Track which tab is active
  activeTabIndex: number = 0;

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.availabilityForm = this.fb.group({
      availability: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'doctor') {
      this.loadDoctorProfile();
      this.loadAppointments();

      // Listen for navigation events to refresh data when returning from other pages
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd && event.url === '/doctor') {
          console.log('Doctor Component - Returned to doctor dashboard, refreshing data');
          this.refreshAppointments();
        }
      });
    } else {
      this.error = 'Unauthorized access';
      this.showSnackbar('Unauthorized access. Redirecting to login...', 'error');
      this.router.navigate(['/login']);
    }
  }

  editProfile(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'doctor') {
      this.router.navigate(['/doctor/profile', user._id]);
    }
  }
  loadDoctorProfile(): void {
    this.doctorService.getCurrentDoctor().subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.populateAvailabilityForm();
        const doctorName = typeof doctor.user === 'object' ? doctor.user.name : doctor.name;
        this.showSnackbar(`Welcome, Dr. ${doctorName}!`, 'success');
        console.log('Doctor profile loaded:', doctor);
      },
      error: (err) => {
        console.error('Failed to load doctor profile:', err);
        this.error = 'Failed to load doctor profile';
        this.showSnackbar('Failed to load doctor profile', 'error');
        this.loading = false;
      },
    });
  }

  get availability(): FormArray {
    return this.availabilityForm.get('availability') as FormArray;
  }

  loadAppointments(): void {
    console.log('Doctor Component - Loading appointments');
    this.appointmentService.getDoctorAppointments().subscribe({
      next: (response) => {
        console.log('Doctor appointments response:', response);

        if (response && response.appointments) {
          this.appointments = response.appointments;
          this.extractPatientsFromAppointments();
          this.error = null;
        } else {
          console.error('Invalid response format:', response);
          this.appointments = [];
          this.patients = [];
          this.error = 'Invalid response format from server';
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Fetch appointments error:', err);
        this.error = err.message || 'Failed to load appointments';
        this.showSnackbar(this.error || 'Failed to load appointments', 'error');
        this.appointments = [];
        this.patients = [];
        this.loading = false;
      },
    });
  }

  // Extract unique patients from appointments
  private extractPatientsFromAppointments(): void {
    const uniquePatients = new Map();

    this.appointments.forEach(appointment => {
      if (appointment.patient && appointment.patient._id && !uniquePatients.has(appointment.patient._id)) {
        uniquePatients.set(appointment.patient._id, {
          _id: appointment.patient._id,
          name: appointment.patient.user?.name || 'Unknown',
          gender: appointment.patient.gender || 'Not specified',
          phone: appointment.patient.phone || 'Not available',
          email: appointment.patient.user?.email || 'Not available',
          dateOfBirth: appointment.patient.dateOfBirth || 'Not available',
          address: appointment.patient.address || 'Not available',
          medicalHistory: appointment.patient.medicalHistory || []
        });
      }
    });

    this.patients = Array.from(uniquePatients.values());
    console.log('Extracted patients:', this.patients);
  }

  // Method to refresh appointments (can be called after updates)
  refreshAppointments(): void {
    console.log('Doctor Component - Refreshing appointments');
    this.loading = true;
    this.loadAppointments();
  }

  // Helper method to show snackbar messages
  showSnackbar(message: string, type: 'success' | 'error' | 'info'): void {
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

  populateAvailabilityForm(): void {
    this.availability.clear();
    this.doctor?.availability?.forEach((avail) => {
      this.availability.push(
        this.fb.group({
          day: [avail.day, Validators.required],
          startTime: [avail.startTime, Validators.required],
          endTime: [avail.endTime, Validators.required],
        })
      );
    });
    if (this.availability.length === 0) {
      this.addAvailability();
    }
  }

  addAvailability(): void {
    this.availability.push(
      this.fb.group({
        day: ['', Validators.required],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
      })
    );
  }

  removeAvailability(index: number): void {
    if (this.availability.length > 1) {
      this.availability.removeAt(index);
    } else {
      this.showSnackbar('You must have at least one availability slot', 'info');
    }
  }

  onSubmitAvailability(): void {
    if (this.availabilityForm.valid && this.doctor?._id) {
      this.loading = true;
      console.log('Updating availability:', this.availabilityForm.value);

      this.doctorService
        .updateDoctor(this.doctor._id, { availability: this.availabilityForm.value.availability })
        .subscribe({
          next: (updatedDoctor) => {
            this.doctor = updatedDoctor;
            this.success = 'Availability updated successfully!';
            this.showSnackbar('Availability updated successfully!', 'success');
            this.loading = false;
          },
          error: (err) => {
            console.error('Update error:', err);
            this.error = err.error?.message || 'Failed to update availability';
            this.showSnackbar(this.error || 'Failed to update availability', 'error');
            this.loading = false;
          },
        });
    } else {
      this.error = 'Please fill all required fields';
      this.showSnackbar('Please fill all required fields', 'error');

      // Mark all form controls as touched to trigger validation messages
      this.markFormGroupTouched(this.availabilityForm);
    }
  }

  // Helper method to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          } else {
            ctrl.markAsTouched();
          }
        });
      }
    });
  }

  // Method to view patient details
  viewPatient(patientId: string): void {
    // Navigate to patient details page
    this.router.navigate(['/patient', patientId]);
  }

  // Method to handle tab changes
  tabChanged(event: any): void {
    this.activeTabIndex = event.index;
  }

  // Get status class for styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }
}
