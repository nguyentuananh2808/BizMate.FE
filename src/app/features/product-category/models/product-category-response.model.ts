export interface ProductCategory {
  Id: string;
  Code: string;
  Name: string;
  RowVersion: string;
  Description: string;
  IsActive: boolean;
  CreatedDate: Date;
  UpdatedDate: Date;
}



export interface ProductCategoryResponse {
  ProductCategories: ProductCategory[];
  TotalCount: number;
}
