import { Routes } from '@angular/router';
import { LoginComponent } from '../app/features/auth/pages/login/login.component';
import { RegisterComponent } from '../app/features/auth/pages/register/register.component';
import { VerifyOtpComponent } from './features/auth/pages/verify-otp/verify-otp.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { ProductCategoryComponent } from './features/product-category/pages/product-category/product-category.component';
import { ProductComponent } from './features/product/product.component/pages/product.component';
import { WarehouseReceiptComponent } from './features/inventory-receipt/pages/warehouse-receipt.component/warehouse-receipt.component';
import { WarehouseReceiptDetailComponent } from './features/inventory-receipt/pages/warehouse-receipt-detail.component/warehouse-receipt-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'product-category', component: ProductCategoryComponent },
  { path: 'warehouse-receipt', component: WarehouseReceiptComponent },
  { path: 'product', component: ProductComponent },
  { path: 'warehouse-receipt-detail/:id', component: WarehouseReceiptDetailComponent,},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
