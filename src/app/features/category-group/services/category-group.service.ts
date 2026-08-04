import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrls } from '../../../config/api.config';
import {
  CategoryGroup,
  CategoryGroupDetailResponse,
  CategoryGroupMutationResponse,
  CategoryGroupSaveRequest,
  CategoryGroupSearchRequest,
  CategoryGroupSearchResponse,
} from '../models/category-group.model';

@Injectable({ providedIn: 'root' })
export class CategoryGroupService {
  constructor(private http: HttpClient) {}

  search(request: CategoryGroupSearchRequest): Observable<CategoryGroupSearchResponse> {
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.categoryGroup.search}`,
      request
    ).pipe(map((res) => this.normalizeSearchResponse(res)));
  }

  getAll(): Observable<CategoryGroupSearchResponse> {
    return this.http.get<any>(
      `${ApiUrls.baseUrl}${ApiUrls.categoryGroup.getAll}`
    ).pipe(map((res) => this.normalizeSearchResponse(res)));
  }

  getById(id: string): Observable<CategoryGroupDetailResponse> {
    return this.http.get<any>(
      `${ApiUrls.baseUrl}${ApiUrls.categoryGroup.getById(id)}`
    ).pipe(map((res) => this.normalizeDetailResponse(res)));
  }

  create(request: CategoryGroupSaveRequest): Observable<CategoryGroupMutationResponse> {
    return this.http.post<any>(
      `${ApiUrls.baseUrl}${ApiUrls.categoryGroup.create}`,
      {
        Name: request.Name,
        Description: request.Description ?? '',
        ProductCategoryIds: request.ProductCategoryIds,
      }
    ).pipe(map((res) => this.normalizeMutationResponse(res)));
  }

  update(request: CategoryGroupSaveRequest): Observable<CategoryGroupMutationResponse> {
    return this.http.put<any>(
      `${ApiUrls.baseUrl}${ApiUrls.categoryGroup.update}`,
      {
        Id: request.Id,
        RowVersion: request.RowVersion,
        Name: request.Name,
        Description: request.Description ?? '',
        IsActive: request.IsActive ?? false,
        ProductCategoryIds: request.ProductCategoryIds,
      }
    ).pipe(map((res) => this.normalizeMutationResponse(res)));
  }

  delete(id: string): Observable<CategoryGroupMutationResponse> {
    return this.http.delete<any>(
      `${ApiUrls.baseUrl}${ApiUrls.categoryGroup.delete(id)}`
    ).pipe(map((res) => this.normalizeMutationResponse(res)));
  }

  private normalizeSearchResponse(res: any): CategoryGroupSearchResponse {
    const groups = res?.CategoryGroups ?? res?.categoryGroups ?? [];

    return {
      CategoryGroups: groups.map((group: any) => this.normalizeGroup(group)),
      TotalCount: res?.TotalCount ?? res?.totalCount ?? groups.length,
      Success: res?.Success ?? res?.success,
      Message: res?.Message ?? res?.message,
    };
  }

  private normalizeDetailResponse(res: any): CategoryGroupDetailResponse {
    const group = res?.CategoryGroup ?? res?.categoryGroup;

    return {
      CategoryGroup: this.normalizeGroup(group),
      Success: res?.Success ?? res?.success,
      Message: res?.Message ?? res?.message,
    };
  }

  private normalizeMutationResponse(res: any): CategoryGroupMutationResponse {
    const group = res?.CategoryGroup ?? res?.categoryGroup;

    return {
      CategoryGroup: group ? this.normalizeGroup(group) : undefined,
      Success: res?.Success ?? res?.success,
      Message: res?.Message ?? res?.message,
    };
  }

  private normalizeGroup(group: any): CategoryGroup {
    const categories = group?.ProductCategories ?? group?.productCategories ?? [];

    return {
      Id: group?.Id ?? group?.id ?? '',
      Code: group?.Code ?? group?.code ?? '',
      Name: group?.Name ?? group?.name ?? '',
      RowVersion: group?.RowVersion ?? group?.rowVersion ?? '',
      Description: group?.Description ?? group?.description ?? '',
      IsActive: group?.IsActive ?? group?.isActive ?? false,
      CreatedDate: group?.CreatedDate ?? group?.createdDate,
      UpdatedDate: group?.UpdatedDate ?? group?.updatedDate,
      ProductCategoryCount:
        group?.ProductCategoryCount ?? group?.productCategoryCount ?? categories.length,
      ProductCategoryIds: group?.ProductCategoryIds ?? group?.productCategoryIds ?? [],
      ProductCategories: categories.map((category: any) => this.normalizeProductCategory(category)),
    };
  }

  private normalizeProductCategory(category: any): any {
    return {
      ...category,
      Id: category?.Id ?? category?.id,
      Code: category?.Code ?? category?.code,
      Name: category?.Name ?? category?.name,
      RowVersion: category?.RowVersion ?? category?.rowVersion,
      Description: category?.Description ?? category?.description,
      IsActive: category?.IsActive ?? category?.isActive ?? false,
      CategoryGroupId: category?.CategoryGroupId ?? category?.categoryGroupId,
      CategoryGroupName: category?.CategoryGroupName ?? category?.categoryGroupName,
    };
  }
}
