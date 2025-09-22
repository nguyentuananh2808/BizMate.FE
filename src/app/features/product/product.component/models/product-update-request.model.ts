export interface ProductUpdateRequest {
  Id: string;
  RowVersion: string;
  ProductCategoryId: string;
  Name: string;
  Unit: number;
  SalePrice: number;
  ImageUrl?: string;
  SupplierId?: string;
  Description?: string;
  IsActive: boolean;
}
