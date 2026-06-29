import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { BottomMenuComponent } from '../../shared/bottom-menu.component/bottom-menu.component';
import { HeaderCommonComponent } from '../../shared/header-common.component/header-common.component';
import { MenuComponent } from '../../shared/menu.component/menu.component';
import {
  PermissionGroup,
  PermissionItem,
  PermissionRef,
  StoreUserItem,
  UserPermissionOverview,
  UserRoleItem,
} from '../models/permission.model';
import { PermissionApiService } from '../services/permission-api.service';
import { PermissionClaimService } from '../services/permission-claim.service';
import { RoleApiService } from '../services/role-api.service';
import { UserApiService } from '../services/user-api.service';
import { UserPermissionApiService } from '../services/user-permission-api.service';

interface NewEmployeeForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleId: string;
  isActive: boolean;
}

@Component({
  selector: 'permission-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzCheckboxModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzSpinModule,
    NzTagModule,
    NzToolTipModule,
    MenuComponent,
    HeaderCommonComponent,
    BottomMenuComponent,
  ],
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.scss'],
})
export class PermissionManagementComponent implements OnInit {
  userId = '';
  currentUserId = localStorage.getItem('user_id') ?? '';
  userSearchKeyword = '';
  users: StoreUserItem[] = [];
  selectedUser: StoreUserItem | null = null;
  userTotalCount = 0;
  userPageIndex = 0;
  userPageSize = 20;

  permissionGroups: PermissionGroup[] = [];
  roles: UserRoleItem[] = [];
  overview: UserPermissionOverview | null = null;
  tokenPermissionNames: string[] = [];
  selectedRoleId = '';
  permissionSearch = '';

  isLoadingMaster = false;
  isSearchingUsers = false;
  isLoadingUser = false;
  isSavingPermissions = false;
  isSavingRole = false;
  isCreateUserModalOpen = false;
  isCreatingUser = false;
  showNewUserPassword = false;
  showNewUserConfirmPassword = false;
  newEmployee: NewEmployeeForm = this.createEmptyEmployeeForm();

  private directPermissionIds = new Set<string>();
  private originalDirectPermissionIds = new Set<string>();
  private rolePermissionKeys = new Set<string>();
  private directPermissionKeys = new Set<string>();
  private tokenPermissionKeys = new Set<string>();
  private pendingSelectedUserId = '';

  readonly trackUser = (_index: number, user: StoreUserItem): string =>
    user.Id || user.Email || String(_index);

  readonly trackGroup = (_index: number, group: PermissionGroup): string =>
    group.group || String(_index);

  readonly trackPermission = (
    _index: number,
    permission: PermissionItem
  ): string => permission.id || permission.name || String(_index);

  readonly trackRole = (_index: number, role: UserRoleItem): string =>
    role.roleId || role.id || role.name || String(_index);

  constructor(
    private permissionApi: PermissionApiService,
    private permissionClaimService: PermissionClaimService,
    private roleApi: RoleApiService,
    private userApi: UserApiService,
    private userPermissionApi: UserPermissionApiService,
    private toastr: ToastrService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.syncTokenPermissions();
    this.loadMasterData();
    this.searchUsers();
  }

  loadMasterData(): void {
    this.isLoadingMaster = true;
    this.refreshView();
    forkJoin({
      permissions: this.permissionApi.getPermissionGroups().pipe(
        catchError(() => {
          this.toastr.error('Không thể tải danh sách quyền.');
          return of<PermissionGroup[]>([]);
        })
      ),
      roles: this.roleApi.getRoles().pipe(
        catchError(() => {
          this.toastr.error('Không thể tải danh sách vai trò.');
          return of<UserRoleItem[]>([]);
        })
      ),
    })
      .pipe(
        finalize(() => {
          this.isLoadingMaster = false;
          this.refreshView();
        })
      )
      .subscribe(({ permissions, roles }) => {
        this.permissionGroups = Array.isArray(permissions) ? permissions : [];
        this.roles = Array.isArray(roles) ? roles : [];
        this.rebuildDirectPermissionKeys();
        this.rebuildTokenPermissionKeys();
        this.refreshView();
      });
  }

  searchUsers(pageIndex = 0): void {
    this.userPageIndex = pageIndex;
    this.isSearchingUsers = true;
    this.refreshView();
    this.userApi
      .searchUsers({
        KeySearch: this.userSearchKeyword.trim() || null,
        PageIndex: this.userPageIndex,
        PageSize: this.userPageSize,
        IsActive: null,
      })
      .pipe(
        finalize(() => {
          this.isSearchingUsers = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: (response) => {
          this.users = response.Users || [];
          this.userTotalCount = response.TotalCount || this.users.length;
          if (this.pendingSelectedUserId) {
            const createdUser = this.users.find(
              (user) => user.Id === this.pendingSelectedUserId
            );
            this.pendingSelectedUserId = '';
            if (createdUser) {
              this.selectUser(createdUser.Id);
            }
          }
          this.refreshView();
        },
        error: () => {
          this.users = [];
          this.userTotalCount = 0;
          this.refreshView();
          this.toastr.error('Không thể tải danh sách nhân viên.');
        },
      });
  }

  selectUser(userId: string | null): void {
    this.userId = userId || '';
    this.selectedUser =
      this.users.find((user) => user.Id === this.userId) || null;
    this.resetUserPermissionState();

    if (this.userId) {
      this.loadUserPermissions();
    } else {
      this.refreshView();
    }
  }

  useCurrentUser(): void {
    if (!this.currentUserId) {
      this.toastr.warning('Không tìm thấy user hiện tại.');
      return;
    }

    this.userId = this.currentUserId;
    this.selectedUser =
      this.users.find((user) => user.Id === this.currentUserId) || null;
    this.resetUserPermissionState();
    this.loadUserPermissions();
  }

  openCreateUserModal(): void {
    const defaultRole =
      this.getAssignableRoles().find(
        (role) => role.name?.toLowerCase() === 'staff'
      ) || this.getAssignableRoles()[0];

    if (!defaultRole) {
      this.toastr.warning(
        'Chưa có vai trò phù hợp để tạo nhân viên. Vui lòng cấu hình vai trò trước.'
      );
      return;
    }

    this.newEmployee = {
      ...this.createEmptyEmployeeForm(),
      roleId: this.getRoleId(defaultRole),
    };
    this.showNewUserPassword = false;
    this.showNewUserConfirmPassword = false;
    this.isCreateUserModalOpen = true;
    this.refreshView();
  }

  closeCreateUserModal(): void {
    if (this.isCreatingUser) return;

    this.isCreateUserModalOpen = false;
    this.newEmployee = this.createEmptyEmployeeForm();
    this.refreshView();
  }

  createEmployee(): void {
    if (this.isCreatingUser) return;

    const fullName = this.newEmployee.fullName.trim();
    const email = this.newEmployee.email.trim().toLowerCase();
    const password = this.newEmployee.password;

    if (!fullName || !email || !password || !this.newEmployee.roleId) {
      this.toastr.warning('Vui lòng nhập đầy đủ thông tin nhân viên.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.toastr.warning('Email không đúng định dạng.');
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      this.toastr.warning(
        'Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'
      );
      return;
    }

    if (password !== this.newEmployee.confirmPassword) {
      this.toastr.warning('Mật khẩu xác nhận chưa khớp.');
      return;
    }

    this.isCreatingUser = true;
    this.refreshView();
    this.userApi
      .createUser({
        FullName: fullName,
        Email: email,
        Password: password,
        Phone: this.isTechnicianRoleSelected()
          ? this.newEmployee.phone.trim() || null
          : null,
        RoleId: this.newEmployee.roleId,
        IsActive: this.newEmployee.isActive,
      })
      .pipe(
        finalize(() => {
          this.isCreatingUser = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: (response) => {
          this.toastr.success(
            response.Message || 'Tạo tài khoản nhân viên thành công.'
          );
          this.pendingSelectedUserId = response.UserId || '';
          this.isCreateUserModalOpen = false;
          this.newEmployee = this.createEmptyEmployeeForm();
          this.searchUsers(0);
        },
        error: (error) => {
          const message =
            error?.error?.Message ||
            error?.error?.message ||
            'Không thể tạo tài khoản nhân viên.';
          this.toastr.error(message);
        },
      });
  }

  loadUserPermissions(): void {
    const targetUserId = this.userId.trim();
    if (!targetUserId) {
      this.toastr.warning('Vui lòng chọn nhân viên.');
      return;
    }

    this.isLoadingUser = true;
    this.refreshView();
    this.userPermissionApi
      .getUserPermissions(targetUserId)
      .pipe(
        finalize(() => {
          this.isLoadingUser = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: (overview) => {
          this.overview = this.ensureOverview(overview);
          this.syncPermissionState(this.overview);
          this.refreshView();
        },
        error: () => {
          this.overview = this.createEmptyOverview(targetUserId);
          this.syncPermissionState(this.overview);
          this.refreshView();
          this.toastr.error('Không thể tải quyền hiện tại của nhân viên.');
        },
      });
  }

  assignRole(): void {
    if (!this.userId.trim()) {
      this.toastr.warning('Vui lòng chọn nhân viên.');
      return;
    }

    if (!this.selectedRoleId) {
      this.toastr.warning('Vui lòng chọn vai trò.');
      return;
    }

    this.isSavingRole = true;
    this.refreshView();
    this.userPermissionApi
      .assignRole(this.userId.trim(), this.selectedRoleId)
      .pipe(
        finalize(() => {
          this.isSavingRole = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Đã gán vai trò cho nhân viên.');
          this.selectedRoleId = '';
          this.loadUserPermissions();
        },
        error: () => this.toastr.error('Gán vai trò thất bại.'),
      });
  }

  removeRole(role: UserRoleItem): void {
    const roleId = this.getRoleId(role);
    if (!roleId) return;

    this.modal.confirm({
      nzTitle: 'Gỡ vai trò?',
      nzContent: `Vai trò "${this.getRoleLabel(role)}" sẽ không còn cấp quyền cho nhân viên này.`,
      nzOkText: 'Gỡ vai trò',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () =>
        this.userPermissionApi.removeRole(this.userId.trim(), roleId).subscribe({
          next: () => {
            this.toastr.success('Đã gỡ vai trò.');
            this.loadUserPermissions();
          },
          error: () => this.toastr.error('Gỡ vai trò thất bại.'),
        }),
    });
  }

  toggleDirectPermission(permission: PermissionItem, checked: boolean): void {
    if (!permission.id) {
      this.toastr.warning('Quyền này chưa có permissionId hợp lệ.');
      return;
    }

    if (checked) {
      this.directPermissionIds.add(permission.id);
    } else {
      this.directPermissionIds.delete(permission.id);
      if (this.isRolePermission(permission)) {
        this.toastr.info(
          'Quyền này vẫn còn hiệu lực vì được kế thừa từ vai trò.'
        );
      }
    }

    this.rebuildDirectPermissionKeys();
  }

  saveDirectPermissions(): void {
    if (!this.userId.trim()) {
      this.toastr.warning('Vui lòng chọn nhân viên.');
      return;
    }

    this.isSavingPermissions = true;
    this.refreshView();
    this.userPermissionApi
      .replaceDirectPermissions(this.userId.trim(), {
        PermissionIds: Array.from(this.directPermissionIds),
      })
      .pipe(
        finalize(() => {
          this.isSavingPermissions = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: (response) => {
          this.toastr.success(
            response?.message || 'Cập nhật quyền thành công.'
          );
          this.loadUserPermissions();
        },
        error: () => this.toastr.error('Cập nhật quyền thất bại.'),
      });
  }

  clearDirectPermissions(): void {
    if (!this.userId.trim() || this.directPermissionIds.size === 0) return;

    this.modal.confirm({
      nzTitle: 'Xóa toàn bộ quyền riêng?',
      nzContent:
        'Các quyền được kế thừa từ vai trò vẫn còn hiệu lực sau khi xóa quyền riêng.',
      nzOkText: 'Xóa quyền riêng',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () =>
        this.userPermissionApi.clearDirectPermissions(this.userId.trim()).subscribe({
          next: () => {
            this.toastr.success('Đã xóa toàn bộ quyền riêng.');
            this.loadUserPermissions();
          },
          error: () => this.toastr.error('Xóa quyền riêng thất bại.'),
        }),
    });
  }

  getFilteredPermissions(group: PermissionGroup): PermissionItem[] {
    const keyword = this.permissionSearch.trim().toLowerCase();
    const permissions = this.getGroupPermissions(group);
    if (!keyword) return permissions;

    return permissions.filter((permission) =>
      `${permission.name} ${permission.displayName}`
        .toLowerCase()
        .includes(keyword)
    );
  }

  getVisibleGroups(): PermissionGroup[] {
    return this.getPermissionGroups().filter(
      (group) => this.getFilteredPermissions(group).length > 0
    );
  }

  getAvailableRoles(): UserRoleItem[] {
    const assigned = new Set(
      this.getAssignedRoles().map((role) => this.getRoleId(role))
    );
    return this.getAssignableRoles().filter(
      (role) => !assigned.has(this.getRoleId(role))
    );
  }

  getAssignableRoles(): UserRoleItem[] {
    return this.roles.filter(
      (role) =>
        role.name?.toLowerCase() !== 'owner' &&
        !(role.isSystem && role.name?.toLowerCase() === 'owner')
    );
  }

  isTechnicianRoleSelected(): boolean {
    const role = this.roles.find(
      (item) => this.getRoleId(item) === this.newEmployee.roleId
    );
    return role?.name?.toLowerCase() === 'technician';
  }

  getAssignedRoles(): UserRoleItem[] {
    return this.overview?.roles ?? [];
  }

  getRoleId(role: UserRoleItem): string {
    return role.roleId || role.id || '';
  }

  getRoleLabel(role: UserRoleItem): string {
    return role.displayName || role.name || this.getRoleId(role) || 'Chưa có tên';
  }

  getUserLabel(user: StoreUserItem): string {
    const name = user.FullName || user.Code || user.Id;
    return user.Email ? `${name} - ${user.Email}` : name;
  }

  getSelectedUserName(): string {
    return (
      this.selectedUser?.FullName ||
      this.selectedUser?.Email ||
      this.overview?.userId ||
      this.userId
    );
  }

  getEffectiveCount(): number {
    return this.overview?.effectivePermissions?.length ?? 0;
  }

  getDirectCount(): number {
    return (
      this.overview?.directPermissions?.length ??
      this.selectedUser?.DirectPermissionCount ??
      0
    );
  }

  getEditableDirectCount(): number {
    return this.directPermissionIds.size;
  }

  getInheritedCount(): number {
    return this.overview?.rolePermissions?.length ?? 0;
  }

  getTokenPermissionCount(): number {
    return this.tokenPermissionNames.length;
  }

  getDirectPermissionCount(group: PermissionGroup): number {
    return this.getGroupPermissions(group).filter((permission) =>
      this.isDirectPermission(permission)
    ).length;
  }

  isPermissionChecked(permission: PermissionItem): boolean {
    return this.isDirectPermission(permission);
  }

  isDirectPermission(permission: PermissionItem): boolean {
    return (
      this.directPermissionKeys.has(permission.id) ||
      this.directPermissionKeys.has(permission.name)
    );
  }

  isRolePermission(permission: PermissionItem): boolean {
    return (
      this.rolePermissionKeys.has(permission.id) ||
      this.rolePermissionKeys.has(permission.name)
    );
  }

  isPermissionDisabled(permission: PermissionItem): boolean {
    return this.isRolePermission(permission) && !this.isDirectPermission(permission);
  }

  isTokenPermission(permission: PermissionItem): boolean {
    return (
      this.tokenPermissionKeys.has(permission.id) ||
      this.tokenPermissionKeys.has(permission.name)
    );
  }

  hasPermissionMaster(): boolean {
    return this.getPermissionGroups().length > 0;
  }

  canManagePermissions(): boolean {
    return !!this.userId.trim();
  }

  hasPendingPermissionChanges(): boolean {
    return this.getPendingAddPermissionIds().length > 0 ||
      this.getPendingRemovePermissionIds().length > 0;
  }

  getPendingAddPermissionIds(): string[] {
    return Array.from(this.directPermissionIds).filter(
      (permissionId) => !this.originalDirectPermissionIds.has(permissionId)
    );
  }

  getPendingRemovePermissionIds(): string[] {
    return Array.from(this.originalDirectPermissionIds).filter(
      (permissionId) => !this.directPermissionIds.has(permissionId)
    );
  }

  private syncTokenPermissions(): void {
    this.tokenPermissionNames = this.permissionClaimService.getPermissionsFromToken();
    this.rebuildTokenPermissionKeys();
  }

  private syncPermissionState(overview: UserPermissionOverview): void {
    this.directPermissionIds = new Set(
      (overview.directPermissions || [])
        .map((permission) => permission.permissionId)
        .filter(Boolean)
    );
    this.rolePermissionKeys = this.buildPermissionKeySet(
      overview.rolePermissions || []
    );
    this.rebuildDirectPermissionKeys();
    this.originalDirectPermissionIds = new Set(this.directPermissionIds);
  }

  private resetUserPermissionState(): void {
    this.overview = null;
    this.selectedRoleId = '';
    this.permissionSearch = '';
    this.directPermissionIds = new Set<string>();
    this.originalDirectPermissionIds = new Set<string>();
    this.directPermissionKeys = new Set<string>();
    this.rolePermissionKeys = new Set<string>();
  }

  private rebuildDirectPermissionKeys(): void {
    this.directPermissionKeys = new Set<string>(this.directPermissionIds);

    for (const group of this.getPermissionGroups()) {
      for (const permission of this.getGroupPermissions(group)) {
        if (
          permission.id &&
          this.directPermissionIds.has(permission.id)
        ) {
          this.directPermissionKeys.add(permission.id);
          this.directPermissionKeys.add(permission.name);
        }
      }
    }
  }

  private rebuildTokenPermissionKeys(): void {
    this.tokenPermissionKeys = new Set(this.tokenPermissionNames);

    for (const group of this.getPermissionGroups()) {
      for (const permission of this.getGroupPermissions(group)) {
        if (this.tokenPermissionKeys.has(permission.name)) {
          if (permission.id) this.tokenPermissionKeys.add(permission.id);
        }
      }
    }
  }

  private buildPermissionKeySet(permissions: PermissionRef[]): Set<string> {
    const keys = new Set<string>();
    for (const permission of permissions) {
      if (permission.permissionId) keys.add(permission.permissionId);
      if (permission.name) keys.add(permission.name);
    }
    return keys;
  }

  private getPermissionGroups(): PermissionGroup[] {
    return Array.isArray(this.permissionGroups) ? this.permissionGroups : [];
  }

  private getGroupPermissions(group: PermissionGroup): PermissionItem[] {
    return Array.isArray(group.permissions) ? group.permissions : [];
  }

  private createEmptyOverview(userId: string): UserPermissionOverview {
    return {
      userId,
      storeId: '',
      roles: [],
      directPermissions: [],
      rolePermissions: [],
      effectivePermissions: [],
    };
  }

  private ensureOverview(overview: UserPermissionOverview): UserPermissionOverview {
    return {
      userId: overview?.userId || this.userId.trim(),
      storeId: overview?.storeId || '',
      roles: Array.isArray(overview?.roles) ? overview.roles : [],
      directPermissions: Array.isArray(overview?.directPermissions)
        ? overview.directPermissions
        : [],
      rolePermissions: Array.isArray(overview?.rolePermissions)
        ? overview.rolePermissions
        : [],
      effectivePermissions: Array.isArray(overview?.effectivePermissions)
        ? overview.effectivePermissions
        : [],
    };
  }

  private createEmptyEmployeeForm(): NewEmployeeForm {
    return {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      isActive: true,
    };
  }

  private refreshView(): void {
    this.cdr.markForCheck();
  }
}
