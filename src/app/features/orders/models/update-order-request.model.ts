export interface UpdateOrderRequest {
  Id: string;
  RowVersion: string;
  CustomerType: number;
  DeliveryAddress: string;
  CustomerId?: string | null;
  CustomerPhone: string;
  CustomerName: string;
  Description?: string | null;
  StatusId: string;
  TechnicianId?: string | null;
  TechnicianIds?: string[];
  InstallationDate?: string | null;
  Details: UpdateOrderDetailRequest[];
}

export interface UpdateOrderDetailRequest {
  ProductId: string;
  Quantity: number;
  SerialNumbers: string[];
}
