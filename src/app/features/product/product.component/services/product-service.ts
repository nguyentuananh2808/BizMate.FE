import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductReadByIdResponse, ProductResponse } from '../models/product-response.model';
import { ApiUrls } from '../../../../config/api.config';
import { ProductSearchRequest } from '../models/product-search-request.model';
import { ProductCreateRequest } from '../models/product-create-request.model';
import { ProductUpdateRequest } from '../models/product-update-request.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  SearchProduct(
    keySearch: string | null,
    pageSize: number,
    pageIndex: number,
    isActive?: boolean
  ): Observable<ProductResponse> {
    var payload: ProductSearchRequest = {
      keySearch,
      pageIndex,
      pageSize,
      isActive,
    };
    console.log('keyseach: ', keySearch);

    return this.http.post<ProductResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.product.search}`,
      payload
    );
  }

  UpdateProduct(
    Id: string,
    RowVersion: string,
    ProductCategoryId: string,
    Name: string,
    Unit: number,
    IsActive: boolean,
    SalePrice: number,
    ImageUrl?: string,
    SupplierId?: string,
    Description?: string
  ): Observable<Product> {
    const body: ProductUpdateRequest = {
      Id,
      Name,
      ProductCategoryId,
      Unit,
      ImageUrl,
      SupplierId,
      RowVersion,
      IsActive,
      SalePrice,
      Description,
    };
    console.log('payload:', ProductCategoryId);
    return this.http.put<Product>(
      `${ApiUrls.baseUrl}${ApiUrls.product.update}`,
      body
    );
  }

  CreateProduct(
    name: string,
    productCategoryId: string,
    unit: number,
    salePrice: number,
    imageUrl: string,
    description: string
  ): Observable<any> {
    const body: ProductCreateRequest = {
      name,
      productCategoryId,
      salePrice,
      unit,
      imageUrl,
      description,
    };
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.product.create}`,
      body
    );
  }

  DeleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(
      `${ApiUrls.baseUrl}${ApiUrls.product.delete(id)}`
    );
  }
    ReadById(id: string): Observable<ProductReadByIdResponse> {
    return this.http.get<ProductReadByIdResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.product.readById(id)}`
    );
  }
}


