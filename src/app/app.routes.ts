import { Routes } from '@angular/router';
import { LoginComponent } from '../app/features/auth/pages/login/login.component';
import { RegisterComponent } from '../app/features/auth/pages/register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
