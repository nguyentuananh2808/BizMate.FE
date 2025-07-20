import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../../config/api.config';
import { WarehouseReceiptSearchResponse } from '../models/warehouse-receipt-search-response.model';
import { SearchWarehouseRequest } from '../models/warehouse-receipt-search-request.model';
import { InventoryReadById } from '../models/warehouse-receipt-detail.model';

@Injectable({ providedIn: 'root' })
export class WarehouseReceiptService {
  constructor(private http: HttpClient) {}

  SearchWarehouseReceipt = (
    request: SearchWarehouseRequest
  ): Observable<WarehouseReceiptSearchResponse> => {
    const body: SearchWarehouseRequest = {
      keySearch: request.keySearch,
      pageIndex: request.pageIndex,
      pageSize: request.pageSize,
      type: request.type,
    };
    return this.http.post<WarehouseReceiptSearchResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.warehouseReceipt.search}`,
      body
    );
  };

  ReadByIdWarehouseReceipt = (id: string): Observable<InventoryReadById> => {
    return this.http.get<InventoryReadById>(
      `${ApiUrls.baseUrl}${ApiUrls.warehouseReceipt.readById}/${id}`
    );
  };
}
