import { SearchRequest } from '../../shared/models/search-request.model';

export interface SearchOrderRequest extends SearchRequest {
  dateFrom?: Date;
  dateTo?: Date;
  statusIds?: string[];
}
