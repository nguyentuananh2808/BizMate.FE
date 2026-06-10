import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly noPermissionMessage =
    'Bạn không có quyền truy cập chức năng này. Vui lòng liên hệ quản trị viên để được cấp quyền.';

  constructor(private toastr: ToastrService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');
    const request = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

    return next.handle(request).pipe(
      catchError((error) => {
        if (this.isPermissionDeniedError(error)) {
          const normalizedError = this.withPermissionDeniedMessage(error);
          this.toastr.error(this.noPermissionMessage);

          return throwError(() => normalizedError);
        }

        return throwError(() => error);
      })
    );
  }

  private isPermissionDeniedError(error: unknown): error is HttpErrorResponse {
    if (!(error instanceof HttpErrorResponse)) return false;
    if (error.status === 403) return true;

    const message = this.collectErrorText(error).toLowerCase();

    return [
      'forbidden',
      'access denied',
      'permission denied',
      'not authorized',
      'unauthorized access',
      'không có quyền',
      'khong co quyen',
      'không được phép',
      'khong duoc phep',
    ].some((keyword) => message.includes(keyword));
  }

  private withPermissionDeniedMessage(
    error: HttpErrorResponse
  ): HttpErrorResponse {
    const errorBody = this.normalizeErrorBody(error.error);

    return new HttpErrorResponse({
      error: errorBody,
      headers: error.headers,
      status: error.status,
      statusText: error.statusText,
      url: error.url ?? undefined,
    });
  }

  private normalizeErrorBody(errorBody: unknown): Record<string, unknown> {
    if (this.isRecord(errorBody)) {
      return {
        ...errorBody,
        Message: this.noPermissionMessage,
        message: this.noPermissionMessage,
      };
    }

    return {
      Message: this.noPermissionMessage,
      message: this.noPermissionMessage,
      OriginalMessage: errorBody,
    };
  }

  private collectErrorText(error: HttpErrorResponse): string {
    const values = [
      error.message,
      error.statusText,
      this.readErrorBodyText(error.error),
    ];

    return values.filter(Boolean).join(' ');
  }

  private readErrorBodyText(errorBody: unknown): string {
    if (!errorBody) return '';
    if (typeof errorBody === 'string') return errorBody;
    if (!this.isRecord(errorBody)) return '';

    return Object.values(errorBody)
      .flatMap((value) => {
        if (typeof value === 'string' || typeof value === 'number') {
          return String(value);
        }

        if (Array.isArray(value)) {
          return value.filter((item) => typeof item === 'string') as string[];
        }

        return [];
      })
      .join(' ');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
