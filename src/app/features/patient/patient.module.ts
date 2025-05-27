import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { PatientComponent } from '../../patient/patient.component';
import { PatientDashboardHomeComponent } from '../../components/patient-dashboard-home/patient-dashboard-home.component';
import { PatientProfileComponent } from '../../patient-profile-component/patient-profile-component.component';
import { PatientDoctorListComponent } from '../../components/patient-doctor-list/patient-doctor-list.component';
import { AboutUsComponent } from '../../components/about-us/about-us.component';


import { AuthGuard } from '../../auth.guard';
import { RoleGuard } from '../../role.guard';

const routes: Routes = [
  {
    path: '',
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
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PatientModule { }
