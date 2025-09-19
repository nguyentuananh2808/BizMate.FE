import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../../config/api.config';
import { WarehouseReceiptSearchResponse } from '../models/warehouse-receipt-search-response.model';
import { SearchWarehouseRequest } from '../models/warehouse-receipt-search-request.model';
import { InventoryReadById } from '../models/warehouse-receipt-detail.model';
import { CreateReceiptRequestRequest } from '../models/warehouse-receipt-create.model';
import { UpdateReceiptRequestRequest } from '../models/warehouse-receipt-update.model';

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
      dateFrom: request.dateFrom,
      dateTo: request.dateTo,
      statusIds: request.statusIds,
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

  UpdateWarehouseReceipt(body: UpdateReceiptRequestRequest): Observable<any> {
    return this.http.put<any>(
      `${ApiUrls.baseUrl}${ApiUrls.warehouseReceipt.update}`,
      body
    );
  }

  CreateWarehouseReceipt = (
    createReceiptRequestRequest: CreateReceiptRequestRequest
  ): Observable<any> => {
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.warehouseReceipt.create}`,
      createReceiptRequestRequest
    );
  };
}
