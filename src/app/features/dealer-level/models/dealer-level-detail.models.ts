import { BaseCoreRespone } from '../../shared/models/base-core-response.model';
export interface DealerLevelReadByIdWrapper {
  DealerLevel: DealerLevelReadById;
}

export interface DealerLevelReadById extends BaseCoreRespone {
  Id: string;
  Name: string;
  CreatedDate: Date;
  UpdatedDate: Date;
  RowVersion: string;
  DealerPriceForDealerLevel: DealerPriceDetail[];
}
export interface DealerPriceDetail {
  Id: string;
  ProductId: string;
  DealerPriceId: string;
  ProductName: string;
  ProductUnit: number;
  ProductCode: string;
  Price: number;
  RowVersionDealerPrice: string;
}
