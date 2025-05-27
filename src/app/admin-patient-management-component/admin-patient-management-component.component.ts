import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '../patient';
import { PatientService } from '../patient.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-patient-management-component',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-patient-management-component.component.html',
  styleUrl: './admin-patient-management-component.component.css'
})

export class AdminPatientManagementComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'gender', 'phone', 'actions'];
  patients: Patient[] = [];
  error: string | null = null;

  @ViewChild(MatTable) table!: MatTable<Patient>;

  constructor(
    private patientService: PatientService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        if (this.table) {
          this.table.renderRows();
        }
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to load patients';
        
      },
    });
  }

  viewPatient(id: string): void {
    this.router.navigate([`/admin/patients/${id}`]);
  }

  deletePatient(id: string): void {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.patients = this.patients.filter((p) => p._id !== id);
          if (this.table) {
            this.table.renderRows();
          }
          this.error = null;
          this.snackBar.open('Patient deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          
          this.error = err.error.message || 'Failed to delete patient';
          this.snackBar.open('Failed to delete patient', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        },
      });
    }
  }
}
