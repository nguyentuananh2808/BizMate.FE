export interface CreateProductCategoryRequest {
  name: string;
  description: string;
  categoryGroupId?: string | null;
}
