import { OrderDto } from './order-dto.model';

export interface GetOrdersResponse {
  Orders: OrderDto[];
  TotalCount: number;
}
