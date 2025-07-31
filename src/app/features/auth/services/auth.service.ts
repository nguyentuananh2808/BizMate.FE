import { VerifyOtpResponse } from './../models/verify-otp-response.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from '../models/login-response.model';
import { RegisterRequest } from '../models/register-request.model';
import { RegisterResponse } from '../models/register-response.model';
import { VerifyOtpRequest } from '../models/verify-otp-request.model';
import { ApiUrls } from '../../../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${ApiUrls.baseUrl}${ApiUrls.auth.login}`, {
      email,
      password,
    });
  }

  register(
    email: string,
    fullName: string,
    nameStore: string,
    password: string
  ): Observable<RegisterResponse> {
    const body: RegisterRequest = {
      email,
      fullName,
      nameStore,
      password,
    };

    return this.http.post<RegisterResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.auth.register}`,
      body
    );
  }

  verifyOtp(otp: number, email: string | null): Observable<VerifyOtpResponse> {
    const body: VerifyOtpRequest = {
      otp,
      email,
    };

    return this.http.post<VerifyOtpResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.auth.verifyOtp}`,
      body
    );
  }
}
