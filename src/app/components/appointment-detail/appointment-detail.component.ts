import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../appointment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../appointment';

@Component({
  selector: 'app-appointment-detail',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.css'
})
export class AppointmentDetailComponent  implements OnInit {
  appointmentForm: FormGroup;
  appointment: Appointment | null = null;
  isAdmin: boolean = false;
  isDoctor: boolean = false;
  isPatient: boolean = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
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

    const id = this.route.snapshot.params['id'];
    this.appointmentService.getAppointment(id).subscribe({
      next: (appointment: Appointment) => {
        this.appointment = appointment;
        this.appointmentForm.patchValue({
          date: new Date(appointment.date).toISOString().slice(0, 16),
          reason: appointment.reason,
          status: appointment.status,
        });
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load appointment';
      },
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid && this.appointment?._id) {
      const updates = this.appointmentForm.value;
      if (this.isPatient && updates.status && updates.status !== 'cancelled') {
        this.error = 'Patients can only cancel appointments';
        return;
      }
      console.log('Updating appointment:', updates);
      this.appointmentService.updateAppointment(this.appointment._id, updates).subscribe({
        next: (updatedAppointment) => {
          this.appointment = updatedAppointment;
          this.success = 'Appointment updated successfully!';
          setTimeout(() => this.router.navigate(['/appointments']), 2000);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.error = err.error.message || 'Failed to update appointment';
        },
      });
    } else {
      this.error = 'Please fill all required fields';
    }
  }

  cancelAppointment(): void {
    if (this.appointment?._id && confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(this.appointment._id).subscribe({
        next: () => {
          this.success = 'Appointment cancelled!';
          setTimeout(() => this.router.navigate(['/appointments']), 2000);
        },
        error: (err) => {
          console.error('Cancel error:', err);
          this.error = err.error.message || 'Failed to cancel appointment';
        },
      });
    }
  }
}


