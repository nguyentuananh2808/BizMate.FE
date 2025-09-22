import { DealerPrice } from './../../dealer-price/models/dealer-price.model';
import { BaseCoreRespone } from '../../shared/models/base-core-response.model';

export interface DealerLevel extends BaseCoreRespone {
  Name: string;
  DealerPrices : DealerPrice[];
}

export interface DealerLevelResponse {
  DealerLevels: DealerLevel[];
  Total: number;
}
