import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiUrls } from '../../../../config/api.config';
import {
  InventoryOverview,
  InventoryOverviewCategoryGroup,
  InventoryOverviewProduct,
  InventoryOverviewProductCategory,
  InventoryOverviewQuery,
  InventoryOverviewResponse,
} from '../models/inventory-overview.model';

@Injectable({ providedIn: 'root' })
export class InventoryOverviewService {
  constructor(private http: HttpClient) {}

  getOverview(query: InventoryOverviewQuery): Observable<InventoryOverviewResponse> {
    let params = new HttpParams();

    if (query.categoryGroupId) {
      params = params.set('categoryGroupId', query.categoryGroupId);
    }

    const keyword = query.keyword?.trim();
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    if (query.includeInactive) {
      params = params.set('includeInactive', 'true');
    }

    return this.http
      .get<any>(`${ApiUrls.baseUrl}${ApiUrls.inventory.overview}`, { params })
      .pipe(map((res) => this.normalizeResponse(res)));
  }

  private normalizeResponse(res: any): InventoryOverviewResponse {
    const overview = res?.Overview ?? res?.overview ?? null;

    return {
      Overview: overview ? this.normalizeOverview(overview) : null,
      Success: res?.Success ?? res?.success,
      Message: res?.Message ?? res?.message,
    };
  }

  private normalizeOverview(value: any): InventoryOverview {
    const groups = value?.CategoryGroups ?? value?.categoryGroups ?? [];

    return {
      TotalProducts: value?.TotalProducts ?? value?.totalProducts ?? 0,
      TotalStockQuantity: value?.TotalStockQuantity ?? value?.totalStockQuantity ?? 0,
      TotalReservedQuantity: value?.TotalReservedQuantity ?? value?.totalReservedQuantity ?? 0,
      TotalAvailableQuantity: value?.TotalAvailableQuantity ?? value?.totalAvailableQuantity ?? 0,
      OutOfStockProductCount:
        value?.OutOfStockProductCount ?? value?.outOfStockProductCount ?? 0,
      CategoryGroups: groups.map((group: any) => this.normalizeGroup(group)),
    };
  }

  private normalizeGroup(value: any): InventoryOverviewCategoryGroup {
    const categories = value?.Categories ?? value?.categories ?? [];

    return {
      CategoryGroupKey: value?.CategoryGroupKey ?? value?.categoryGroupKey ?? '',
      CategoryGroupId: value?.CategoryGroupId ?? value?.categoryGroupId ?? null,
      CategoryGroupName: value?.CategoryGroupName ?? value?.categoryGroupName ?? '',
      CreatedDate: value?.CreatedDate ?? value?.createdDate ?? null,
      ProductCount: value?.ProductCount ?? value?.productCount ?? 0,
      TotalStockQuantity: value?.TotalStockQuantity ?? value?.totalStockQuantity ?? 0,
      TotalReservedQuantity: value?.TotalReservedQuantity ?? value?.totalReservedQuantity ?? 0,
      TotalAvailableQuantity:
        value?.TotalAvailableQuantity ?? value?.totalAvailableQuantity ?? 0,
      OutOfStockProductCount:
        value?.OutOfStockProductCount ?? value?.outOfStockProductCount ?? 0,
      Categories: categories.map((category: any) => this.normalizeCategory(category)),
    };
  }

  private normalizeCategory(value: any): InventoryOverviewProductCategory {
    const products = value?.Products ?? value?.products ?? [];

    return {
      CategoryKey: value?.CategoryKey ?? value?.categoryKey ?? '',
      ProductCategoryId: value?.ProductCategoryId ?? value?.productCategoryId ?? null,
      ProductCategoryName: value?.ProductCategoryName ?? value?.productCategoryName ?? '',
      CategoryGroupId: value?.CategoryGroupId ?? value?.categoryGroupId ?? null,
      CategoryGroupName: value?.CategoryGroupName ?? value?.categoryGroupName ?? '',
      CreatedDate: value?.CreatedDate ?? value?.createdDate ?? null,
      ProductCount: value?.ProductCount ?? value?.productCount ?? 0,
      TotalStockQuantity: value?.TotalStockQuantity ?? value?.totalStockQuantity ?? 0,
      TotalReservedQuantity: value?.TotalReservedQuantity ?? value?.totalReservedQuantity ?? 0,
      TotalAvailableQuantity:
        value?.TotalAvailableQuantity ?? value?.totalAvailableQuantity ?? 0,
      OutOfStockProductCount:
        value?.OutOfStockProductCount ?? value?.outOfStockProductCount ?? 0,
      Products: products.map((product: any) => this.normalizeProduct(product)),
    };
  }

  private normalizeProduct(value: any): InventoryOverviewProduct {
    return {
      ProductId: value?.ProductId ?? value?.productId ?? '',
      ProductCode: value?.ProductCode ?? value?.productCode ?? '',
      ProductName: value?.ProductName ?? value?.productName ?? '',
      Unit: value?.Unit ?? value?.unit ?? 0,
      UnitName: value?.UnitName ?? value?.unitName ?? '',
      ProductCategoryId: value?.ProductCategoryId ?? value?.productCategoryId ?? null,
      ProductCategoryName: value?.ProductCategoryName ?? value?.productCategoryName ?? '',
      CategoryGroupId: value?.CategoryGroupId ?? value?.categoryGroupId ?? null,
      CategoryGroupName: value?.CategoryGroupName ?? value?.categoryGroupName ?? null,
      IsSerialTracked: value?.IsSerialTracked ?? value?.isSerialTracked ?? false,
      StockQuantity: value?.StockQuantity ?? value?.stockQuantity ?? 0,
      ReservedQuantity: value?.ReservedQuantity ?? value?.reservedQuantity ?? 0,
      AvailableQuantity: value?.AvailableQuantity ?? value?.availableQuantity ?? 0,
      StockStatus: value?.StockStatus ?? value?.stockStatus ?? 'IN_STOCK',
      UpdatedDate: value?.UpdatedDate ?? value?.updatedDate ?? null,
    };
  }
}
