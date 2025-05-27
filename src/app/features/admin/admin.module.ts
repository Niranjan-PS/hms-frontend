import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AdminDashboardComponent } from '../../admin-dashboard/admin-dashboard.component';
import { AdminDashboardHomeComponent } from '../../components/admin-dashboard-home/admin-dashboard-home.component';
import { AdminPatientManagementComponent } from '../../admin-patient-management-component/admin-patient-management-component.component';
import { PatientProfileComponent } from '../../patient-profile-component/patient-profile-component.component';

// Guards
import { AuthGuard } from '../../auth.guard';
import { AdminGuard } from '../../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardHomeComponent },
      { path: 'patients', component: AdminPatientManagementComponent },
      { path: 'patients/:id', component: PatientProfileComponent },
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
export class AdminModule { }
