export interface CreateOrderRequest {
  CustomerType: number;
  CustomerId?: string;
  DeliveryAddress: string;
  CustomerPhone: string;
  CustomerName: string;
  Description: string;
  TotalAmount: number;
  IsDraft: boolean;
  Details: CreateOrderDetailRequest[];
}

export interface CreateOrderDetailRequest {
  ProductId: string;
  Quantity: number;
  UnitPrice: number;
}
