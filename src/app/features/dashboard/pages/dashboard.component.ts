import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BottomMenuComponent } from '../../shared/bottom-menu.component/bottom-menu.component';
import { TopMenuComponent } from '../../shared/top-menu.component/top-menu.component';
import { ProductPopupComponent } from '../../shared/product-popup.component/product-popup.component';

@Component({
  selector: 'dashboard-app',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BottomMenuComponent,
    TopMenuComponent,
    ProductPopupComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  showPopup = false;
  menuItems = [
    { icon: '🎣', label: 'Sản phẩm ', onClick: () => (this.showPopup = true) },
    { icon: '📦', label: 'Quản lý kho', route: '/inventory' },
    { icon: '🛒', label: 'Đơn hàng', route: '/orders' },
    { icon: '👥', label: 'Khách hàng', route: '/customers' },
    { icon: '📊', label: 'Báo cáo', route: '/reports' },
  ];

  closeProductPopup() {
    this.showPopup = false;
  }
}
