import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AppointmentListComponent } from '../../components/appointment-list/appointment-list.component';
import { AppointmentDetailComponent } from '../../components/appointment-detail/appointment-detail.component';
import { AppointmentCreateComponent } from '../../components/appointment-create/appointment-create.component';

// Guards
import { AuthGuard } from '../../auth.guard';

const routes: Routes = [
  { path: '', component: AppointmentListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: AppointmentCreateComponent, canActivate: [AuthGuard] },
  { path: ':id', component: AppointmentDetailComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AppointmentsModule { }
