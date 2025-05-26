import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
})
export class DoctorProfileComponent implements OnInit {
  doctorForm: FormGroup;
  doctorId: string;
  error: string | null = null;
  success: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.doctorId = this.route.snapshot.params['id'];
    this.doctorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      department: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      availability: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // Add loading state
    this.loading = true;

    this.doctorService.getDoctor(this.doctorId).subscribe({
      next: (doctor) => {
        this.doctorForm.patchValue({
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          department: doctor.department,
          licenseNumber: doctor.licenseNumber,
        });

        // Clear existing availability entries before adding new ones
        while (this.availability.length) {
          this.availability.removeAt(0);
        }

        // Add availability slots from doctor data
        if (doctor.availability && doctor.availability.length) {
          doctor.availability.forEach(avail => this.addAvailability(avail));
        } else {
          // Add a default empty availability slot if none exists
          this.addAvailability();
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load doctor profile';
        this.loading = false;
        setTimeout(() => this.error = null, 3000);
      },
    });
  }

  get availability(): FormArray {
    return this.doctorForm.get('availability') as FormArray;
  }

  // Method to add availability with proper validation
  addAvailability(availability?: any): void {
    this.availability.push(this.fb.group({
      day: [availability?.day || '', Validators.required],
      startTime: [availability?.startTime || '', Validators.required],
      endTime: [availability?.endTime || '', Validators.required]
    }));
  }

  // Method to remove availability slot
  removeAvailability(index: number): void {
    this.availability.removeAt(index);
  }

  onSubmit(): void {
    if (this.doctorForm.valid) {
      this.loading = true;
      console.log('Updating doctor:', this.doctorForm.value);

      this.doctorService.updateDoctor(this.doctorId, this.doctorForm.value).subscribe({
        next: (doctor) => {
          console.log('Doctor updated:', doctor);
          this.success = 'Doctor updated successfully!';
          this.loading = false;

          // Show success message with snackbar
          this.snackBar.open('Doctor profile updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });

          // Navigate after a short delay
          setTimeout(() => this.router.navigate(['/doctors']), 2000);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.error = err.error?.message || 'Failed to update doctor';
          this.loading = false;

          // Show error message with snackbar
         this.snackBar.open(this.error || 'Failed to update doctor', 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
        },
      });
    } else {
      // Mark all form controls as touched to trigger validation messages
      this.markFormGroupTouched(this.doctorForm);

      this.error = 'Please fill all required fields correctly';
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
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
}
