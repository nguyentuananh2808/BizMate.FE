import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
