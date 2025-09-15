import { BaseCoreRespone } from '../../shared/models/base-core-response.model';

export interface InventoryReadById extends BaseCoreRespone {
  Id: string;
  Date: Date;
  InventoryCode: string;
  SupplierName: string;
  CustomerName: string;
  DeliveryAddress: string;
  Type: number;
  Description: string;
  CustomerPhone: string;
  CreatedDate: Date;
  UpdatedDate: Date;
  RowVersion: string;
  InventoryDetails: InventoryDetail[];
}
export interface InventoryDetail {
  Id: string;
  InventoryReceiptId: string;
  ProductId: string;
  ProductName: string;
  ProductCode: string;
  Unit: number;
  Quantity: number;
  SalePrice?: number;
  Available?: number;
}
