import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-profile',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
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
    private router: Router
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
      console.log('Updating doctor:', this.doctorForm.value);
      this.doctorService.updateDoctor(this.doctorId, this.doctorForm.value).subscribe({
        next: (doctor) => {
          console.log('Doctor updated:', doctor);
          this.success = 'Doctor updated successfully!';
          setTimeout(() => this.router.navigate(['/doctors']), 2000);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.error = err.error.message || 'Failed to update doctor';
        },
      });
    } else {
      this.error = 'Please fill all required fields correctly';
    }
  }
}
