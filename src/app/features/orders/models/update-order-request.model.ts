export interface UpdateOrderRequest {
  Id: string;
  RowVersion: string;
  CustomerType: number;
  DeliveryAddress: string;
  CustomerId: string;
  CustomerPhone: string;
  CustomerName: string;
  Description: string;
  StatusId: string;
  Details: UpdateOrderDetailRequest[];
}

export interface UpdateOrderDetailRequest {
  ProductId: string;
  Quantity: number;
}
