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
  BorrowType: TechnicianBorrowType;
  BorrowTypeName?: string;
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
  BorrowType: TechnicianBorrowType;
  Quantity: number;
}

export enum TechnicianBorrowType {
  Daily = 1,
  Assigned = 2,
  Backpack = Assigned,
  Warranty = 3,
}

export enum TechnicianBorrowRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
}

export interface CreateBorrowRequest {
  TechnicianId: string;
  BorrowType: TechnicianBorrowType;
  NeededDate: string;
  Description?: string | null;
  Items: CreateBorrowRequestItem[];
}

export interface CreateBorrowRequestItem {
  ProductId: string;
  Quantity: number;
}

export interface BorrowRequestItem {
  ProductId: string;
  ProductName: string;
  ProductCode?: string;
  Quantity: number;
}

export interface TechnicianBorrowRequest {
  Id: string;
  Code: string;
  TechnicianId: string;
  TechnicianName: string;
  Phone?: string;
  BorrowType: TechnicianBorrowType;
  BorrowTypeName?: string;
  RequestStatus: TechnicianBorrowRequestStatus;
  RequestStatusName?: string;
  NeededDate: string;
  CreatedDate: string;
  ApprovedAt?: string;
  Description?: string;
  RejectionReason?: string;
  TotalQuantity: number;
  Items: BorrowRequestItem[];
}

export interface GetBorrowRequestsResponse extends ApiResponse {
  Requests: TechnicianBorrowRequest[];
}

export interface UseTechnicianHoldingRequest {
  TechnicianId: string;
  ProductId: string;
  BorrowType: TechnicianBorrowType;
  Quantity: number;
  Note?: string | null;
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
