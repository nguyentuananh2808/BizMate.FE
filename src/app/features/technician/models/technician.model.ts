export interface ApiResponse {
  Success: boolean;
  Message?: string;
  Errors?: unknown[];
}

export interface Technician {
  Id: string;
  Code: string;
  Name: string;
  Phone?: string;
  ZaloPhone?: string;
  IsActive: boolean;
}

export interface GetTechniciansResponse extends ApiResponse {
  Technicians: Technician[];
}

export interface SaveTechnicianRequest {
  Name: string;
  Phone?: string | null;
  ZaloPhone?: string | null;
  IsActive: boolean;
}

export interface TechnicianHoldingGroup {
  TechnicianId: string;
  TechnicianName: string;
  Phone?: string;
  ZaloPhone?: string;
  TotalQuantity: number;
  Items: TechnicianHoldingItem[];
}

export interface TechnicianHoldingItem {
  ProductId: string;
  ProductName: string;
  ProductCode?: string;
  Quantity: number;
  LastBorrowedAt: string;
  IsOverdue: boolean;
  ReminderMessage?: string;
}

export interface GetHoldingsResponse extends ApiResponse {
  Technicians: TechnicianHoldingGroup[];
}

export interface ReturnHoldingRequest {
  TechnicianId: string;
  Items: ReturnHoldingItem[];
}

export interface ReturnHoldingItem {
  ProductId: string;
  Quantity: number;
}

export interface SalesByProductReportRow {
  ProductId: string;
  ProductName: string;
  ProductCode?: string;
  OrderedQuantity: number;
  UsedBorrowedQuantity: number;
  TotalSoldQuantity: number;
}

export interface SalesByProductResponse extends ApiResponse {
  Items: SalesByProductReportRow[];
}
