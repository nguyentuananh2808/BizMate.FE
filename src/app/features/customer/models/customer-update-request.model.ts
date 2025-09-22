export interface CustomerUpdateRequest {
  Id: string;
  Code: string;
  Name: string;
  Phone: string;
  Address: string;
  RowVersion: string;
  IsActive: boolean;
  DealerLevelId?: string | undefined;
}
