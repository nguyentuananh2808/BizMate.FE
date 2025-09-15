import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../../config/api.config';
import { SearchOrderRequest } from '../models/search-order-request.model';
import { OrderDto } from '../models/order-dto.model';
import { UpdateOrderRequest } from '../models/update-order-request.model';
import { GetOrdersResponse } from '../models/order-search-response.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  SearchOrder = (request: SearchOrderRequest): Observable<GetOrdersResponse> => {
    const body: SearchOrderRequest = {
      keySearch: request.keySearch,
      pageIndex: request.pageIndex,
      pageSize: request.pageSize,
      dateFrom: request.dateFrom,
      dateTo: request.dateTo,
      statusIds: request.statusIds,
    };
    return this.http.post<GetOrdersResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.order.search}`,
      body
    );
  };

  ReadByIdOrder = (id: string): Observable<OrderDto> => {
    return this.http.get<OrderDto>(
      `${ApiUrls.baseUrl}${ApiUrls.order.readById}/${id}`
    );
  };

  UpdateOrder(body: UpdateOrderRequest): Observable<any> {
    return this.http.put<any>(
      `${ApiUrls.baseUrl}${ApiUrls.order.update}`,
      body
    );
  }

  CreateOrder = (
    createReceiptRequestRequest: UpdateOrderRequest
  ): Observable<any> => {
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.order.create}`,
      createReceiptRequestRequest
    );
  };
}
