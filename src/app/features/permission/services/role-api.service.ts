import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrls } from '../../../config/api.config';
import {
  PermissionRef,
  RoleMutationRequest,
  UserRoleItem,
} from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class RoleApiService {
  constructor(private http: HttpClient) {}

  getRoles(): Observable<UserRoleItem[]> {
    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.role.getAll}`)
      .pipe(map((response) => this.normalizeRoles(response)));
  }

  getRole(id: string): Observable<UserRoleItem> {
    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.role.getById(id)}`)
      .pipe(map((response) => this.normalizeRole(this.unwrapRecord(response))));
  }

  createRole(body: RoleMutationRequest): Observable<UserRoleItem> {
    return this.http
      .post<unknown>(
        `${ApiUrls.baseUrl}${ApiUrls.role.create}`,
        this.toRoleMutationBody(body)
      )
      .pipe(map((response) => this.normalizeRole(this.unwrapRecord(response))));
  }

  updateRole(id: string, body: RoleMutationRequest): Observable<UserRoleItem> {
    return this.http
      .put<unknown>(
        `${ApiUrls.baseUrl}${ApiUrls.role.update(id)}`,
        this.toRoleMutationBody(body)
      )
      .pipe(map((response) => this.normalizeRole(this.unwrapRecord(response))));
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(
      `${ApiUrls.baseUrl}${ApiUrls.role.delete(id)}`
    );
  }

  private normalizeRoles(response: unknown): UserRoleItem[] {
    return this.readArray<Record<string, unknown>>(response, [
      'roles',
      'Roles',
      'data',
      'Data',
      'items',
      'Items',
      'result',
      'Result',
      'value',
      'Value',
    ])
      .map((role) => this.normalizeRole(role))
      .filter((role) => role.roleId || role.id || role.name);
  }

  private toRoleMutationBody(
    body: RoleMutationRequest
  ): { Name: string; DisplayName: string; PermissionIds: string[] } {
    return {
      Name: body.name,
      DisplayName: body.displayName,
      PermissionIds: body.permissionIds || [],
    };
  }

  private normalizeRole(role: Record<string, unknown>): UserRoleItem {
    const permissions = this.normalizePermissionRefs(role);
    const permissionIds = this.normalizePermissionIds(role, permissions);

    return {
      roleId: this.readString(role, ['roleId', 'RoleId', 'id', 'Id']),
      id: this.readString(role, ['id', 'Id']),
      name: this.readString(role, ['name', 'Name']),
      displayName: this.readString(role, [
        'displayName',
        'DisplayName',
        'name',
        'Name',
      ]),
      isSystem: this.readBoolean(role, ['isSystem', 'IsSystem']),
      permissions,
      permissionIds,
    };
  }

  private normalizePermissionRefs(role: Record<string, unknown>): PermissionRef[] {
    return this.readArray<Record<string, unknown>>(role, [
      'permissions',
      'Permissions',
      'rolePermissions',
      'RolePermissions',
    ])
      .filter((permission) => this.isRecord(permission))
      .map((permission) => this.normalizePermissionRef(permission));
  }

  private normalizePermissionIds(
    role: Record<string, unknown>,
    permissions: PermissionRef[]
  ): string[] {
    const idsFromBody = this.readArray<unknown>(role, [
      'permissionIds',
      'PermissionIds',
    ])
      .filter((id): id is string => typeof id === 'string')
      .filter(Boolean);

    const idsFromPermissions = permissions
      .map((permission) => permission.permissionId)
      .filter(Boolean);

    return Array.from(new Set([...idsFromBody, ...idsFromPermissions]));
  }

  private normalizePermissionRef(permission: Record<string, unknown>): PermissionRef {
    const name = this.readString(permission, ['name', 'Name']);

    return {
      permissionId: this.readString(permission, [
        'permissionId',
        'PermissionId',
        'id',
        'Id',
      ]),
      name,
      displayName:
        this.readString(permission, ['displayName', 'DisplayName']) || name,
      group: this.readString(permission, ['group', 'Group', 'module', 'Module']),
    };
  }

  private unwrapRecord(response: unknown): Record<string, unknown> {
    if (!this.isRecord(response)) return {};

    for (const key of ['data', 'Data', 'result', 'Result', 'value', 'Value']) {
      const candidate = response[key];
      if (this.isRecord(candidate)) return candidate;
    }

    return response;
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
