import { DealerLevel } from './features/dealer-level/models/dealer-level.model';
import { DealerLevelCreateComponent } from './features/dealer-level/pages/dealer-level-create.component/dealer-level-create.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'order-update/:id',
    loadComponent: () =>
      import(
        './features/orders/pages/order-update.component/order-update.component'
      ).then((m) => m.OrderUpdateComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'warehouse-receipt-update/:id',
    loadComponent: () =>
      import(
        './features/inventory-receipt/pages/warehouse-receipt-update.component/warehouse-receipt-update.component'
      ).then((m) => m.WarehouseReceiptUpdateComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'product-category',
    loadComponent: () =>
      import(
        './features/product-category/pages/product-category/product-category.component'
      ).then((m) => m.ProductCategoryComponent),
    canActivate: [AuthGuard],
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
    canActivate: [AuthGuard],
  },
  {
    path: 'order',
    loadComponent: () =>
      import('./features/orders/pages/order.component/order.component').then(
        (m) => m.OrderComponent
      ),
    canActivate: [AuthGuard],
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
    canActivate: [AuthGuard],
  },
  {
    path: 'warehouse-receipt-create',
    loadComponent: () =>
      import(
        './features/inventory-receipt/pages/warehouse-receipt-create.component/warehouse-receipt-create.component'
      ).then((m) => m.WarehouseReceiptCreateComponent),
    canActivate: [AuthGuard],
  },

  {
    path: 'order-create',
    loadComponent: () =>
      import(
        './features/orders/pages/order-create.component/order-create.component'
      ).then((m) => m.OrderCreateComponent),
    canActivate: [AuthGuard],
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
    path: 'customer-list',
    loadComponent: () =>
      import('./features/customer/pages/customer-list.component/customer-list').then(
        (m) => m.CustomerList
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dealer-level',
    loadComponent: () =>
      import('./features/dealer-level/pages/dealer-level.component/dealer-level.component').then(
        (m) => m.DealerLevelComponent
      ),
    canActivate: [AuthGuard],
  },

   {
    path: 'dealer-level-create',
    loadComponent: () =>
      import('./features/dealer-level/pages/dealer-level-create.component/dealer-level-create.component').then(
        (m) => m.DealerLevelCreateComponent
      ),
    canActivate: [AuthGuard],
  },

 
  {
    path: 'dealer-level-update/:id',
    loadComponent: () =>
      import(
        './features/dealer-level/pages/dealer-level-update.component/dealer-level-update.component'
      ).then((m) => m.DealerLevelUpdateComponent),
    canActivate: [AuthGuard],
  },
];
