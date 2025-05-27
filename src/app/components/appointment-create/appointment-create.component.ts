import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Doctor, DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../appointment.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.css'
})
export class AppointmentCreateComponent implements OnInit {
  appointmentForm: FormGroup;
  doctors: Doctor[] = [];
  error: string | null = null;
  success: string | null = null;
  selectedDoctor: Doctor | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.appointmentForm = this.fb.group({
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      reason: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
      },
      error: (err) => {
       
        this.error = 'Failed to load doctors';
        this.loading = false;

        this.snackBar.open('Failed to load doctors. Please try again.', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      },
    });

    
    this.appointmentForm.get('doctor')?.valueChanges.subscribe(doctorId => {
      this.selectedDoctor = this.doctors.find(doc => doc._id === doctorId) || null;
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
     

      
      this.loading = true;
      this.error = null;
      this.success = null;

      this.appointmentService.createAppointment(this.appointmentForm.value).subscribe({
        next: (appointment) => {
        
          this.loading = false;
          this.success = 'Appointment booked successfully!';

          
          this.snackBar.open('Appointment booked successfully!', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });

          this.appointmentForm.reset();
          setTimeout(() => this.router.navigate(['/appointments']), 2000);
        },
        error: (err) => {
         
          this.loading = false;
          this.error = err.error?.message || 'Failed to book appointment';

          
          this.snackBar.open(this.error || 'Failed to book appointment', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        },
      });
    } else {
      
      this.markFormGroupTouched(this.appointmentForm);

      this.error = 'Please fill all required fields correctly';

      
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}


