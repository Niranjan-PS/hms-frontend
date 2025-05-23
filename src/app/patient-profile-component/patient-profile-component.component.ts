import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicalHistory, Patient } from '../patient';
import { PatientService } from '../patient.service';
import { AppointmentService } from '../appointment.service';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Appointment } from '../appointment';

@Component({
  selector: 'app-patient-profile-component',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './patient-profile-component.component.html',
  styleUrls: ['./patient-profile-component.component.css']
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  error: string | null = null;
  patient: Patient | null = null;
  appointments: Appointment[] = []; // Add appointments property

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private appointmentService: AppointmentService, // Add AppointmentService
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      phone: [''],
      address: [''],
      medicalHistory: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'patient') {
      // Load patient profile
      this.patientService.getCurrentPatient().subscribe({
        next: (patient: Patient | null) => {
          this.patient = patient;
          if (patient) {
            this.profileForm.patchValue({
              dateOfBirth: patient.dateOfBirth.split('T')[0],
              gender: patient.gender,
              phone: patient.phone,
              address: patient.address,
            });
            patient.medicalHistory?.forEach((history: MedicalHistory | undefined) => this.addHistory(history));
          }
        },
        error: () => this.createNewProfile(),
      });
      // Load appointments
      this.loadAppointments();
    } else {
      this.error = 'Unauthorized access';
      this.router.navigate(['/login']);
    }
  }

  get medicalHistory(): FormArray {
    return this.profileForm.get('medicalHistory') as FormArray;
  }

  addHistory(history?: MedicalHistory): void {
    this.medicalHistory.push(
      this.fb.group({
        condition: [history?.condition || '', Validators.required],
        diagnosedAt: [history?.diagnosedAt ? history.diagnosedAt.split('T')[0] : '', Validators.required],
        notes: [history?.notes || ''],
      })
    );
  }

  removeHistory(index: number): void {
    this.medicalHistory.removeAt(index);
  }

  onSubmit(): void {
    if (this.patient) {
      // Update existing profile
      this.patientService.updatePatient(this.patient._id!, this.profileForm.value).subscribe({
        next: (patient) => {
          this.patient = patient;
          this.router.navigate(['/patient']);
        },
        error: (err) => (this.error = err.error.message || 'Failed to update profile'),
      });
    } else {
      // Create new profile
      this.patientService.createPatient(this.profileForm.value).subscribe({
        next: (patient) => {
          this.patient = patient;
          this.router.navigate(['/patient']);
        },
        error: (err) => (this.error = err.error.message || 'Failed to create profile'),
      });
    }
  }

  private createNewProfile(): void {
    this.patient = null;
    this.profileForm.reset();
    this.medicalHistory.clear();
    this.addHistory();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
      },
      error: (err) => {
        console.error('Fetch appointments error:', err);
        this.error = 'Failed to load appointments';
      },
    });
  }

  navigateToCreateAppointment(): void {
    this.router.navigate(['/appointments/create']);
  }
}