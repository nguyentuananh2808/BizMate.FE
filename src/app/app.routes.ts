import { Routes } from '@angular/router';
import { AppPermission } from './core/constants/app-permission.constants';
import { AuthGuard } from './core/guards/auth-guard';
import { PermissionGuard } from './core/guards/permission-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'order-update/:id',
    loadComponent: () =>
      import(
        './features/orders/pages/order-update.component/order-update.component'
      ).then((m) => m.OrderUpdateComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.order.edit] },
  },
  {
    path: 'warehouse-receipt-update/:id',
    loadComponent: () =>
      import(
        './features/inventory-receipt/pages/warehouse-receipt-update.component/warehouse-receipt-update.component'
      ).then((m) => m.WarehouseReceiptUpdateComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.importReceipt.edit] },
  },
  {
    path: 'product-category',
    loadComponent: () =>
      import(
        './features/product-category/pages/product-category/product-category.component'
      ).then((m) => m.ProductCategoryComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.productCategory.view] },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../app/features/auth/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../app/features/auth/pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        './features/auth/pages/forgot-password/forgot-password.component'
      ).then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'warehouse-receipt',
    loadComponent: () =>
      import(
        './features/inventory-receipt/pages/warehouse-receipt.component/warehouse-receipt.component'
      ).then((m) => m.WarehouseReceiptComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.importReceipt.view] },
  },
  {
    path: 'order',
    loadComponent: () =>
      import('./features/orders/pages/order.component/order.component').then(
        (m) => m.OrderComponent
      ),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.order.view] },
  },
  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./features/auth/pages/verify-otp/verify-otp.component').then(
        (m) => m.VerifyOtpComponent
      ),
  },
  {
    path: 'product',
    loadComponent: () =>
      import(
        './features/product/product.component/pages/product.component'
      ).then((m) => m.ProductComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.product.view] },
  },
  {
    path: 'product-items',
    loadComponent: () =>
      import(
        './features/product-item/pages/product-item-list.component'
      ).then((m) => m.ProductItemListComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: [AppPermission.product.view, AppPermission.stock.view],
    },
  },
  {
    path: 'warehouse-receipt-create',
    loadComponent: () =>
      import(
        './features/inventory-receipt/pages/warehouse-receipt-create.component/warehouse-receipt-create.component'
      ).then((m) => m.WarehouseReceiptCreateComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.importReceipt.create] },
  },

  {
    path: 'order-create',
    loadComponent: () =>
      import(
        './features/orders/pages/order-create.component/order-create.component'
      ).then((m) => m.OrderCreateComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.order.create] },
  },

  {
    path: 'user-information',
    loadComponent: () =>
      import('./features/user/user-information/user-information').then(
        (m) => m.UserInformation
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import(
        './features/permission/pages/permission-management.component'
      ).then((m) => m.PermissionManagementComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: [AppPermission.user.view, AppPermission.role.view],
    },
  },
  {
    path: 'technician-holdings',
    loadComponent: () =>
      import(
        './features/technician/pages/technician-holdings.component/technician-holdings.component'
      ).then((m) => m.TechnicianHoldingsComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.stock.view] },
  },
  {
    path: 'customer-list',
    loadComponent: () =>
      import('./features/customer/pages/customer-list.component/customer-list').then(
        (m) => m.CustomerList
      ),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.customer.view] },
  },
  {
    path: 'dealer-level',
    loadComponent: () =>
      import('./features/dealer-level/pages/dealer-level.component/dealer-level.component').then(
        (m) => m.DealerLevelComponent
      ),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.dealerLevel.view] },
  },

  {
    path: 'dealer-level-create',
    loadComponent: () =>
      import('./features/dealer-level/pages/dealer-level-create.component/dealer-level-create.component').then(
        (m) => m.DealerLevelCreateComponent
      ),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.dealerLevel.create] },
  },
  {
    path: 'dealer-level-update/:id',
    loadComponent: () =>
      import(
        './features/dealer-level/pages/dealer-level-update.component/dealer-level-update.component'
      ).then((m) => m.DealerLevelUpdateComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: [AppPermission.dealerLevel.edit] },
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import(
        './features/shared/unauthorized/unauthorized.component'
      ).then((m) => m.UnauthorizedComponent),
    canActivate: [AuthGuard],
  },
];
