import { DealerLevel } from "./dealer-level.model";

export interface DealerLevelSearchResponse {
  TotalCount: number;
  DealerLevels: DealerLevel[];
}
