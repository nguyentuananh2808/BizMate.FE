import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  step: 'request' | 'reset' = 'request';
  email = '';
  showPassword = false;
  showConfirmPassword = false;

  readonly requestForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly resetForm = this.fb.nonNullable.group(
    {
      otp: [
        '',
        [Validators.required, Validators.pattern(/^\d{6}$/)],
      ],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  submitEmail(): void {
    if (this.requestForm.invalid || this.isSubmitting()) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const email = this.requestForm.controls.email.value.trim().toLowerCase();
    this.isSubmitting.set(true);
    this.authService
      .forgotPassword(email)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.email = response.Email || email;
          this.step = 'reset';
          this.toastr.success(
            response.Message || 'OTP đặt lại mật khẩu đã được gửi.'
          );
        },
        error: (error) => this.toastr.error(this.getErrorMessage(error)),
      });
  }

  submitReset(): void {
    if (this.resetForm.invalid || this.isSubmitting()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const { otp, newPassword } = this.resetForm.getRawValue();
    this.isSubmitting.set(true);
    this.authService
      .resetPassword(this.email, otp.trim(), newPassword)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.toastr.success(
            response.Message || 'Đặt lại mật khẩu thành công.'
          );
          this.router.navigate(['/login']);
        },
        error: (error) => this.toastr.error(this.getErrorMessage(error)),
      });
  }

  resendOtp(): void {
    if (this.isSubmitting()) return;

    this.requestForm.controls.email.setValue(this.email);
    this.submitEmail();
  }

  editEmail(): void {
    this.step = 'request';
    this.resetForm.reset();
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private getErrorMessage(error: any): string {
    const apiMessage = error?.error?.Message || error?.error?.message;
    const validationErrors = error?.error?.errors;

    if (validationErrors && typeof validationErrors === 'object') {
      const firstMessage = Object.values(validationErrors)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .find((value): value is string => typeof value === 'string');

      if (firstMessage) return this.mapValidationMessage(firstMessage);
    }

    return apiMessage || 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
  }

  private mapValidationMessage(message: string): string {
    const messageMap: Record<string, string> = {
      'BACKEND.VALIDATION.MESSAGE.MUST_NOT_EMPTY':
        'Vui lòng nhập đầy đủ thông tin.',
      'BACKEND.VALIDATION.MESSAGE.MUST_HAVE_MIN_LENGTH':
        'Mật khẩu phải có ít nhất 8 ký tự.',
      'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_UPPERCASE':
        'Mật khẩu phải có chữ hoa.',
      'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_LOWERCASE':
        'Mật khẩu phải có chữ thường.',
      'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_DIGIT':
        'Mật khẩu phải có chữ số.',
      'BACKEND.VALIDATION.MESSAGE.PASSWORD_MUST_CONTAIN_SPECIAL_CHAR':
        'Mật khẩu phải có ký tự đặc biệt.',
    };

    return messageMap[message] || message;
  }
}
