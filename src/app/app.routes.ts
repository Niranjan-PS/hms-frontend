import { Routes } from '@angular/router';
import { PatientComponent } from './patient/patient.component';
import { DoctorComponent } from './doctor/doctor.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { PatientProfileComponent } from './patient-profile-component/patient-profile-component.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminPatientManagementComponent } from './admin-patient-management-component/admin-patient-management-component.component';
import { DoctorCreateComponent } from './components/doctor-create/doctor-create.component';
import { DoctorListComponent } from './components/doctor-list/doctor-list.component';
import { DoctorProfileComponent } from './components/doctor-profile/doctor-profile.component';
import { AdminGuard } from './guards/admin.guard';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';
import { AppointmentDetailComponent } from './components/appointment-detail/appointment-detail.component';
import { AppointmentCreateComponent } from './components/appointment-create/appointment-create.component';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Patient routes
  {
    path: 'patient',
    component: PatientComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['patient'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PatientComponent },
      { path: 'profile', component: PatientProfileComponent },
    ],
  },

  // Doctor routes
  {
    path: 'doctor',
    component: DoctorComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['doctor'] },
  },

  // Admin routes
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'patients', component: AdminPatientManagementComponent },
    ],
  },

  // Shared routes with role guards
  { path: 'doctors/create', component: DoctorCreateComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'doctors', component: DoctorListComponent, canActivate: [AuthGuard] },
  { path: 'doctors/:id', component: DoctorProfileComponent, canActivate: [AuthGuard] },
  { path: 'appointments', component: AppointmentListComponent, canActivate: [AuthGuard] },
  { path: 'appointments/create', component: AppointmentCreateComponent, canActivate: [AuthGuard] },
  { path: 'appointments/:id', component: AppointmentDetailComponent, canActivate: [AuthGuard] },

  // Default routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }, // Catch all route for 404
];