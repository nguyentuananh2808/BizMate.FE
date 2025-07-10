import { Component, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'login-app',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup;
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        localStorage.setItem('access_token', res.token);
        this.toastr.success('Đăng nhập thành công 🎉');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const messages: Record<string, string> = {
          COMMON_NOT_EXIST: 'Tài khoản không tồn tại hoặc sai mật khẩu',
          INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
        };

        const messageCode = err.error?.Message || 'UNKNOWN_ERROR';
        const userMessage = messages[messageCode] || 'Đăng nhập thất bại ❌';

        this.toastr.error(userMessage);
      },
    });
  }
}
