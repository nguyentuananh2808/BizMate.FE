import { CreateProductCategoryRequest } from './../models/product-category-create-request.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductCategoryResponse } from '../models/product-category-response.model';
import { ProductCategory } from '../models/product-category-response.model';

@Injectable({ providedIn: 'root' })
export class ProductCategoryService {
  private apiUrl = 'https://localhost:44349/v1/product-category';

  constructor(private http: HttpClient) {}

  GetAll(): Observable<ProductCategoryResponse> {
    return this.http.get<ProductCategoryResponse>(`${this.apiUrl}/GetAll`);
  }

  UpdateProductCategory(
    Id: string,
    ProductCategoryCode: string,
    Name: string,
    RowVersion: number,
    Description: string
  ): Observable<ProductCategory> {
    const body: ProductCategory = {
      Id,
      ProductCategoryCode,
      Name,
      RowVersion,
      Description,
    };
    return this.http.put<ProductCategory>(`${this.apiUrl}`, body);
  }

  CreateProductCategory(name: string, description: string): Observable<any> {
    const body: CreateProductCategoryRequest = {
      name,
      description,
    };
    return this.http.post<any>(`${this.apiUrl}`, body);
  }

  DeleteProductCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
