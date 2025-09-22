import { SearchRequest } from "../../shared/models/search-request.model";

export interface CustomerSearchRequest extends SearchRequest {
  isActive?: boolean;
}
