import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray,  ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-create',
  templateUrl: './doctor-create.component.html',
  imports: [CommonModule,ReactiveFormsModule],
  styleUrls: ['./doctor-create.component.css'],
})
export class DoctorCreateComponent implements OnInit {
  doctorForm: FormGroup;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private router: Router
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
    if (this.doctorForm.valid) {
      console.log('Submitting doctor form:', this.doctorForm.value);
      this.doctorService.createDoctor(this.doctorForm.value).subscribe({
        next: (doctor) => {
          console.log('Doctor created:', doctor);
          this.success = 'Doctor created successfully!';
          this.doctorForm.reset();
          setTimeout(() => this.router.navigate(['/doctors']), 2000);
        },
        error: (err) => {
          console.error('Create error:', err);
          this.error = err.error.message || 'Failed to create doctor';
        },
      });
    } else {
      this.error = 'Please fill all required fields correctly';
    }
  }
}