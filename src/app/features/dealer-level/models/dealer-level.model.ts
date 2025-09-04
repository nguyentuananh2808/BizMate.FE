import { BaseCoreRespone } from '../../shared/models/base-core-response.model';

export interface DealerLevel extends BaseCoreRespone {
  Name: string;
}

export interface DealerLevelResponse {
  DealerLevels: DealerLevel[];
  Total: number;
}
