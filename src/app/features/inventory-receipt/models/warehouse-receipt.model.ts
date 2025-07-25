import { BaseCoreRespone } from '../../shared/models/base-core-response.model';

export interface WarehouseReceipt extends BaseCoreRespone {
  Id: string;
  Date: Date;
  Type: number;
  Description: string;
  CreatedDate: Date;
  UpdatedDate: Date;
  SupplierName: string;
}
