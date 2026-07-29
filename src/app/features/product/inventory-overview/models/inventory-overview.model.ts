export interface InventoryOverviewQuery {
  categoryGroupId?: string | null;
  keyword?: string | null;
  includeInactive?: boolean;
}

export interface InventoryOverviewResponse {
  Overview: InventoryOverview | null;
  Success?: boolean;
  Message?: string;
}

export interface InventoryOverview {
  TotalProducts: number;
  TotalStockQuantity: number;
  TotalReservedQuantity: number;
  TotalAvailableQuantity: number;
  OutOfStockProductCount: number;
  CategoryGroups: InventoryOverviewCategoryGroup[];
}

export interface InventoryOverviewCategoryGroup {
  CategoryGroupKey: string;
  CategoryGroupId?: string | null;
  CategoryGroupName: string;
  CreatedDate?: Date | string | null;
  ProductCount: number;
  TotalStockQuantity: number;
  TotalReservedQuantity: number;
  TotalAvailableQuantity: number;
  OutOfStockProductCount: number;
  Categories: InventoryOverviewProductCategory[];
}

export interface InventoryOverviewProductCategory {
  CategoryKey: string;
  ProductCategoryId?: string | null;
  ProductCategoryName: string;
  CategoryGroupId?: string | null;
  CategoryGroupName: string;
  CreatedDate?: Date | string | null;
  ProductCount: number;
  TotalStockQuantity: number;
  TotalReservedQuantity: number;
  TotalAvailableQuantity: number;
  OutOfStockProductCount: number;
  Products: InventoryOverviewProduct[];
}

export interface InventoryOverviewProduct {
  ProductId: string;
  ProductCode: string;
  ProductName: string;
  Unit: number;
  UnitName: string;
  ProductCategoryId?: string | null;
  ProductCategoryName: string;
  CategoryGroupId?: string | null;
  CategoryGroupName?: string | null;
  IsSerialTracked: boolean;
  StockQuantity: number;
  ReservedQuantity: number;
  AvailableQuantity: number;
  StockStatus: 'OUT_OF_STOCK' | 'IN_STOCK' | string;
  UpdatedDate?: Date | string | null;
}
