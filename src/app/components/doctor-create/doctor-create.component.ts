import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-doctor-create',
  templateUrl: './doctor-create.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  styleUrls: ['./doctor-create.component.css'],
})
export class DoctorCreateComponent implements OnInit {
  doctorForm: FormGroup;
  error: string | null = null;
  success: string | null = null;
  loading = false;

  // Available days and departments
  availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Psychiatry',
    'Emergency Medicine',
    'Internal Medicine',
    'Surgery',
    'Radiology',
    'Anesthesiology',
    'Pathology'
  ];

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.doctorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      department: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      availability: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.addAvailability();
  }

  get availability(): FormArray {
    return this.doctorForm.get('availability') as FormArray;
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
    }
  }

  onSubmit(): void {
    if (this.doctorForm.valid && !this.loading) {
      this.loading = true;
      this.error = null;
      this.success = null;

      console.log('Submitting doctor form:', this.doctorForm.value);
      this.doctorService.createDoctor(this.doctorForm.value).subscribe({
        next: (doctor) => {
          console.log('Doctor created:', doctor);
          this.loading = false;
          this.showSuccessMessage('Doctor created successfully!');
          setTimeout(() => this.router.navigate(['/doctors']), 2000);
        },
        error: (err) => {
          console.error('Create error:', err);
          this.loading = false;
          this.error = err.error.message || 'Failed to create doctor';
          this.showErrorMessage(this.error ?? 'Unknown error');
        },
      });
    } else if (!this.doctorForm.valid) {
      this.markFormGroupTouched();
      this.error = 'Please fill all required fields correctly';
      this.showErrorMessage(this.error ?? 'Form validation failed');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.doctorForm.controls).forEach(key => {
      const control = this.doctorForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(arrayKey => {
              arrayControl.get(arrayKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  // Helper method to get availability display text
  getAvailabilityDisplayText(index: number): string {
    const availability = this.availability.at(index);
    const day = availability.get('day')?.value;
    const startTime = availability.get('startTime')?.value;
    const endTime = availability.get('endTime')?.value;

    if (day && startTime && endTime) {
      return `${day}: ${startTime} - ${endTime}`;
    }
    return '';
  }

  // Check if availability entry is complete
  isAvailabilityComplete(index: number): boolean {
    const availability = this.availability.at(index);
    return availability.get('day')?.value &&
           availability.get('startTime')?.value &&
           availability.get('endTime')?.value;
  }

  // Navigate back to doctors list
  navigateBack(): void {
    this.router.navigate(['/doctors']);
  }
}