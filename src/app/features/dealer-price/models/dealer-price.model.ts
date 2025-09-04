import { DealerLevel } from './../../dealer-level/models/dealer-level.model';
import { Product } from './../../product/product.component/models/product-response.model';

export interface DealerPrice {
  Id: string;
  ProductId: string;
  Product: Product;
  DealerLevelId: string;
  DealerLevel: DealerLevel;
  Price: number;
}
