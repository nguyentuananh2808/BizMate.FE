import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, NzMenuModule, NzIconModule,NzTableModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  isCollapsed = false;
  expandedItems: Set<string> = new Set();
  isMobile = false;
  isMobileMenuOpen = false;
  activeRouteKey: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkIsMobile();
    const currentUrl = this.router.url;

    const findParentKey = (items: any[], url: string): string | null => {
      for (const item of items) {
        if (item.route === url) return item.key;
        if (item.children) {
          const child = item.children.find((c: any) => c.route === url);
          if (child) return item.key;
        }
      }
      return null;
    };

    const activeKey = findParentKey(this.menuItems, currentUrl);
    if (activeKey) this.expandedItems.add(activeKey);

    this.activeRouteKey =
      this.menuItems
        .flatMap((item) => [item, ...(item.children || [])])
        .find((i) => i.route === currentUrl)?.key || null;
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

  handleClick(route?: string, key?: string): void {
    if (route) {
      this.activeRouteKey = key || null;
      this.router.navigate([route]);
      // if (this.isMobile) this.closeMobileMenu();
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
          icon: 'shopping',
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
     
      children: [
        {
          key: 'customer-list',
          label: 'Danh sách khách hàng',
          icon: 'user-add',
           route: '/customer-list',
        },
        {
          key: 'product-categories',
          label: 'Giá sản phẩm theo đại lý',
          icon: 'tags',
          route: '/dealer-level',
        },
      ],
    },
    { key: 'reports', icon: 'bar-chart', label: 'Báo cáo', route: '/reports' },
  ];
}
