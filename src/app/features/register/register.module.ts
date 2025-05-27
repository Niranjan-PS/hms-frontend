import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { RegisterComponent } from '../../register/register.component';

const routes: Routes = [
  { path: '', component: RegisterComponent }, // For /register route
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class RegisterModule { }
