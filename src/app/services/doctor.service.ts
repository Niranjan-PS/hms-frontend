import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Doctor {
  _id?: string;
  user?: string | { _id: string; name: string; email: string; role: string };
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  department: string;
  licenseNumber: string;
  availability?: { day: string; startTime: string; endTime: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/api/doctors`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  createDoctor(doctor: any): Observable<Doctor> {
    return this.http.post<Doctor>(this.apiUrl, doctor,{
       headers: this.getAuthHeaders(),
    });

  }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  getDoctor(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateDoctor(id: string, doctor: Partial<Doctor>): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.apiUrl}/${id}`, doctor, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteDoctor(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  
  getCurrentDoctor(): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/current`, {
      headers: this.getAuthHeaders(),
    });
  }
}