import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { RegisterResponse } from '../../models/register-response.model';

@Component({
  selector: 'register-app',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form: FormGroup;
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nameStore: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  isLoading = signal(false);

  onSubmit() {
    if (this.form.invalid) return;

    const { email, fullName, nameStore, password } = this.form.value;

    this.isLoading.set(true);

    this.authService.register(email, fullName, nameStore, password).subscribe({
      next: (res: RegisterResponse) => {
        localStorage.setItem('email', res.Email);

        setTimeout(() => {
          this.isLoading.set(false);
          this.router.navigate(['/verify-otp']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiMessage = err.error?.Message;
        let userMessage = 'Cập nhật thất bại';

        if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_DUPLICATE') {
          userMessage = 'Email đã tồn tại trong hệ thống';
        } else if (apiMessage) {
          userMessage = apiMessage; 
        }
        this.toastr.error(userMessage);
      },
    });
  }
}
