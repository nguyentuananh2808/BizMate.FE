export interface BaseCoreEntity {
  Id: string;
  Description?: string;
  CreatedDate: Date | null;
  CreatedBy: string;
  UpdatedDate: Date | null;
  UpdatedBy: string;
  RowVersion: string;
}

export interface BaseCoreRespone extends BaseCoreEntity {
  Code: string;
  IsActive: boolean;
}
