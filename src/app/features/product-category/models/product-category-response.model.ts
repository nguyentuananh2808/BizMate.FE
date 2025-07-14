export interface ProductCategory {
  Id: string;
  ProductCategoryCode: string;
  Name: string;
  RowVersion:number;
  Description: string;
}

export interface ProductCategoryResponse {
  ProductCategories: ProductCategory[];
  TotalCount: number;
}
