export interface Product {
  Id: string;
  Code: string;
  Name: string;
  Quantity: number;
  Unit: number;
  ImageUrl: string;
  SupplierId: string;
  SupplierName: string;
  ProductCategoryId: string;
  ProductCategoryName: string;
  RowVersion: number;
  Description: string;
  IsActive: boolean;
  CreatedDate: Date;
  UpdatedDate: Date;
}

export interface ProductResponse {
  Products: Product[];
  TotalCount: number;
}
