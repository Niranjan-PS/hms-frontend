import { Routes } from '@angular/router';

export const routes: Routes = [
  // Auth routes (Login and Register) - Lazy loaded
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./features/register/register.module').then(m => m.RegisterModule)
  },

  // Patient routes - Lazy loaded
  {
    path: 'patient',
    loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule)
  },

  // Doctor routes - Lazy loaded
  {
    path: 'doctor',
    loadChildren: () => import('./features/doctor/doctor.module').then(m => m.DoctorModule)
  },

  // Admin routes - Lazy loaded
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  // Doctors management routes - Lazy loaded
  {
    path: 'doctors',
    loadChildren: () => import('./features/doctors/doctors.module').then(m => m.DoctorsModule)
  },

  // Appointments routes - Lazy loaded
  {
    path: 'appointments',
    loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
  },

  // Patient details routes - Lazy loaded
  {
    path: 'patient/:id',
    loadChildren: () => import('./features/patient-details/patient-details.module').then(m => m.PatientDetailsModule)
  },

  // Default routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Catch all route for 404
];