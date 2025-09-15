export interface ProductCreateRequest {
  name: string;
  unit: number;
  productCategoryId: string;
  salePrice: number;
  imageUrl: string;
  description: string;
}
