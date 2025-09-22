import { BaseCoreRespone } from '../../shared/models/base-core-response.model';

export interface WarehouseReceipt extends BaseCoreRespone {
  Id: string;
  SupplierName?: string;
  DeliveryAddress: string;
  StatusName: string;
  StatusCode?: string;
  StatusId?: string;
  CustomerPhone?: string;
  CustomerName?: string;
}
