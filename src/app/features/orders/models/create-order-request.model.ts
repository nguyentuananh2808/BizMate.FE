export interface CreateOrderRequest {
  OrderDate?: string;
  CustomerType: number;
  CustomerId?: string | null;
  DeliveryAddress: string;
  CustomerPhone: string;
  CustomerName: string;
  Description?: string | null;
  IsDraft: boolean;
  TechnicianId?: string | null;
  TechnicianIds?: string[];
  InstallationDate?: string | null;
  Details: CreateOrderDetailRequest[];
}

export interface CreateOrderDetailRequest {
  ProductId: string;
  Quantity: number;
  SerialNumbers: string[];
}
