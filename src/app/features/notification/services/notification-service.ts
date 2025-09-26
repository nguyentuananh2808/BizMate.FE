import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../../config/api.config';
import { NotificationResponse } from '../models/notification-request.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseUrl = ApiUrls.baseUrl + ApiUrls.notification.get;

  constructor(private http: HttpClient) {}

  getNotifications(lastChecked: string): Observable<NotificationResponse> {
  return this.http.post<NotificationResponse>(this.baseUrl, { lastChecked });
}

}
