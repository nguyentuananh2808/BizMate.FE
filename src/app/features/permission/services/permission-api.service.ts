import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrls } from '../../../config/api.config';
import { PermissionGroup } from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class PermissionApiService {
  constructor(private http: HttpClient) {}

  getPermissionGroups(): Observable<PermissionGroup[]> {
    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.permission.getAll}`)
      .pipe(map((response) => this.normalizePermissionGroups(response)));
  }

  private normalizePermissionGroups(response: unknown): PermissionGroup[] {
    const groups = this.readArray<Record<string, unknown>>(response, [
      'data',
      'Data',
      'items',
      'Items',
      'permissions',
      'Permissions',
      'groups',
      'Groups',
      'result',
      'Result',
      'value',
      'Value',
    ]);

    if (groups.length > 0) {
      return groups
        .map((group) => this.normalizeGroup(group))
        .filter((group) => group.group && group.permissions.length > 0);
    }

    const groupedRecord = this.readRecord(response, [
      'data',
      'Data',
      'result',
      'Result',
      'value',
      'Value',
    ]) ?? response;

    if (this.isRecord(groupedRecord)) {
      return Object.entries(groupedRecord)
        .filter(([, value]) => Array.isArray(value))
        .map(([group, permissions]) =>
          this.normalizeGroup({ group, permissions })
        )
        .filter((group) => group.group && group.permissions.length > 0);
    }

    return [];
  }

  private normalizeGroup(group: Record<string, unknown>): PermissionGroup {
    const permissions = this.readArray<Record<string, unknown>>(group, [
      'permissions',
      'Permissions',
      'items',
      'Items',
    ])
      .map((permission) => ({
        id: this.readString(permission, ['id', 'Id', 'permissionId', 'PermissionId']),
        name: this.readString(permission, ['name', 'Name']),
        displayName: this.readString(permission, [
          'displayName',
          'DisplayName',
          'label',
          'Label',
        ]),
      }))
      .filter((permission) => permission.id || permission.name)
      .map((permission) => ({
        ...permission,
        displayName: permission.displayName || permission.name,
      }));

    return {
      group: this.readString(group, ['group', 'Group', 'module', 'Module', 'name', 'Name']),
      permissions,
    };
  }

  private readArray<T>(value: unknown, keys: string[]): T[] {
    if (Array.isArray(value)) return value as T[];
    if (!this.isRecord(value)) return [];

    for (const key of keys) {
      const candidate = value[key];
      if (Array.isArray(candidate)) return candidate as T[];
      if (this.isRecord(candidate)) {
        const nestedItems = this.readArray<T>(candidate, keys);
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

  private readRecord(
    value: unknown,
    keys: string[]
  ): Record<string, unknown> | null {
    if (!this.isRecord(value)) return null;

    for (const key of keys) {
      const candidate = value[key];
      if (this.isRecord(candidate)) return candidate;
    }

    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
