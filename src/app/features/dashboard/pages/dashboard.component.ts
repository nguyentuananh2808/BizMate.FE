import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'dashboard-app',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  menuItems = [
    { icon: '📦', label: 'Quản lý kho', route: '/inventory' },
    { icon: '🛒', label: 'Đơn hàng', route: '/orders' },
    { icon: '👥', label: 'Khách hàng', route: '/customers' },
    { icon: '📊', label: 'Báo cáo', route: '/reports' },
    { icon: '⚙️', label: 'Cài đặt', route: '/settings' },
  ];
}
