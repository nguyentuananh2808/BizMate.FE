import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, NzMenuModule, NzIconModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  isCollapsed = false;
  expandedItems: Set<string> = new Set();
  isMobile = false;
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkIsMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIsMobile();
  }

  checkIsMobile(): void {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

  openMobileMenu() {
    this.isMobileMenuOpen = true;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleExpand(key: string): void {
    this.expandedItems.has(key)
      ? this.expandedItems.delete(key)
      : this.expandedItems.add(key);
  }

  isExpanded(key: string): boolean {
    return this.expandedItems.has(key);
  }

  handleClick(route?: string): void {
    if (route) {
      this.router.navigate([route]);
      if (this.isMobile) this.closeMobileMenu();
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) this.expandedItems.clear();
  }

  menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      icon: 'appstore',
      children: [
        {
          key: 'product-list',
          label: 'Danh sách sản phẩm',
          icon: 'unordered-list',
          route: '/product',
        },
        {
          key: 'product-categories',
          label: 'Danh sách loại sản phẩm',
          icon: 'unordered-list',
          route: '/product-category',
        },
      ],
    },
    {
      key: 'warehouse',
      icon: 'inbox',
      label: 'Quản lý nhập kho',
      route: '/warehouse-receipt',
    },
    {
      key: 'orders',
      icon: 'shopping-cart',
      label: 'Đơn hàng',
      route: '/order',
    },
    {
      key: 'customers',
      icon: 'user',
      label: 'Khách hàng',
      route: '/customers',
    },
    { key: 'reports', icon: 'bar-chart', label: 'Báo cáo', route: '/reports' },
  ];
}
