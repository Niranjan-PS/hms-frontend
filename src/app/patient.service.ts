import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    return this.http.get<Patient>(`${this.apiUrl}/${id}`,{headers: this.getAuthHeaders(),});
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
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No user logged in');
    return this.getPatient(user._id);
  }
}