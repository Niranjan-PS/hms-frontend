import { Routes } from '@angular/router';
import { PatientComponent } from './patient/patient.component';
import { DoctorComponent } from './doctor/doctor.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { PatientProfileComponent } from './patient-profile-component/patient-profile-component.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminDashboardHomeComponent } from './components/admin-dashboard-home/admin-dashboard-home.component';
import { PatientDashboardHomeComponent } from './components/patient-dashboard-home/patient-dashboard-home.component';
import { PatientDoctorListComponent } from './components/patient-doctor-list/patient-doctor-list.component';
import { AdminPatientManagementComponent } from './admin-patient-management-component/admin-patient-management-component.component';
import { DoctorCreateComponent } from './components/doctor-create/doctor-create.component';
import { DoctorListComponent } from './components/doctor-list/doctor-list.component';
import { DoctorProfileComponent } from './components/doctor-profile/doctor-profile.component';
import { AdminGuard } from './guards/admin.guard';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';
import { AppointmentDetailComponent } from './components/appointment-detail/appointment-detail.component';
import { AppointmentCreateComponent } from './components/appointment-create/appointment-create.component';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { AboutUsComponent } from './components/about-us/about-us.component';

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
      { path: 'dashboard', component: PatientDashboardHomeComponent },
      { path: 'profile', component: PatientProfileComponent },
      { path: 'doctors', component: PatientDoctorListComponent },
      { path: 'about-us', component: AboutUsComponent },
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
      { path: 'dashboard', component: AdminDashboardHomeComponent },
      { path: 'patients', component: AdminPatientManagementComponent },
      { path: 'patients/:id', component: PatientProfileComponent },
    ],
  },

  // Shared routes with role guards
  { path: 'doctors/create', component: DoctorCreateComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'doctors', component: DoctorListComponent, canActivate: [AuthGuard] },
  { path: 'doctors/:id', component: DoctorProfileComponent, canActivate: [AuthGuard] },
  { path: 'appointments', component: AppointmentListComponent, canActivate: [AuthGuard] },
  { path: 'appointments/create', component: AppointmentCreateComponent, canActivate: [AuthGuard] },
  { path: 'appointments/:id', component: AppointmentDetailComponent, canActivate: [AuthGuard] },
  { path: 'patient/:id', component: PatientDetailComponent, canActivate: [AuthGuard] },

  // Default routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }, // Catch all route for 404
];