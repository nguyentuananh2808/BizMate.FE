import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductResponse } from '../models/product-response.model';
import { ApiUrls } from '../../../config/api.config';
import { ProductSearchRequest } from '../models/product-search-request.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  SearchProduct(
    keySearch: string | null,
    pageSize: number,
    pageIndex: number
  ): Observable<ProductResponse> {
    var payload: ProductSearchRequest = {
      keySearch,
      pageIndex,
      pageSize,
    };
    return this.http.post<ProductResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.product.search}`,
      payload
    );
  }

  //   UpdateProduct(
  //     Id: string,
  //     Code: string,
  //     Name: string,
  //     RowVersion: number,
  //     IsActive: boolean,
  //     Description: string
  //   ): Observable<Product> {
  //     const body: ProductUpdateRequest = {
  //       Id,
  //       Code,
  //       Name,
  //       RowVersion,
  //       IsActive,
  //       Description,
  //     };
  //     return this.http.put<Product>(`${this.apiUrl}`, body);
  //   }

  //   CreateProduct(name: string, description: string): Observable<any> {
  //     const body: CreateProductRequest = {
  //       name,
  //       description,
  //     };
  //     return this.http.post<any>(`${this.apiUrl}`, body);
  //   }

  //   DeleteProduct(id: string): Observable<any> {
  //     return this.http.delete<any>(`${this.apiUrl}/${id}`);
  //   }
}
