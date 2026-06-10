import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrls } from '../../../config/api.config';
import {
  SalesByProductReportRow,
  SalesByProductResponse,
} from '../../technician/models/technician.model';

@Injectable({ providedIn: 'root' })
export class SalesReportService {
  constructor(private http: HttpClient) {}

  getSalesByProduct(
    dateFrom: string,
    dateTo: string
  ): Observable<SalesByProductResponse> {
    const params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);

    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.report.salesByProduct}`, {
        params,
      })
      .pipe(map((response) => this.normalizeResponse(response)));
  }

  private normalizeResponse(response: unknown): SalesByProductResponse {
    const source = this.unwrapRecord(response);
    const items = this.readArray<Record<string, unknown>>(source, [
      'Items',
      'items',
      'Data',
      'data',
    ]).map((item) => this.normalizeRow(item));

    return {
      Success: this.readBoolean(source, ['Success', 'success'], true),
      Message: this.readString(source, ['Message', 'message']),
      Errors: this.readArray<unknown>(source, ['Errors', 'errors']),
      Items: items,
    };
  }

  private normalizeRow(source: Record<string, unknown>): SalesByProductReportRow {
    return {
      ProductId: this.readString(source, ['ProductId', 'productId']),
      ProductName: this.readString(source, ['ProductName', 'productName']),
      ProductCode: this.readString(source, ['ProductCode', 'productCode']),
      OrderedQuantity: this.readNumber(source, [
        'OrderedQuantity',
        'orderedQuantity',
      ]),
      UsedBorrowedQuantity: this.readNumber(source, [
        'UsedBorrowedQuantity',
        'usedBorrowedQuantity',
      ]),
      TotalSoldQuantity: this.readNumber(source, [
        'TotalSoldQuantity',
        'totalSoldQuantity',
      ]),
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
