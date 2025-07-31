import { CreateProductCategoryRequest } from './../models/product-category-create-request.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductCategoryResponse } from '../models/product-category-response.model';
import { ProductCategory } from '../models/product-category-response.model';
import { ProductCategoryUpdateRequest } from '../models/product-category-update-request.model';
import { ApiUrls } from '../../../config/api.config';

@Injectable({ providedIn: 'root' })
export class ProductCategoryService {
  constructor(private http: HttpClient) {}

  GetAll(): Observable<ProductCategoryResponse> {
    return this.http.get<ProductCategoryResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.productCategory.getAll}`
    );
  }

  UpdateProductCategory(
    Id: string,
    Code: string,
    Name: string,
    RowVersion: string,
    IsActive: boolean,
    Description: string
  ): Observable<ProductCategory> {
    const body: ProductCategoryUpdateRequest = {
      Id,
      Code,
      Name,
      RowVersion,
      IsActive,
      Description,
    };
    return this.http.put<ProductCategory>(
      `${ApiUrls.baseUrl}${ApiUrls.productCategory.update}`,
      body
    );
  }

  CreateProductCategory(name: string, description: string): Observable<any> {
    const body: CreateProductCategoryRequest = {
      name,
      description,
    };
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.productCategory.create}`,
      body
    );
  }

  DeleteProductCategory(id: string): Observable<any> {
    return this.http.delete<any>(
      `${ApiUrls.baseUrl}${ApiUrls.productCategory.delete(id)}`
    );
  }
}
