import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../../config/api.config';
import { DealerPriceUpdateRequest } from '../models/dealer-price-update-request.models';
import { DealerPriceCreateRequest } from '../models/dealer-price-create-request.models';

@Injectable({ providedIn: 'root' })
export class DealerPriceService {
  constructor(private http: HttpClient) {}

  UpdateDealerPrice(body: DealerPriceUpdateRequest): Observable<any> {
    return this.http.put<any>(
      `${ApiUrls.baseUrl}${ApiUrls.dealerPrice.update}`,
      body
    );
  }

  CreateDealerPrice = (
    createDealerPriceRequestRequest: DealerPriceCreateRequest
  ): Observable<any> => {
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.dealerPrice.create}`,
      createDealerPriceRequestRequest
    );
  };

  DeleteDealerPrice(id: string): Observable<any> {
    return this.http.delete<any>(
      `${ApiUrls.baseUrl}${ApiUrls.dealerPrice.delete(id)}`
    );
  }
}
