export interface UpdateReceiptDetailRequest {
  productId: string;
  quantity: number;
}

export interface UpdateReceiptRequestRequest {
  id: string;
  type: number;
  supplierName: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  description?: string;
  rowVersion: string;
  details: UpdateReceiptDetailRequest[];
}
