import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Doctor, DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../appointment.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-create',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.css'
})
export class AppointmentCreateComponent implements OnInit {
  appointmentForm: FormGroup;
  doctors: Doctor[] = [];
  error: string | null = null;
  success: string | null = null;
  selectedDoctor: Doctor | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private router: Router
  ) {
    this.appointmentForm = this.fb.group({
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      reason: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load doctors';
      },
    });
    // Listen for doctor selection changes
    this.appointmentForm.get('doctor')?.valueChanges.subscribe(doctorId => {
      this.selectedDoctor = this.doctors.find(doc => doc._id === doctorId) || null;
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      console.log('Submitting appointment:', this.appointmentForm.value);
      this.appointmentService.createAppointment(this.appointmentForm.value).subscribe({
        next: (appointment) => {
          console.log('Appointment created:', appointment);
          this.success = 'Appointment booked successfully!';
          this.appointmentForm.reset();
          setTimeout(() => this.router.navigate(['/appointments']), 2000);
        },
        error: (err) => {
          console.error('Create error:', err);
          this.error = err.error.message || 'Failed to book appointment';
        },
      });
    } else {
      this.error = 'Please fill all required fields';
    }
  }
}


