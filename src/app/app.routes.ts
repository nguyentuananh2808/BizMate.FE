import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'warehouse-receipt-detail/:id',
    loadComponent: () =>
      import(
        './features/inventory-receipt/pages/warehouse-receipt-detail.component/warehouse-receipt-detail.component'
      ).then((m) => m.WarehouseReceiptDetailComponent),
  },
  {
    path: 'product-category',
    loadComponent: () =>
      import(
        './features/product-category/pages/product-category/product-category.component'
      ).then((m) => m.ProductCategoryComponent),
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
  },
  {
    path: 'warehouse-receipt',
    loadComponent: () =>
      import(
        './features/inventory-receipt/pages/warehouse-receipt.component/warehouse-receipt.component'
      ).then((m) => m.WarehouseReceiptComponent),
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
  },
  {
    path: 'warehouse-receipt-create',
    loadComponent: () =>
      import(
        './features/inventory-receipt/pages/warehouse-receipt-create.component/warehouse-receipt-create.component'
      ).then((m) => m.WarehouseReceiptCreateComponent),
  },
];
