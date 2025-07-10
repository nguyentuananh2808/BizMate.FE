import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from '../models/login-response.model';
import { RegisterRequest } from '../models/register-request.model';
import { RegisterResponse } from '../models/register-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:44349/v1';
  private authPath = 'auth';
  private user = 'user';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/${this.authPath}/login`,
      { email, password }
    );
  }

  register(
    email: string,
    fullName: string,
    nameStore: string
  ): Observable<RegisterResponse> {
    const body: RegisterRequest = {
      email,
      fullName,
      nameStore,
    };

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/${this.user}/register`,
      body
    );
  }
}
