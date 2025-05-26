import { Component, OnInit } from '@angular/core';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-doctor-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  isAdmin: boolean = false;
  error: string | null = null;
  loading: boolean = false;

  // Define columns to display in the table
  displayedColumns: string[] = ['name', 'email', 'department', 'phone', 'licenseNumber', 'actions'];

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'admin';
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
        if (doctors.length === 0) {
          this.showSnackbar('No doctors found', 'info');
        }
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load doctors';
        this.loading = false;
        this.showSnackbar('Failed to load doctors', 'error');
      },
    });
  }

  deleteDoctor(id: string): void {
    if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      this.loading = true;

      this.doctorService.deleteDoctor(id).subscribe({
        next: () => {
          this.doctors = this.doctors.filter((d) => d._id !== id);
          this.loading = false;
          this.showSnackbar('Doctor deleted successfully', 'success');
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.error = err.error?.message || 'Failed to delete doctor';
          this.loading = false;
          this.showSnackbar(this.error ?? 'Unknown error', 'error');
        },
      });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/doctors/create']);
  }

  // Get unique department count for statistics
  getDepartmentCount(): number {
    if (!this.doctors || this.doctors.length === 0) {
      return 0;
    }

    const uniqueDepartments = new Set(
      this.doctors
        .filter(doctor => doctor.department) // Filter out doctors without department
        .map(doctor => doctor.department)
    );

    return uniqueDepartments.size;
  }

  // Helper method to show snackbar messages
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