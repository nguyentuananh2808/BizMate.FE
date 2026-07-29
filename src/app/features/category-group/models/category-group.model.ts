import { ProductCategory } from '../../product-category/models/product-category-response.model';

export interface CategoryGroup {
  Id: string;
  Code: string;
  Name: string;
  RowVersion: string;
  Description: string;
  IsActive: boolean;
  CreatedDate: Date;
  UpdatedDate: Date;
  ProductCategoryCount: number;
  ProductCategoryIds: string[];
  ProductCategories: ProductCategory[];
}

export interface CategoryGroupSearchRequest {
  keySearch?: string | null;
  pageIndex: number;
  pageSize: number;
  isActive?: boolean | null;
}

export interface CategoryGroupSearchResponse {
  CategoryGroups: CategoryGroup[];
  TotalCount: number;
  Success?: boolean;
  Message?: string;
}

export interface CategoryGroupDetailResponse {
  CategoryGroup: CategoryGroup;
  Success?: boolean;
  Message?: string;
}

export interface CategoryGroupMutationResponse {
  CategoryGroup?: CategoryGroup;
  Success: boolean;
  Message?: string;
}

export interface CategoryGroupSaveRequest {
  Id?: string;
  RowVersion?: string;
  Name: string;
  Description?: string;
  IsActive?: boolean;
  ProductCategoryIds: string[];
}
