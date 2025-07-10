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
import { RegisterResponse } from '../../models/register-response.model';

@Component({
  selector: 'register-app',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    HttpClientModule,
    RouterModule,
  ],
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
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { email, fullName, nameStore } = this.form.value;

    this.authService.register(email, fullName, nameStore).subscribe({
      next: (res: RegisterResponse) => {
        localStorage.setItem('otp_info', JSON.stringify(res));
        console.log("send mail success");
        //this.router.navigate(['/verify-otp']);
      },
      error: (err) => {
        const messages: Record<string, string> = {
          EMAIL_ALREADY_EXISTS: 'Email đã tồn tại',
          INVALID_DATA: 'Dữ liệu không hợp lệ',
        };

        const messageCode = err.error?.Message || 'UNKNOWN_ERROR';
        const userMessage = messages[messageCode] || 'Đăng ký thất bại ❌';

        this.toastr.error(userMessage);
      },
    });
  }
}
