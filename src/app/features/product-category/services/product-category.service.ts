import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductCategoryResponse } from '../models/product-category-response.model';

@Injectable({ providedIn: 'root' })
export class ProductCategoryService {
  private apiUrl = 'https://localhost:44349/v1/product-category';

  constructor(private http: HttpClient) {}

  GetAll(): Observable<ProductCategoryResponse> {
    return this.http.get<ProductCategoryResponse>(`${this.apiUrl}/GetAll`);
  }
}
