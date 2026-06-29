export interface PermissionItem {
  id: string;
  name: string;
  displayName: string;
}

export interface PermissionGroup {
  group: string;
  permissions: PermissionItem[];
}

export interface PermissionRef {
  permissionId: string;
  name: string;
  displayName: string;
  group: string;
}

export interface UserRoleItem {
  roleId: string;
  id?: string;
  name: string;
  displayName: string;
  isSystem?: boolean;
  permissions?: PermissionRef[];
  permissionIds?: string[];
}

export interface UserPermissionOverview {
  userId: string;
  storeId: string;
  roles: UserRoleItem[];
  directPermissions: PermissionRef[];
  rolePermissions: PermissionRef[];
  effectivePermissions: PermissionRef[];
}

export interface PermissionMutationRequest {
  permissionIds?: string[];
  PermissionIds?: string[];
}

export interface PermissionMutationResponse {
  success: boolean;
  message: string;
  permissionIds: string[];
  userId?: string;
}

export interface RoleMutationRequest {
  name: string;
  displayName: string;
  permissionIds?: string[];
}

export interface AssignUserRoleRequest {
  roleId?: string;
  RoleId?: string;
}

export interface UserSearchRequest {
  KeySearch?: string | null;
  PageIndex: number;
  PageSize: number;
  IsActive?: boolean | null;
}

export interface UserSearchResponse {
  Users: StoreUserItem[];
  TotalCount: number;
}

export interface CreateStoreUserRequest {
  FullName: string;
  Email: string;
  Password: string;
  Phone?: string | null;
  RoleId: string;
  IsActive: boolean;
}

export interface UserMutationResponse {
  Success: boolean;
  Message: string;
  UserId?: string;
}

export interface StoreUserItem {
  Id: string;
  Code: string;
  FullName: string;
  Email: string;
  Role: string;
  StoreId: string;
  StoreName: string;
  IsActive: boolean;
  CreatedDate: string;
  RoleCount: number;
  DirectPermissionCount: number;
}
