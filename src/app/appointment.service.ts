import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Appointment } from './appointment';
import { environment } from '../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  appointments?: T[];
  appointment?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/api/appointments`;
  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('AppointmentService using this API URL:', this.apiUrl);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService ? this.authService.getToken() : '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }


  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<ApiResponse<Appointment>>(this.apiUrl, appointment, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {
        if (response.success && response.appointment) {
          return response.appointment;
        } else {
          throw new Error(response.error || 'Failed to create appointment');
        }
      })
    );
  }

  getAppointments(): Observable<Appointment[]> {
    

    return this.http.get<ApiResponse<Appointment>>(this.apiUrl, {
      withCredentials: true,
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {
        
        if (response.success && response.appointments) {
          return response.appointments;
        } else {
          
          throw new Error(response.error || 'Invalid response format from server');
        }
      }),
      catchError((error: HttpErrorResponse) => {
    

        let errorMessage = 'Failed to load appointments';

        if (error.status === 404) {
          errorMessage = 'Appointments not found or profile missing';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to view appointments';
        } else if (error.status === 401) {
          errorMessage = 'Please log in to view appointments';
        } else if (error.status === 500) {
          errorMessage = error.error?.error || error.error?.message || 'Server error occurred while loading appointments';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMessage = error.error?.error || error.error?.message || error.message || 'Failed to load appointments';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
  getDoctorAppointments(): Observable<{ success: boolean; appointments: Appointment[] }> {
    

    return this.http.get<{ success: boolean; appointments: Appointment[] }>(`${this.apiUrl}/doctor`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {
      
        if (response.success && response.appointments) {
          return response;
        } else {
          
          throw new Error('Invalid response format from server');
        }
      }),
      catchError((error: HttpErrorResponse) => {
     

        let errorMessage = 'Failed to load appointments';

        if (error.status === 404) {
          errorMessage = 'Appointments endpoint not found';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to view appointments';
        } else if (error.status === 401) {
          errorMessage = 'Please log in to view appointments';
        } else if (error.status === 500) {
          errorMessage = error.error?.message || 'Server error occurred while loading appointments';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMessage = error.error?.message || error.message || 'Failed to load appointments';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {
        if (response.success && response.appointment) {
          return response.appointment;
        } else {
          throw new Error(response.error || 'Failed to fetch appointment');
        }
      })
    );
  }

  updateAppointment(id: string, appointment: Partial<Appointment>): Observable<Appointment> {
   

    if (!id) {
      throw new Error('Appointment ID is required');
    }

    return this.http.put<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, appointment, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {
        
        if (response.success && response.appointment) {
          return response.appointment;
        } else {
          
          throw new Error(response.error || 'Failed to update appointment');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        

        let errorMessage = 'Failed to update appointment';

        
        if (error.status === 404) {
          errorMessage = 'Appointment not found';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to update this appointment';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || error.error?.error || 'Invalid appointment data';
        } else if (error.status === 500) {
          errorMessage = error.error?.message || error.error?.error || 'Server error occurred while updating appointment';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMessage = error.error?.message || error.error?.error || error.message || 'Failed to update appointment';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  cancelAppointment(id: string): Observable<{ message: string }> {
    

    if (!id) {
      throw new Error('Appointment ID is required');
    }

    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {

        if (response.success) {
          return { message: response.message || 'Appointment cancelled successfully' };
        } else {
          
          throw new Error(response.error || 'Failed to cancel appointment');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        

        let errorMessage = 'Failed to cancel appointment';

        // Handle different types of errors
        if (error.status === 404) {
          errorMessage = 'Appointment not found';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to cancel this appointment';
        } else if (error.status === 500) {
          errorMessage = error.error?.message || error.error?.error || 'Server error occurred while cancelling appointment';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMessage = error.error?.message || error.error?.error || error.message || 'Failed to cancel appointment';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}