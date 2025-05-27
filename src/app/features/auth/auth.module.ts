import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from '../../login/login.component';
import { RegisterComponent } from '../../register/register.component';

const routes: Routes = [
  { path: '', component: LoginComponent }, // For /login route
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
