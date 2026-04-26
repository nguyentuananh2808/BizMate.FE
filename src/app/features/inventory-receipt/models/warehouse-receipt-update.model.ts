export interface UpdateReceiptDetailRequest {
  productId: string;
  quantity: number;
  serialNumbers?: string[];
}

export interface UpdateReceiptRequestRequest {
  id: string;
  supplierName: string;
  deliveryAddress?: string;
  IsDraft: boolean;
  IsCancelled: boolean;
  description?: string;
  rowVersion: string;
  Details: UpdateReceiptDetailRequest[];
}
