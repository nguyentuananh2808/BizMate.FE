export interface CreateReceiptDetailRequest {
  productId: string;
  quantity: number;
}

export interface CreateReceiptRequestRequest {
  supplierName?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  description?: string;
  details: CreateReceiptDetailRequest[];
}
