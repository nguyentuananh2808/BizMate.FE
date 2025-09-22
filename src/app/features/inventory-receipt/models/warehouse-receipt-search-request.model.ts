import { SearchRequest } from '../../shared/models/search-request.model';

export interface SearchWarehouseRequest extends SearchRequest {
  dateFrom?: Date;
  dateTo?: Date;
  statusIds?: string[];
}
