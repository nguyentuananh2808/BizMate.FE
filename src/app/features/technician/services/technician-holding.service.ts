import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrls } from '../../../config/api.config';
import {
  CreateBorrowRequest,
  GetBorrowRequestsResponse,
  GetHoldingsResponse,
  ReturnHoldingRequest,
  TechnicianBorrowRequest,
  TechnicianBorrowRequestStatus,
  TechnicianBorrowType,
  TechnicianHoldingGroup,
  TechnicianHoldingItem,
  UseTechnicianHoldingRequest,
} from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianHoldingService {
  constructor(private http: HttpClient) {}

  getHoldings(technicianId?: string): Observable<GetHoldingsResponse> {
    const params = technicianId
      ? new HttpParams().set('technicianId', technicianId)
      : undefined;

    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.technicianHolding.getAll}`, {
        params,
      })
      .pipe(map((response) => this.normalizeHoldingsResponse(response)));
  }

  getOverdue(): Observable<GetHoldingsResponse> {
    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.technicianHolding.overdue}`)
      .pipe(map((response) => this.normalizeHoldingsResponse(response)));
  }

  returnItems(body: ReturnHoldingRequest): Observable<unknown> {
    return this.http.post(
      `${ApiUrls.baseUrl}${ApiUrls.technicianHolding.return}`,
      body
    );
  }

  getBorrowRequests(
    status?: TechnicianBorrowRequestStatus,
    technicianId?: string
  ): Observable<GetBorrowRequestsResponse> {
    let params = new HttpParams();

    if (status) params = params.set('status', status);
    if (technicianId) params = params.set('technicianId', technicianId);

    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.technicianHolding.requests}`, {
        params,
      })
      .pipe(map((response) => this.normalizeBorrowRequestsResponse(response)));
  }

  createBorrowRequest(body: CreateBorrowRequest): Observable<unknown> {
    return this.http.post(
      `${ApiUrls.baseUrl}${ApiUrls.technicianHolding.requests}`,
      body
    );
  }

  approveBorrowRequest(id: string): Observable<unknown> {
    return this.http.post(
      `${ApiUrls.baseUrl}${ApiUrls.technicianHolding.approveRequest(id)}`,
      {}
    );
  }

  rejectBorrowRequest(id: string, reason?: string): Observable<unknown> {
    return this.http.post(
      `${ApiUrls.baseUrl}${ApiUrls.technicianHolding.rejectRequest(id)}`,
      { Reason: reason || null }
    );
  }

  useHolding(body: UseTechnicianHoldingRequest): Observable<unknown> {
    return this.http.post(
      `${ApiUrls.baseUrl}${ApiUrls.technicianHolding.use}`,
      body
    );
  }

  private normalizeHoldingsResponse(response: unknown): GetHoldingsResponse {
    const source = this.unwrapRecord(response);
    const technicians = this.readArray<Record<string, unknown>>(source, [
      'Technicians',
      'technicians',
      'Items',
      'items',
      'Data',
      'data',
    ]).map((group) => this.normalizeGroup(group));

    return {
      Success: this.readBoolean(source, ['Success', 'success'], true),
      Message: this.readString(source, ['Message', 'message']),
      Errors: this.readArray<unknown>(source, ['Errors', 'errors']),
      Technicians: technicians,
    };
  }

  private normalizeGroup(source: Record<string, unknown>): TechnicianHoldingGroup {
    return {
      TechnicianId: this.readString(source, ['TechnicianId', 'technicianId']),
      TechnicianName: this.readString(source, [
        'TechnicianName',
        'technicianName',
        'Name',
        'name',
      ]),
      Phone: this.readString(source, ['Phone', 'phone']),
      ZaloPhone: this.readString(source, ['ZaloPhone', 'zaloPhone']),
      TotalQuantity: this.readNumber(source, ['TotalQuantity', 'totalQuantity']),
      Items: this.readArray<Record<string, unknown>>(source, [
        'Items',
        'items',
      ]).map((item) => this.normalizeItem(item)),
    };
  }

  private normalizeItem(source: Record<string, unknown>): TechnicianHoldingItem {
    return {
      ProductId: this.readString(source, ['ProductId', 'productId']),
      ProductName: this.readString(source, ['ProductName', 'productName']),
      ProductCode: this.readString(source, ['ProductCode', 'productCode']),
      BorrowType: this.readNumber(source, ['BorrowType', 'borrowType']) as TechnicianBorrowType,
      BorrowTypeName: this.readString(source, ['BorrowTypeName', 'borrowTypeName']),
      Quantity: this.readNumber(source, ['Quantity', 'quantity']),
      LastBorrowedAt: this.readString(source, [
        'LastBorrowedAt',
        'lastBorrowedAt',
      ]),
      IsOverdue: this.readBoolean(source, ['IsOverdue', 'isOverdue'], false),
      ReminderMessage: this.readString(source, [
        'ReminderMessage',
        'reminderMessage',
      ]),
    };
  }

  private normalizeBorrowRequestsResponse(
    response: unknown
  ): GetBorrowRequestsResponse {
    const source = this.unwrapRecord(response);
    const requests = this.readArray<Record<string, unknown>>(source, [
      'Requests',
      'requests',
      'Items',
      'items',
      'Data',
      'data',
    ]).map((item) => this.normalizeBorrowRequest(item));

    return {
      Success: this.readBoolean(source, ['Success', 'success'], true),
      Message: this.readString(source, ['Message', 'message']),
      Errors: this.readArray<unknown>(source, ['Errors', 'errors']),
      Requests: requests,
    };
  }

  private normalizeBorrowRequest(
    source: Record<string, unknown>
  ): TechnicianBorrowRequest {
    return {
      Id: this.readString(source, ['Id', 'id']),
      Code: this.readString(source, ['Code', 'code']),
      TechnicianId: this.readString(source, ['TechnicianId', 'technicianId']),
      TechnicianName: this.readString(source, [
        'TechnicianName',
        'technicianName',
      ]),
      Phone: this.readString(source, ['Phone', 'phone']),
      BorrowType: this.readNumber(source, [
        'BorrowType',
        'borrowType',
      ]) as TechnicianBorrowType,
      BorrowTypeName: this.readString(source, [
        'BorrowTypeName',
        'borrowTypeName',
      ]),
      RequestStatus: this.readNumber(source, [
        'RequestStatus',
        'requestStatus',
      ]) as TechnicianBorrowRequestStatus,
      RequestStatusName: this.readString(source, [
        'RequestStatusName',
        'requestStatusName',
      ]),
      NeededDate: this.readString(source, ['NeededDate', 'neededDate']),
      CreatedDate: this.readString(source, ['CreatedDate', 'createdDate']),
      ApprovedAt: this.readString(source, ['ApprovedAt', 'approvedAt']),
      Description: this.readString(source, ['Description', 'description']),
      RejectionReason: this.readString(source, [
        'RejectionReason',
        'rejectionReason',
      ]),
      TotalQuantity: this.readNumber(source, ['TotalQuantity', 'totalQuantity']),
      Items: this.readArray<Record<string, unknown>>(source, [
        'Items',
        'items',
      ]).map((item) => ({
        ProductId: this.readString(item, ['ProductId', 'productId']),
        ProductName: this.readString(item, ['ProductName', 'productName']),
        ProductCode: this.readString(item, ['ProductCode', 'productCode']),
        Quantity: this.readNumber(item, ['Quantity', 'quantity']),
      })),
    };
  }

  private unwrapRecord(response: unknown): Record<string, unknown> {
    if (!this.isRecord(response)) return {};

    for (const key of ['Data', 'data', 'Result', 'result', 'Value', 'value']) {
      const value = response[key];
      if (this.isRecord(value)) return value;
    }

    return response;
  }

  private readArray<T>(source: Record<string, unknown>, keys: string[]): T[] {
    for (const key of keys) {
      const value = source[key];
      if (Array.isArray(value)) return value as T[];
    }

    return [];
  }

  private readString(source: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string') return value;
    }

    return '';
  }

  private readNumber(source: Record<string, unknown>, keys: string[]): number {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'number') return value;
    }

    return 0;
  }

  private readBoolean(
    source: Record<string, unknown>,
    keys: string[],
    fallback: boolean
  ): boolean {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'boolean') return value;
    }

    return fallback;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
