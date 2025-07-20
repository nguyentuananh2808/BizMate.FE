import { WarehouseReceipt } from './warehouse-receipt.model';

export interface WarehouseReceiptSearchResponse {
  TotalCount: number;
  InventoryReceipts: WarehouseReceipt[];
}
