import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../appointment.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../appointment';

@Component({
  selector: 'app-appointment-list',
  imports: [CommonModule,RouterModule],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  isAdmin: boolean = false;
  isDoctor: boolean = false;
  isPatient: boolean = false;
  error: string | null = null;
  today: Date = new Date(); // Add for date comparison

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'admin';
    this.isDoctor = user?.role === 'doctor';
    this.isPatient = user?.role === 'patient';
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        console.log('Fetched appointments:', JSON.stringify(appointments, null, 2));
        this.appointments = appointments;
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load appointments';
      },
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/appointments/create']);
  }

  cancelAppointment(id: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(id).subscribe({
        next: () => {
          console.log('Appointment cancelled:', id);
          this.appointments = this.appointments.map((appt) =>
            appt._id === id ? { ...appt, status: 'cancelled' } : appt
          );
        },
        error: (err) => {
          console.error('Cancel error:', err);
          this.error = err.error.message || 'Failed to cancel appointment';
        },
      });
    }
  }

  isPastAppointment(appointmentDate: string): boolean {
    const appointment = new Date(appointmentDate);
    return appointment < this.today;
  }
}