import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiUrls } from '../../../config/api.config';
import { Customer, CustomerReadByIdResponse, CustomerResponse } from '../models/customer-response.model';
import { CustomerUpdateRequest } from '../models/customer-update-request.model';
import { CreateCustomerRequest } from '../models/cutomer-create-request.model';
import { CustomerSearchRequest } from '../models/customer-request-search.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private http: HttpClient) {}

  SearchCustomer(
      keySearch: string | null,
      pageSize: number,
      pageIndex: number,
      isActive?: boolean
    ): Observable<CustomerResponse> {
      var payload: CustomerSearchRequest = {
        keySearch,
        pageIndex,
        pageSize,
        isActive
      };
  
      return this.http.post<CustomerResponse>(
        `${ApiUrls.baseUrl}${ApiUrls.customer.search}`,
        payload
      );
    }
  UpdateCustomer(
    Id: string,
    Code: string,
    Name: string,
    Phone: string,
    Address: string,
    RowVersion: string,
    IsActive: boolean,
    DealerLevelId?: string | undefined
  ): Observable<Customer> {
    const body: CustomerUpdateRequest = {
      Id,
      Code,
      Name,
      Phone,
      Address,
      RowVersion,
      IsActive,
      DealerLevelId,
    };
    return this.http.put<Customer>(
      `${ApiUrls.baseUrl}${ApiUrls.customer.update}`,
      body
    );
  }

  CreateCustomer(
    name: string,
    phone: string,
    address: string
  ): Observable<any> {
    const body: CreateCustomerRequest = {
      name,
      phone,
      address
    };
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.customer.create}`,
      body
    );
  }

  DeleteCustomer(id: string): Observable<any> {
    return this.http.delete<any>(
      `${ApiUrls.baseUrl}${ApiUrls.customer.delete(id)}`
    );
  }

   ReadByIdCustomer(id: string): Observable<CustomerReadByIdResponse> {
    return this.http.get<CustomerReadByIdResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.customer.getById(id)}`
    );
  }
}
