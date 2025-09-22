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
  showPassword = false;

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
        this.toastr.success('Đăng nhập thành công');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiMessage = err.error?.Message;
        const passwordErrors: string[] = err.error?.errors?.Password || [];
        const message = passwordErrors[0];

        let userMessage = 'Cập nhật thất bại';

        if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_NOT_EXIST') {
          userMessage = 'Email không tồn tại trong hệ thống';
        } else if (apiMessage === 'BACKEND.APP_MESSAGE.NOT_VALID_PASSWORD') {
          userMessage = 'Mật khẩu không đúng';
        } else if (
          message ===
          'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_UPPERCASE'
        ) {
          userMessage = `Mật khẩu phải có ít nhất 1 ký tự đặc biệt,\n
                        có ít nhất 1 ký tự viết hoa,\n
                        có ít nhất 1 số`;
        } else if (
          message === 'BACKEND.VALIDATION.MESSAGE.MUST_HAVE_MIN_LENGTH'
        ) {
          userMessage = `Mật khẩu ít nhất 8 ký tự`;
        } else if (apiMessage) {
          userMessage = apiMessage;
        }

        this.toastr.error(userMessage);
      },
    });
  }
}
