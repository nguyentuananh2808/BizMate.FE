export interface ProductCategory {
  Id: string;
  Code: string;
  Name: string;
  RowVersion: string;
  Description: string;
  CategoryGroupId?: string | null;
  CategoryGroupName?: string | null;
  IsActive: boolean;
  CreatedDate: Date;
  UpdatedDate: Date;
}



export interface ProductCategoryResponse {
  ProductCategories: ProductCategory[];
  TotalCount: number;
}
