import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../../config/api.config';
import { InventoryReadById } from '../../inventory-receipt/models/warehouse-receipt-detail.model';
import { DealerLevelSearchResponse } from '../models/dealer-level-search-response.model';
import { DealerLevelSearchRequest } from '../models/dealer-level-search-request.model';
import { DealerLevelUpdateRequest } from '../models/dealer-level-update-request.model';
import { DealerLevelCreateRequest } from '../models/dealer-level-create-request.model';


@Injectable({ providedIn: 'root' })
export class DealerLevelService {
  constructor(private http: HttpClient) {}

  SearchDealerLevel = (
    request: DealerLevelSearchRequest
  ): Observable<DealerLevelSearchResponse> => {
    const body: DealerLevelSearchRequest = {
      keySearch: request.keySearch,
      pageIndex: request.pageIndex,
      pageSize: request.pageSize,

    };
    return this.http.post<DealerLevelSearchResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.dealerLevel.search}`,
      body
    );
  };

  ReadByIdDealerLevel = (id: string): Observable<InventoryReadById> => {
    return this.http.get<InventoryReadById>(
      `${ApiUrls.baseUrl}${ApiUrls.dealerLevel.readById}/${id}`
    );
  };

  UpdateDealerLevel(body: DealerLevelUpdateRequest): Observable<any> {
    return this.http.put<any>(
      `${ApiUrls.baseUrl}${ApiUrls.dealerLevel.update}`,
      body
    );
  }

  CreateDealerLevel = (
    createDealerLevelRequestRequest: DealerLevelCreateRequest
  ): Observable<any> => {
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.dealerLevel.create}`,
      createDealerLevelRequestRequest
    );
  };
}
