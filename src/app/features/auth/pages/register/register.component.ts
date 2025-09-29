import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
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
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        nameStore: ['', Validators.required],
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Map lỗi từ backend sang thông báo tiếng Việt
  private mapBackendError(errorKey: string): string {
    switch (errorKey) {
      case 'BACKEND.VALIDATION.MESSAGE.MUST_NOT_EMPTY':
        return 'Trường này là bắt buộc.';
      case 'BACKEND.VALIDATION.MESSAGE.MUST_HAVE_MIN_LENGTH':
        return 'Mật khẩu phải có ít nhất 8 ký tự.';
      case 'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_UPPERCASE':
        return 'Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z).';
      case 'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_LOWERCASE':
        return 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).';
      case 'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_DIGIT':
        return 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9).';
      case 'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_SPECIAL_CHAR':
        return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, #, $, ...).';
      case 'BACKEND.VALIDATION.MESSAGE.INVALID_ENUM_VALUE':
        return 'Email không hợp lệ.';
      case 'BACKEND.APP_MESSAGE.DATA_DUPLICATE':
        return 'Email đã tồn tại trong hệ thống.';
      default:
        return errorKey || 'Có lỗi xảy ra.';
    }
  }

  // Validator custom: check password === confirmPassword
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); 
      return;
    }

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

        if (err.error?.errors) {
          const errors = err.error.errors;
          const messages: string[] = [];

          Object.keys(errors).forEach((field) => {
            const fieldErrors: string[] = errors[field];
            fieldErrors.forEach((errorKey) => {
              messages.push(this.mapBackendError(errorKey));
            });
          });

          messages.forEach((msg) => this.toastr.error(msg));
          return;
        }

        const apiMessage = err.error?.Message;
        const userMessage = this.mapBackendError(apiMessage);
        this.toastr.error(userMessage);
      },
    });
  }
}
