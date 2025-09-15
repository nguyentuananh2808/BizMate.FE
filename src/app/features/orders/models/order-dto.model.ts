import { BaseCoreRespone } from "../../shared/models/base-core-response.model";
import { StatusDto } from "../../status/models/status-dto.model";

export interface OrderDto extends BaseCoreRespone {
  OrderDate: Date;
  CustomerType: number;
  CustomerId: string;
  CustomerName: string;
  CustomerPhone: string;
  DeliveryAddress: string;
  TotalAmount: number;
  StatusId: string;
  Statuses:StatusDto;
  OrderDetailDtos: OrderDetailDto[];
}

export interface OrderDetailDto {
  OrderId: string;
  ProductId: string;
  ProductName: string;
  ProductCode: string;
  Unit: number;
  Quantity: number;
  UnitPrice: number;
  Total: number;
}
