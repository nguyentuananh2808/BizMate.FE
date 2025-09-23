import { BaseCoreRespone } from '../../shared/models/base-core-response.model';
import { StatusDto } from '../../status/models/status-dto.model';

export interface GetOrderResponse {
  Order: OrderWrapper;
}

export interface OrderWrapper {
  Order: OrderDto;
  Success: boolean;
}
export interface OrderDto extends BaseCoreRespone {
  OrderDate: Date;
  CustomerType: number;
  CustomerId: string;
  CustomerName: string;
  CustomerPhone: string;
  DeliveryAddress: string;
  TotalAmount: number;
  StatusId: string;
  StatusName: string;
  Status: StatusDto;
  Details: OrderDetailDto[];
}

export interface OrderDetailDto {
  OrderId: string;
  ProductId: string;
  ProductName: string;
  ProductCode: string;
  Unit: number;
  Quantity: number;
  UnitPrice: number;
  Available: number;
  Total: number;
}
