import { Routes } from '@angular/router';

export const routes: Routes = [
 
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./features/register/register.module').then(m => m.RegisterModule)
  },

  
  {
    path: 'patient',
    loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule)
  },

  
  {
    path: 'doctor',
    loadChildren: () => import('./features/doctor/doctor.module').then(m => m.DoctorModule)
  },

  
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  
  {
    path: 'doctors',
    loadChildren: () => import('./features/doctors/doctors.module').then(m => m.DoctorsModule)
  },

 
  {
    path: 'appointments',
    loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
  },


  {
    path: 'patient/:id',
    loadChildren: () => import('./features/patient-details/patient-details.module').then(m => m.PatientDetailsModule)
  },

  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } 
];