import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrls } from '../../../config/api.config';
import {
  CreateStoreUserRequest,
  StoreUserItem,
  UserMutationResponse,
  UserSearchRequest,
  UserSearchResponse,
} from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  constructor(private http: HttpClient) {}

  searchUsers(body: UserSearchRequest): Observable<UserSearchResponse> {
    return this.http
      .post<unknown>(`${ApiUrls.baseUrl}${ApiUrls.user.search}`, body)
      .pipe(map((response) => this.normalizeSearchResponse(response)));
  }

  createUser(body: CreateStoreUserRequest): Observable<UserMutationResponse> {
    return this.http.post<UserMutationResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.user.create}`,
      body
    );
  }

  private normalizeSearchResponse(response: unknown): UserSearchResponse {
    const source = this.unwrapRecord(response);
    const users = this.readArray<Record<string, unknown>>(source, [
      'Users',
      'users',
      'Data',
      'data',
      'Items',
      'items',
    ]).map((user) => this.normalizeUser(user));

    return {
      Users: users,
      TotalCount: this.readNumber(source, ['TotalCount', 'totalCount']) || users.length,
    };
  }

  private normalizeUser(user: Record<string, unknown>): StoreUserItem {
    return {
      Id: this.readString(user, ['Id', 'id']),
      Code: this.readString(user, ['Code', 'code']),
      FullName: this.readString(user, ['FullName', 'fullName', 'Name', 'name']),
      Email: this.readString(user, ['Email', 'email']),
      Role: this.readString(user, ['Role', 'role']),
      StoreId: this.readString(user, ['StoreId', 'storeId']),
      StoreName: this.readString(user, ['StoreName', 'storeName']),
      IsActive: this.readBoolean(user, ['IsActive', 'isActive']),
      CreatedDate: this.readString(user, ['CreatedDate', 'createdDate']),
      RoleCount: this.readNumber(user, ['RoleCount', 'roleCount']),
      DirectPermissionCount: this.readNumber(user, [
        'DirectPermissionCount',
        'directPermissionCount',
      ]),
    };
  }

  private unwrapRecord(response: unknown): Record<string, unknown> {
    if (!this.isRecord(response)) return {};

    for (const key of ['Data', 'data', 'Result', 'result', 'Value', 'value']) {
      const candidate = response[key];
      if (this.isRecord(candidate)) return candidate;
    }

    return response;
  }

  private readArray<T>(source: Record<string, unknown>, keys: string[]): T[] {
    for (const key of keys) {
      const value = source[key];
      if (Array.isArray(value)) return value as T[];
      if (this.isRecord(value)) {
        const nestedItems = this.readArray<T>(value, keys);
        if (nestedItems.length > 0) return nestedItems;
      }
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

  private readBoolean(source: Record<string, unknown>, keys: string[]): boolean {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'boolean') return value;
    }

    return false;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
