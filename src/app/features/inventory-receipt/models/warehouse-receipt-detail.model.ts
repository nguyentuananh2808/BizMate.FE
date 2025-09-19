import { BaseCoreRespone } from '../../shared/models/base-core-response.model';

export interface InventoryReadById {
    ImportReceipt: {
    ImportReceipt: ImportReceipt; 
    Success: boolean;
  };
}
export interface ImportReceipt extends BaseCoreRespone {
  SupplierName: string;
  DeliveryAddress: string;
  Description: string;
  StatusName:string;
  RowVersion: string;
  Details: InventoryDetail[];
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
