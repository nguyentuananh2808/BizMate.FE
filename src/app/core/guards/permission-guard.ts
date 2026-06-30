import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { PermissionClaimService } from '../../features/permission/services/permission-claim.service';

export type PermissionMode = 'all' | 'any';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly permissionClaimService: PermissionClaimService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const requiredPermissions = this.readRequiredPermissions(route);
    if (requiredPermissions.length === 0) return true;

    const grantedPermissions = new Set(
      this.permissionClaimService.getPermissionsFromToken()
    );
    const mode = route.data['permissionMode'] as PermissionMode | undefined;
    const isAllowed =
      mode === 'any'
        ? requiredPermissions.some((permission) =>
            grantedPermissions.has(permission)
          )
        : requiredPermissions.every((permission) =>
            grantedPermissions.has(permission)
          );

    if (isAllowed) return true;

    return this.router.createUrlTree(['/unauthorized'], {
      queryParams: { returnUrl: state.url },
    });
  }

  private readRequiredPermissions(route: ActivatedRouteSnapshot): string[] {
    const value = route.data['permissions'];
    if (!Array.isArray(value)) return [];

    return value.filter(
      (permission): permission is string =>
        typeof permission === 'string' && permission.trim().length > 0
    );
  }
}
