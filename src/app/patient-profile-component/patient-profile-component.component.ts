import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicalHistory, Patient } from '../patient';
import { PatientService } from '../patient.service';
import { AppointmentService } from '../appointment.service';
import { AuthService } from '../auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Appointment } from '../appointment';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-patient-profile-component',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './patient-profile-component.component.html',
  styleUrls: ['./patient-profile-component.component.css']
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  error: string | null = null;
  patient: Patient | null = null;
  appointments: Appointment[] = [];
  loading: boolean = false;
  isAdminView: boolean = false;
  patientId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
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
    this.loading = true;
    const user = this.authService.getCurrentUser();

    
    this.patientId = this.route.snapshot.params['id'];
    this.isAdminView = !!this.patientId && user?.role === 'admin';

    if (this.isAdminView) {
      
      this.loadPatientById(this.patientId!);
    } else if (user && user.role === 'patient') {
      
      this.loadCurrentPatient();
    } else {
      this.error = 'Unauthorized access';
      this.router.navigate(['/login']);
      this.loading = false;
    }
  }

  private loadPatientById(id: string): void {
    this.patientService.getPatient(id).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        this.populateForm(patient);
        this.loading = false;
      },
      error: (err) => {
        
        this.error = 'Failed to load patient profile';
        this.showSnackbar('Failed to load patient profile', 'error');
        this.loading = false;
      }
    });
  }

  private loadCurrentPatient(): void {
    this.patientService.getCurrentPatient().subscribe({
      next: (patient: Patient | null) => {
        this.patient = patient;
        if (patient) {
          this.populateForm(patient);
        }
        this.loadAppointments();
        this.loading = false;
      },
      error: () => {
        this.createNewProfile();
        this.loading = false;
      }
    });
  }

  private populateForm(patient: Patient): void {
    this.profileForm.patchValue({
      dateOfBirth: patient.dateOfBirth.split('T')[0],
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
    });
    patient.medicalHistory?.forEach((history: MedicalHistory | undefined) => this.addHistory(history));
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
    if (this.profileForm.invalid) {
      this.showSnackbar('Please fill all required fields correctly', 'error');
      return;
    }

    this.loading = true;

    if (this.patient) {
     
      this.patientService.updatePatient(this.patient._id!, this.profileForm.value).subscribe({
        next: (patient) => {
          this.patient = patient;
          this.showSnackbar('Profile updated successfully', 'success');
          this.loading = false;

         
          if (this.isAdminView) {
            this.router.navigate(['/admin/patients']);
          } else {
            this.router.navigate(['/patient']);
          }
        },
        error: (err) => {
          
          this.error = err.error?.message || 'Failed to update profile';
          this.showSnackbar(this.error || 'Failed to update profile', 'error');
          this.loading = false;
        },
      });
    } else {
      
      this.patientService.createPatient(this.profileForm.value).subscribe({
        next: (patient) => {
          this.patient = patient;
          this.showSnackbar('Profile created successfully', 'success');
          this.loading = false;
          this.router.navigate(['/patient']);
        },
        error: (err) => {
          
          this.error = err.error?.message || 'Failed to create profile';
          this.showSnackbar(this.error || 'Failed to create profile', 'error');
          this.loading = false;
        },
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
       
        this.error = 'Failed to load appointments';
      },
    });
  }

  navigateToCreateAppointment(): void {
    this.router.navigate(['/appointments/create']);
  }

  goBack(): void {
    if (this.isAdminView) {
      this.router.navigate(['/admin/patients']);
    } else {
      this.router.navigate(['/patient']);
    }
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info'): void {
    const panelClass = {
      'success': ['success-snackbar'],
      'error': ['error-snackbar'],
      'info': ['info-snackbar']
    }[type];

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass
    });
  }
}