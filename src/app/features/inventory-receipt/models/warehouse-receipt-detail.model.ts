import { BaseCoreRespone } from '../../shared/models/base-core-response.model';

export interface InventoryReadById extends BaseCoreRespone {
  Id: string;
  Date: Date;
  Type: number;
  Description: string;
  CreatedDate: Date;
  UpdatedDate: Date;
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
}
