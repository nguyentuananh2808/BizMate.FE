export interface ProductCategoryUpdateRequest {
  Id: string;
  Code: string;
  Name: string;
  RowVersion: string;
  Description: string;
  CategoryGroupId?: string | null;
  IsActive: boolean;
}
