export interface ProductUpdateRequest {
  Id: string;
  RowVersion: string;
  ProductCategoryId: string;
  Name: string;
  Unit: number;
  ImageUrl?: string;
  SupplierId?: string;
  Description?: string;
  IsActive: boolean;
}
