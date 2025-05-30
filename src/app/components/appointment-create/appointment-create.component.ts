import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Doctor, DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../appointment.service';
import { TimezoneService } from '../../services/timezone.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';


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
    private timezoneService: TimezoneService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.appointmentForm = this.fb.group({
      doctor: ['', Validators.required],
      appointmentDate: [{ value: '', disabled: true }, Validators.required],
      appointmentTime: [{ value: '', disabled: true }, Validators.required],
      appointmentPeriod: [{ value: 'AM', disabled: true }, Validators.required],
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

    const dateControl = this.appointmentForm.get('appointmentDate');
    const timeControl = this.appointmentForm.get('appointmentTime');
    const periodControl = this.appointmentForm.get('appointmentPeriod');

    console.log('Doctor selected:', { doctorId, selectedDoctor: this.selectedDoctor });

    if (this.selectedDoctor) {
      
      dateControl?.enable();
      timeControl?.enable();
      periodControl?.enable();

      dateControl?.setValue('');
      timeControl?.setValue('');
      periodControl?.setValue('AM');

      console.log('Date/Time fields enabled');
    } else {
      
      dateControl?.disable();
      timeControl?.disable();
      periodControl?.disable();

      dateControl?.setValue('');
      timeControl?.setValue('');
      periodControl?.setValue('AM');

      console.log('Date/Time fields disabled');
    }
  }


  getDoctorAvailableHours(): string {
    if (!this.selectedDoctor?.availability || this.selectedDoctor.availability.length === 0) {
      return 'No availability set';
    }

    return this.timezoneService.formatAvailabilityForDisplay(this.selectedDoctor.availability);
  }


  formatTime(time: string): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
  }


  isValidDateTime(): boolean {
    const date = this.appointmentForm.get('appointmentDate')?.value;
    const time = this.appointmentForm.get('appointmentTime')?.value;
    const period = this.appointmentForm.get('appointmentPeriod')?.value;

    if (!date || !time || !period) return true; 

    const istDateTime = this.createISTDateTimeFromForm(date, time, period);

  
    if (!this.timezoneService.isAppointmentInFuture(istDateTime)) {
      return false;
    }

    
    if (this.selectedDoctor?.availability) {
      return this.timezoneService.isTimeWithinAvailability(istDateTime, this.selectedDoctor.availability);
    }

    return true;
  }

  
  createISTDateTimeFromForm(date: string, time: string, period: string): any {
    
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;

    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }

    const time24 = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return this.timezoneService.createISTDateTime(date, time24);
  }

  
  getMinDate(): string {
    const now = this.timezoneService.getCurrentISTTime();
    return now.toFormat('yyyy-MM-dd');
  }

  
  getDateTimeValidationError(): string | null {
    const date = this.appointmentForm.get('appointmentDate')?.value;
    const time = this.appointmentForm.get('appointmentTime')?.value;
    const period = this.appointmentForm.get('appointmentPeriod')?.value;

    if (!date || !time || !period) return null;

    const istDateTime = this.createISTDateTimeFromForm(date, time, period);

    if (!this.timezoneService.isAppointmentInFuture(istDateTime)) {
      return 'Please select a future date and time';
    }

    if (this.selectedDoctor?.availability) {
      const availabilityDetails = this.timezoneService.getAvailabilityDetails(istDateTime, this.selectedDoctor.availability);

      if (!availabilityDetails.isAvailable) {
        const formattedTime = this.timezoneService.formatTimeToAMPM(istDateTime);
        const dayName = istDateTime.toFormat('cccc');

        if (availabilityDetails.suggestedTimes.length > 0) {
          return `Selected time ${formattedTime} on ${dayName} is outside doctor's availability. Available times: ${availabilityDetails.suggestedTimes.join(', ')}`;
        } else {
          return `Doctor is not available on ${dayName}. Available times: ${this.getDoctorAvailableHours()}`;
        }
      }
    }

    return null;
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
        case 'appointmentPeriod':
          return 'Please select AM or PM';
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


  
  hasDateTimeError(): boolean {
    const dateField = this.appointmentForm.get('appointmentDate');
    const timeField = this.appointmentForm.get('appointmentTime');
    const periodField = this.appointmentForm.get('appointmentPeriod');

    const fieldsAreTouched = (dateField?.touched || timeField?.touched || periodField?.touched);
    const fieldsHaveValues = (dateField?.value && timeField?.value && periodField?.value);

    return !!(fieldsAreTouched && fieldsHaveValues && !this.isValidDateTime());
  }


  isFormValidForSubmission(): boolean {
    const doctorControl = this.appointmentForm.get('doctor');
    const dateControl = this.appointmentForm.get('appointmentDate');
    const timeControl = this.appointmentForm.get('appointmentTime');
    const periodControl = this.appointmentForm.get('appointmentPeriod');
    const reasonControl = this.appointmentForm.get('reason');

    const doctorValid = !!(doctorControl?.value);
    const dateValid = !!(dateControl?.value);
    const timeValid = !!(timeControl?.value);
    const periodValid = !!(periodControl?.value);
    const reasonValid = !!(reasonControl?.value);
    const datetimeValid = dateValid && timeValid && periodValid && this.isValidDateTime();


    if (!doctorValid) {
      return false;
    }

    return doctorValid && datetimeValid && reasonValid;
  }

  onSubmit(): void {

    this.markFormGroupTouched(this.appointmentForm);


    const formValue = this.appointmentForm.getRawValue();

    const doctorValid = !!(formValue.doctor);
    const dateValid = !!(formValue.appointmentDate);
    const timeValid = !!(formValue.appointmentTime);
    const periodValid = !!(formValue.appointmentPeriod);
    const reasonValid = !!(formValue.reason);
    const datetimeValid = dateValid && timeValid && periodValid && this.isValidDateTime();

    console.log('Form validation:', { doctorValid, dateValid, timeValid, periodValid, reasonValid, datetimeValid, formValue });

    if (doctorValid && datetimeValid && reasonValid) {
      
      const istDateTime = this.createISTDateTimeFromForm(
        formValue.appointmentDate,
        formValue.appointmentTime,
        formValue.appointmentPeriod
      );
      const utcDateTimeString = this.timezoneService.convertISTToUTC(istDateTime);

      const appointmentData = {
        doctor: formValue.doctor,
        date: utcDateTimeString,
        reason: formValue.reason
      };

      console.log('Submitting appointment data:', {
        originalInputs: {
          date: formValue.appointmentDate,
          time: formValue.appointmentTime,
          period: formValue.appointmentPeriod
        },
        istDateTime: istDateTime.toISO(),
        utcForBackend: utcDateTimeString,
        appointmentData
      });

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
        missingFields.push('Choose appointment date');
      }
      if (!timeValid) {
        missingFields.push('Choose appointment time');
      }
      if (!periodValid) {
        missingFields.push('Select AM or PM');
      }
      if (dateValid && timeValid && periodValid && !this.isValidDateTime()) {
        const errorMsg = this.getDateTimeValidationError();
        missingFields.push(errorMsg || 'Select a valid date and time');
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

