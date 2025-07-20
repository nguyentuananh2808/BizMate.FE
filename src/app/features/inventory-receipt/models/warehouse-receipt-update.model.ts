export interface WarehouseReceiptUpdateRequest {
  id: string;
  rowVersion: string;
  supplierName?: string;
  deliveryAddress?: string;
  description?: string;
  details: details[];
}

export interface details {
  productId: string;
  quantity: number;
}
