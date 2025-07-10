import { Routes } from '@angular/router';
import { LoginComponent } from '../app/features/auth/pages/login/login.component';
import { RegisterComponent } from '../app/features/auth/pages/register/register.component';
import { VerifyOtpComponent } from './features/auth/pages/verify-otp/verify-otp.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: VerifyOtpComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
