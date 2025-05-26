import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Patient } from './patient';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = 'http://localhost:5000/api/patients';

  constructor(private http: HttpClient, private authService: AuthService) {}
   // Helper function to get headers with JWT token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // You must implement this in AuthService
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Create patient profile
 createPatient(patient: Patient): Observable<Patient> {
  return this.http.post<Patient>(this.apiUrl, patient, {
    headers: this.getAuthHeaders(), // ✅ Include auth headers

  });
}


  // Get patient profile by ID
  getPatient(id: string): Observable<Patient> {
    console.log('PatientService - Getting patient:', id);

    if (!id) {
      return throwError(() => new Error('Patient ID is required'));
    }

    return this.http.get<Patient>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(patient => {
        console.log('PatientService - Patient response:', patient);
        return patient;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('PatientService - Error getting patient:', error);

        let errorMessage = 'Failed to load patient details';

        if (error.status === 404) {
          errorMessage = 'Patient not found';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to view this patient profile';
        } else if (error.status === 500) {
          errorMessage = error.error?.message || 'Server error occurred while loading patient details';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMessage = error.error?.message || error.message || 'Failed to load patient details';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Get all patients (admin only)
  getAllPatients(): Observable<Patient[]> {
    return this.http.get<{success: boolean, count: number, patients: Patient[]}>(
      this.apiUrl,
      {headers: this.getAuthHeaders()}
    ).pipe(
      map(response => response.patients)
    );
  }



  // Update patient profile
  updatePatient(id: string, patient: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient,{
        headers: this.getAuthHeaders(),
    });

  }

  // Delete patient profile (admin only)
  deletePatient(id: string): Observable<{ success: boolean, message: string, patientId: string }> {
    return this.http.delete<{ success: boolean, message: string, patientId: string }>(
      `${this.apiUrl}/${id}`,
      {headers: this.getAuthHeaders()}
    );
  }

  // Get current patient's profile
  getCurrentPatient(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/current`, {
      headers: this.getAuthHeaders()
    });
  }
}