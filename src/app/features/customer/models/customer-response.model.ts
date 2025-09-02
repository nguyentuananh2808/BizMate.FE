export interface Customer {
  Id: string;
  Code: string;
  Name: string;
  Phone: string;
  Address: string;
  DealerLevelId?: string;
  RowVersion: string;
  Description: string;
  IsActive: boolean;
  CreatedDate: Date;
  UpdatedDate: Date;
}

export interface CustomerResponse {
  Customers: Customer[];
  TotalCount: number;
}
