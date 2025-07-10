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
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { VerifyOtpResponse } from '../../models/verify-otp-response.model';

@Component({
  selector: 'verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent {
  form: FormGroup;
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.fb.group({
      otp: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { otp } = this.form.value;

    const email : string | null = localStorage.getItem('email');
    this.authService.verifyOtp(otp, email).subscribe({
      next: (res: VerifyOtpResponse) => {
        localStorage.setItem('otp_info', JSON.stringify(res));
        console.log('verify otp success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const messages: Record<string, string> = {
          COMMON_ALREADY_EXIST: 'Email đã tồn tại',
          INVALID_DATA: 'Dữ liệu không hợp lệ',
        };

        const messageCode = err.error?.Message || 'UNKNOWN_ERROR';
        const userMessage = messages[messageCode] || 'Đăng ký thất bại ❌';

        this.toastr.error(userMessage);
      },
    });
  }
}
