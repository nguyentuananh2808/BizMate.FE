import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface PermissionJwtPayload {
  permission?: string | string[];
  permissions?: string | string[];
  Permission?: string | string[];
  Permissions?: string | string[];
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class PermissionClaimService {
  getPermissionsFromToken(token = localStorage.getItem('access_token')): string[] {
    if (!token) return [];

    try {
      const decoded = jwtDecode<PermissionJwtPayload>(token);
      const permissions = [
        ...this.readPermissionsFromDecodedPayload(decoded),
        ...this.readDuplicatePermissionClaims(token),
      ];

      return Array.from(new Set(permissions.map((item) => item.trim()).filter(Boolean)));
    } catch {
      return Array.from(new Set(this.readDuplicatePermissionClaims(token)));
    }
  }

  hasPermission(permission: string): boolean {
    return this.getPermissionsFromToken().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const granted = new Set(this.getPermissionsFromToken());
    return permissions.some((permission) => granted.has(permission));
  }

  private readPermissionsFromDecodedPayload(payload: PermissionJwtPayload): string[] {
    const values: string[] = [];
    const directClaims = [
      payload.permission,
      payload.permissions,
      payload.Permission,
      payload.Permissions,
    ];

    for (const claim of directClaims) {
      values.push(...this.normalizeClaimValue(claim));
    }

    for (const [claimName, claimValue] of Object.entries(payload)) {
      const normalizedName = claimName.toLowerCase();
      if (
        normalizedName === 'permission' ||
        normalizedName === 'permissions' ||
        normalizedName.endsWith('/permission') ||
        normalizedName.endsWith('/permissions')
      ) {
        values.push(...this.normalizeClaimValue(claimValue));
      }
    }

    return values;
  }

  private readDuplicatePermissionClaims(token: string): string[] {
    const payloadJson = this.getPayloadJson(token);
    if (!payloadJson) return [];

    const values: string[] = [];
    const claimPattern = /"((?:\\.|[^"\\])*)"\s*:\s*("(?:\\.|[^"\\])*"|\[(?:[^\]\\"]|\\.|"(?:\\.|[^"\\])*")*\])/g;
    let match: RegExpExecArray | null;

    while ((match = claimPattern.exec(payloadJson))) {
      const claimName = this.parseJsonString(`"${match[1]}"`).toLowerCase();
      if (
        claimName !== 'permission' &&
        claimName !== 'permissions' &&
        !claimName.endsWith('/permission') &&
        !claimName.endsWith('/permissions')
      ) {
        continue;
      }

      try {
        values.push(...this.normalizeClaimValue(JSON.parse(match[2])));
      } catch {
        values.push(...this.normalizeClaimValue(match[2]));
      }
    }

    return values;
  }

  private normalizeClaimValue(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.normalizeClaimValue(item));
    }

    if (typeof value !== 'string') return [];

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private getPayloadJson(token: string): string {
    const payload = token.split('.')[1];
    if (!payload) return '';

    try {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      );
      const binary = atob(paddedBase64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return '';
    }
  }

  private parseJsonString(value: string): string {
    try {
      return JSON.parse(value);
    } catch {
      return value.replace(/^"|"$/g, '');
    }
  }
}
