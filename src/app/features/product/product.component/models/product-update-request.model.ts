export interface ProductUpdateRequest {
  Id: string;
  RowVersion: number;
  ProductCategoryId: string;
  Name: string;
  Unit: number;
  ImageUrl?: string;
  SupplierId?: string;
  Description?: string;
  IsActive: boolean;
}
