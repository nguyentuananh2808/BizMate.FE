import { SearchRequest } from '../../../shared/models/search-request.model';

export interface ProductSearchRequest extends SearchRequest {
  isActive?: boolean;
  productCategoryId?: string | null;
  categoryGroupId?: string | null;
  stockFilter?: string | null;
  lowStockThreshold?: number | null;
}
