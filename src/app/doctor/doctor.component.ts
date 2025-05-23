import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Doctor, DoctorService } from '../services/doctor.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import {  AppointmentService } from '../appointment.service';
import { Appointment } from '../appointment';

@Component({
  selector: 'app-doctor',
  imports: [RouterModule,CommonModule,ReactiveFormsModule],
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css'],
})
export class DoctorComponent implements OnInit {
  doctor: Doctor | null = null;
  availabilityForm: FormGroup;
  appointments: Appointment[] = []
  error: string | null = null;
  success: string | null = null;


  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.availabilityForm = this.fb.group({
      availability: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'doctor') {
      this.loadDoctorProfile(user._id);
    } else {
      this.error = 'Unauthorized access';
      this.router.navigate(['/login']);
    }
  }
  
editProfile(): void {
  const user = this.authService.getCurrentUser();
  if (user?.role === 'doctor') {
    // Option 1: If you have the doctorId separately
    this.router.navigate(['/doctor/profile', user._id]);
  }
}
  loadDoctorProfile(userId: string): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctor = doctors.find((d) => d.user === userId) || null;
        if (this.doctor) {
          this.populateAvailabilityForm();
        } else {
          this.error = 'Doctor profile not found';
          setTimeout(() => this.error = null, 3000);
        }
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load profile';
        setTimeout(() => this.error = null, 3000);
      },
    });
  }

  get availability(): FormArray {
    return this.availabilityForm.get('availability') as FormArray;
  }

  
  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments; // Fixed variable name
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load appointments';
        setTimeout(() => this.error = null, 3000);
      },
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
    }
  }

  onSubmitAvailability(): void {
    if (this.availabilityForm.valid && this.doctor?._id) {
      console.log('Updating availability:', this.availabilityForm.value);
      this.doctorService
        .updateDoctor(this.doctor._id, { availability: this.availabilityForm.value.availability })
        .subscribe({
          next: (updatedDoctor) => {
            this.doctor = updatedDoctor;
            this.success = 'Availability updated successfully!';
            setTimeout(() => (this.success = null), 2000);
          },
          error: (err) => {
            console.error('Update error:', err);
            this.error = err.error.message || 'Failed to update availability';
          },
        });
    } else {
      this.error = 'Please fill all required fields';
    }
  }
}
