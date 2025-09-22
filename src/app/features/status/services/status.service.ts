import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../../config/api.config';
import { SearchStatusResponse, StatusDto } from '../models/status-dto.model';

@Injectable({ providedIn: 'root' })
export class StatusService {
  constructor(private http: HttpClient) {}

  SearchStatus = (group: string): Observable<SearchStatusResponse> => {
    const body = {
      Group: group,
    };
    return this.http.post<SearchStatusResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.status.getByGroup}`,
      body
    );
  };
}
