export interface UpdateOrderRequest {
  Id: string;
  RowVersion: string;
  CustomerType: number;
  CustomerId: string;
  DeliveryAddress: string;
  CustomerPhone: string;
  CustomerName: string;
  Description: string;
  TotalAmount: number;
  StatusId: string;
  Details: UpdateOrderDetailRequest[];
}

export interface UpdateOrderDetailRequest {
  ProductId: string;
  Quantity: number;
  UnitPrice: number;
}
