export interface StatusDto {
  Id: string;
  Name: string;
  Group: string;
  Description: string;
}

export interface SearchStatusResponse {
  Statuses: StatusDto[];
}
