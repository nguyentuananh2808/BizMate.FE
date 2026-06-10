import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrls } from '../../../config/api.config';
import {
  AssignUserRoleRequest,
  PermissionMutationRequest,
  PermissionMutationResponse,
  PermissionRef,
  UserPermissionOverview,
  UserRoleItem,
} from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class UserPermissionApiService {
  constructor(private http: HttpClient) {}

  getUserPermissions(userId: string): Observable<UserPermissionOverview> {
    return this.http
      .get<unknown>(`${ApiUrls.baseUrl}${ApiUrls.userPermission.get(userId)}`)
      .pipe(map((response) => this.normalizeOverview(response, userId)));
  }

  addDirectPermissions(
    userId: string,
    body: PermissionMutationRequest
  ): Observable<PermissionMutationResponse> {
    return this.http
      .post<unknown>(
        `${ApiUrls.baseUrl}${ApiUrls.userPermission.permissions(userId)}`,
        this.toPermissionMutationBody(body)
      )
      .pipe(map((response) => this.normalizeMutationResponse(response)));
  }

  replaceDirectPermissions(
    userId: string,
    body: PermissionMutationRequest
  ): Observable<PermissionMutationResponse> {
    return this.http
      .put<unknown>(
        `${ApiUrls.baseUrl}${ApiUrls.userPermission.permissions(userId)}`,
        this.toPermissionMutationBody(body)
      )
      .pipe(map((response) => this.normalizeMutationResponse(response)));
  }

  removeDirectPermission(userId: string, permissionId: string): Observable<void> {
    return this.http.delete<void>(
      `${ApiUrls.baseUrl}${ApiUrls.userPermission.permission(userId, permissionId)}`
    );
  }

  clearDirectPermissions(userId: string): Observable<void> {
    return this.http.delete<void>(
      `${ApiUrls.baseUrl}${ApiUrls.userPermission.permissions(userId)}`
    );
  }

  assignRole(userId: string, roleId: string): Observable<void> {
    const body: AssignUserRoleRequest = { RoleId: roleId };
    return this.http.post<void>(
      `${ApiUrls.baseUrl}${ApiUrls.userRole.roles(userId)}`,
      body
    );
  }

  removeRole(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(
      `${ApiUrls.baseUrl}${ApiUrls.userRole.role(userId, roleId)}`
    );
  }

  private normalizeOverview(
    response: unknown,
    fallbackUserId: string
  ): UserPermissionOverview {
    const source = this.unwrapRecord(response);
    const roles = this.readArray<Record<string, unknown>>(source, [
      'roles',
      'Roles',
    ]).map((role) => this.normalizeRole(role));

    const directPermissions = this.readArray<Record<string, unknown>>(source, [
      'directPermissions',
      'DirectPermissions',
    ]).map((permission) => this.normalizePermissionRef(permission));

    const rolePermissions = this.readArray<Record<string, unknown>>(source, [
      'rolePermissions',
      'RolePermissions',
    ]).map((permission) => this.normalizePermissionRef(permission));

    const effectivePermissions = this.readArray<Record<string, unknown>>(source, [
      'effectivePermissions',
      'EffectivePermissions',
    ]).map((permission) => this.normalizePermissionRef(permission));

    return {
      userId: this.readString(source, ['userId', 'UserId']) || fallbackUserId,
      storeId: this.readString(source, ['storeId', 'StoreId']),
      roles,
      directPermissions,
      rolePermissions,
      effectivePermissions:
        effectivePermissions.length > 0
          ? effectivePermissions
          : this.dedupePermissions([...rolePermissions, ...directPermissions]),
    };
  }

  private toPermissionMutationBody(
    body: PermissionMutationRequest
  ): { PermissionIds: string[] } {
    return {
      PermissionIds: body.PermissionIds || body.permissionIds || [],
    };
  }

  private normalizeMutationResponse(response: unknown): PermissionMutationResponse {
    const source = this.unwrapRecord(response);

    return {
      success: this.readBoolean(source, ['success', 'Success']),
      message: this.readString(source, ['message', 'Message']),
      permissionIds: this.readArray<string>(source, [
        'permissionIds',
        'PermissionIds',
      ]).filter((permissionId): permissionId is string => typeof permissionId === 'string'),
      userId: this.readString(source, ['userId', 'UserId']),
    };
  }

  private normalizeRole(role: Record<string, unknown>): UserRoleItem {
    return {
      roleId: this.readString(role, ['roleId', 'RoleId', 'id', 'Id']),
      id: this.readString(role, ['id', 'Id']),
      name: this.readString(role, ['name', 'Name']),
      displayName: this.readString(role, ['displayName', 'DisplayName', 'name', 'Name']),
      isSystem: this.readBoolean(role, ['isSystem', 'IsSystem']),
    };
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
        this.readString(permission, ['displayName', 'DisplayName', 'label', 'Label']) ||
        name,
      group: this.readString(permission, ['group', 'Group', 'module', 'Module']),
    };
  }

  private dedupePermissions(permissions: PermissionRef[]): PermissionRef[] {
    const seen = new Set<string>();

    return permissions.filter((permission) => {
      const key = permission.permissionId || permission.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private unwrapRecord(response: unknown): Record<string, unknown> {
    if (!this.isRecord(response)) return {};

    for (const key of ['data', 'Data', 'result', 'Result', 'value', 'Value']) {
      const candidate = response[key];
      if (this.isRecord(candidate)) return candidate;
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
