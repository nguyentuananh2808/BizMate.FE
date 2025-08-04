import { SearchRequest } from '../../shared/models/search-request.model';

export interface SearchWarehouseRequest extends SearchRequest {
  type: number;
  dateFrom?: Date;
  dateTo?: Date;
  statusCode?: Date;
}
