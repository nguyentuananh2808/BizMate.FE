import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrls } from '../../../config/api.config';
import {
  GetTechniciansResponse,
  Technician,
} from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianService {
  constructor(private http: HttpClient) {}

  getTechnicians(
    keyword: string = '',
    includeInactive: boolean = false
  ): Observable<GetTechniciansResponse> {
    let params = new HttpParams().set('includeInactive', includeInactive);

    if (keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }

    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.technician.getAll}`, {
        params,
      })
      .pipe(map((response) => this.normalizeTechniciansResponse(response)));
  }

  private normalizeTechniciansResponse(response: unknown): GetTechniciansResponse {
    const source = this.unwrapRecord(response);
    const technicians = this.readArray<Record<string, unknown>>(source, [
      'Technicians',
      'technicians',
      'Items',
      'items',
      'Data',
      'data',
    ]).map((item) => this.normalizeTechnician(item));

    return {
      Success: this.readBoolean(source, ['Success', 'success'], true),
      Message: this.readString(source, ['Message', 'message']),
      Errors: this.readArray<unknown>(source, ['Errors', 'errors']),
      Technicians: technicians,
    };
  }

  private normalizeTechnician(source: Record<string, unknown>): Technician {
    return {
      Id: this.readString(source, ['Id', 'id']),
      Code: this.readString(source, ['Code', 'code']),
      Name: this.readString(source, ['Name', 'name', 'FullName', 'fullName']),
      Phone: this.readString(source, ['Phone', 'phone']),
      ZaloPhone: this.readString(source, ['ZaloPhone', 'zaloPhone']),
      IsActive: this.readBoolean(source, ['IsActive', 'isActive'], true),
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
