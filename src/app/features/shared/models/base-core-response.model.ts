export interface BaseCoreEntity {
  Id: string;
  Description?: string;
  CreatedDate: Date;
  CreatedBy: string;
  UpdatedDate: Date;
  UpdatedBy: string;
  RowVersion: string;
}

export interface BaseCoreRespone extends BaseCoreEntity {
  Code: string;
  IsActive: boolean;
}
