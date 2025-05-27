import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { DoctorComponent } from '../../doctor/doctor.component';


import { AuthGuard } from '../../auth.guard';
import { RoleGuard } from '../../role.guard';

const routes: Routes = [
  {
    path: '',
    component: DoctorComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['doctor'] },
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DoctorModule { }
