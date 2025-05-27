import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { PatientDetailComponent } from '../../components/patient-detail/patient-detail.component';


import { AuthGuard } from '../../auth.guard';

const routes: Routes = [
  { path: '', component: PatientDetailComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PatientDetailsModule { }
