import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { DoctorCreateComponent } from '../../components/doctor-create/doctor-create.component';
import { DoctorListComponent } from '../../components/doctor-list/doctor-list.component';
import { DoctorProfileComponent } from '../../components/doctor-profile/doctor-profile.component';

// Guards
import { AuthGuard } from '../../auth.guard';
import { AdminGuard } from '../../guards/admin.guard';

const routes: Routes = [
  { path: 'create', component: DoctorCreateComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: '', component: DoctorListComponent, canActivate: [AuthGuard] },
  { path: ':id', component: DoctorProfileComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DoctorsModule { }
