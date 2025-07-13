export interface ProductCategory {
  Id: string;
  ProductCategoryCode: string;
  Name: string;
  Description: string;
}

export interface ProductCategoryResponse {
  ProductCategories: ProductCategory[];
  TotalCount: number;
}
