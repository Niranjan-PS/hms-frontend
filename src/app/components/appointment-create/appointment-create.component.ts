import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Doctor, DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../appointment.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.css'
})
export class AppointmentCreateComponent implements OnInit {
  appointmentForm: FormGroup;
  doctors: Doctor[] = [];
  error: string | null = null;
  success: string | null = null;
  selectedDoctor: Doctor | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.appointmentForm = this.fb.group({
      doctor: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: [{ value: '', disabled: true }, Validators.required],
      reason: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
      },
      error: (err) => {

        this.error = 'Failed to load doctors';
        this.loading = false;

        this.snackBar.open('Failed to load doctors. Please try again.', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      },
    });


    this.appointmentForm.get('doctor')?.valueChanges.subscribe(doctorId => {
      this.onDoctorSelected(doctorId);
    });
  }

  onDoctorSelected(doctorId: string): void {
    this.selectedDoctor = this.doctors.find(doctor => doctor._id === doctorId) || null;

    const timeControl = this.appointmentForm.get('appointmentTime');

    console.log('Doctor selected:', { doctorId, selectedDoctor: this.selectedDoctor, timeControl: timeControl?.disabled });

    if (this.selectedDoctor && timeControl) {
      
      timeControl.enable();
      timeControl.setValue('');
      console.log('Time field enabled');
    } else if (timeControl) {
    
      timeControl.disable();
      timeControl.setValue('');
      console.log('Time field disabled');
    }
  }

 
  getDoctorAvailableHours(): string {
    if (!this.selectedDoctor?.availability || this.selectedDoctor.availability.length === 0) {
      return 'No availability set';
    }

    const availabilityText = this.selectedDoctor.availability
      .map(slot => `${slot.day}: ${this.formatTime(slot.startTime)} – ${this.formatTime(slot.endTime)}`)
      .join(', ');

    return `Available: ${availabilityText}`;
  }

  
  formatTime(time: string): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
  }

  
  isValidDate(): boolean {
    const selectedDate = this.appointmentForm.get('appointmentDate')?.value;
    if (!selectedDate) return true; 

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);

    return selected >= today;
  }

  
  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  
  getFieldError(fieldName: string): string | null {
    const field = this.appointmentForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.errors['required']) {
      switch (fieldName) {
        case 'doctor':
          return 'Please select a doctor';
        case 'appointmentDate':
          return 'Please select an appointment date';
        case 'appointmentTime':
          return 'Please select an appointment time';
        case 'reason':
          return 'Please provide a reason for the appointment';
        default:
          return 'This field is required';
      }
    }

    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }

    return null;
  }

  
  hasFieldError(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  
  hasDateError(): boolean {
    const dateField = this.appointmentForm.get('appointmentDate');
    return !!(dateField && dateField.touched && dateField.value && !this.isValidDate());
  }

  
  isFormValidForSubmission(): boolean {
    const doctorControl = this.appointmentForm.get('doctor');
    const dateControl = this.appointmentForm.get('appointmentDate');
    const timeControl = this.appointmentForm.get('appointmentTime');
    const reasonControl = this.appointmentForm.get('reason');

    const doctorValid = !!(doctorControl?.value);
    const dateValid = !!(dateControl?.value) && this.isValidDate();
    const reasonValid = !!(reasonControl?.value);

   
    const timeValid = timeControl?.disabled ? true : !!(timeControl?.value);

    
    if (!doctorValid) {
      return false;
    }

    return doctorValid && dateValid && timeValid && reasonValid;
  }

  onSubmit(): void {
    
    this.markFormGroupTouched(this.appointmentForm);

   
    const formValue = this.appointmentForm.getRawValue();

    const doctorValid = !!(formValue.doctor);
    const dateValid = !!(formValue.appointmentDate) && this.isValidDate();
    const timeValid = !!(formValue.appointmentTime);
    const reasonValid = !!(formValue.reason);

    console.log('Form validation:', { doctorValid, dateValid, timeValid, reasonValid, formValue });

    if (doctorValid && dateValid && timeValid && reasonValid) {
      const appointmentDateTime = `${formValue.appointmentDate}T${formValue.appointmentTime}:00`;

      const appointmentData = {
        doctor: formValue.doctor,
        date: appointmentDateTime,
        reason: formValue.reason
      };

      console.log('Submitting appointment data:', appointmentData);

      this.loading = true;
      this.error = null;
      this.success = null;

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = 'Appointment booked successfully!';

          this.snackBar.open('Appointment booked successfully!', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });

          this.appointmentForm.reset();
          setTimeout(() => this.router.navigate(['/appointments']), 2000);
        },
        error: (err) => {
          this.loading = false;

          
          let errorMessage = 'Failed to book appointment';
          if (err.error?.error) {
            if (err.error.error.includes('another appointment at this time') ||
                err.error.error.includes('already has an appointment')) {
              errorMessage = 'Doctor already has an appointment at that time. Please choose a different time slot.';
            } else if (err.error.error.includes('not available')) {
              errorMessage = 'Doctor is not available at the selected time. Please check the available hours and choose a different time.';
            } else {
              errorMessage = err.error.error;
            }
          }

          this.error = errorMessage;

          this.snackBar.open(errorMessage, 'Close', {
            duration: 7000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        },
      });
    } else {
      
      const missingFields: string[] = [];

      if (!doctorValid) {
        missingFields.push('Select a doctor');
      }
      if (!dateValid) {
        if (!formValue.appointmentDate) {
          missingFields.push('Choose appointment date');
        } else if (!this.isValidDate()) {
          missingFields.push('Select a future date');
        }
      }
      if (!timeValid) {
        missingFields.push('Choose appointment time');
      }
      if (!reasonValid) {
        missingFields.push('Provide reason for appointment');
      }

      const errorMessage = missingFields.length > 0
        ? `Please complete: ${missingFields.join(', ')}`
        : 'Please fill all required fields correctly';

      console.log('Validation failed:', { missingFields, errorMessage });

      this.error = errorMessage;
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }


  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}


