import { Component, OnInit } from '@angular/core';
import { DoctorService, Doctor } from '../../services/doctor.service';

import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-list',
   imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  isAdmin: boolean = false;
  error: string | null = null;

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'admin';
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load doctors';
      },
    });
  }

  deleteDoctor(id: string): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.doctorService.deleteDoctor(id).subscribe({
        next: () => {
          this.doctors = this.doctors.filter((d) => d._id !== id);
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.error = err.error.message || 'Failed to delete doctor';
        },
      });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/doctors/create']);
  }
}