import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { JwtPayload } from '../../models/jwt-payload-response.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'login-app',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
  isLoading = signal(false);
  onSubmit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    this.isLoading.set(true);
    this.authService.login(email, password).subscribe({
      next: (res) => {
        localStorage.setItem('access_token', res.AccessToken.Token);
        const decoded = jwtDecode<JwtPayload>(res.AccessToken.Token);
        localStorage.setItem('user_id', decoded.user_id);
        localStorage.setItem('store_name', decoded.store_name);
        localStorage.setItem('name', decoded.name);
        localStorage.setItem('email', decoded.sub);
        localStorage.setItem('role', decoded.role);
        setTimeout(() => {
          this.isLoading.set(false);
          this.router.navigate(['/verify-otp']);
        }, 3000);
        this.toastr.success('Đăng nhập thành công');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const messages: Record<string, string> = {
          COMMON_NOT_EXIST: 'Tài khoản không tồn tại hoặc sai mật khẩu',
          INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
        };

        const messageCode = err.error?.Message || 'UNKNOWN_ERROR';
        const userMessage = messages[messageCode] || 'Đăng nhập thất bại';

        this.toastr.error(userMessage);
      },
    });
  }
}
