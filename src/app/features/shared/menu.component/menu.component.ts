import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTableModule } from 'ng-zorro-antd/table';
import { filter, Subscription } from 'rxjs';
import { DarkModeToggleComponent } from '../dark-mode/pages/dark-mode-toggle.component';
import { DarkModeService } from '../dark-mode/services/dark-mode.service';

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    NzMenuModule,
    NzIconModule,
    NzTableModule,
    DarkModeToggleComponent,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  expandedItems: Set<string> = new Set();
  isMobile = false;
  isMobileMenuOpen = false;
  activeRouteKey: string | null = null;
  isDark = false;
  private sub = new Subscription();

  constructor(
    private router: Router,
    private darkModeService: DarkModeService
  ) {}

  ngOnInit(): void {
    this.checkIsMobile();
    this.syncActiveRoute(this.router.url);

    this.sub.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => this.syncActiveRoute(event.urlAfterRedirects))
    );

    this.sub.add(
      this.darkModeService.isDark$.subscribe((value) => {
        this.isDark = value;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkIsMobile();
  }

  checkIsMobile(): void {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

  openMobileMenu(): void {
    this.isMobileMenuOpen = true;
  }

  closeMobileMenu(): void {
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

  isActive(item: MenuItem): boolean {
    return this.activeRouteKey === item.key;
  }

  handleClick(route?: string, key?: string): void {
    if (route) {
      this.activeRouteKey = key || null;
      this.router.navigate([route]);
      if (this.isMobile) this.closeMobileMenu();
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) this.expandedItems.clear();
  }

  private syncActiveRoute(url: string): void {
    const path = url.split('?')[0];
    let parentKey: string | null = null;
    let routeKey: string | null = null;

    for (const section of this.menuSections) {
      for (const item of section.items) {
        if (item.route === path) {
          routeKey = item.key;
          parentKey = item.key;
        }

        const child = item.children?.find((childItem) => childItem.route === path);
        if (child) {
          routeKey = child.key;
          parentKey = item.key;
        }
      }
    }

    this.activeRouteKey = routeKey;
    if (parentKey && !this.isCollapsed) {
      this.expandedItems.add(parentKey);
    }
  }

  menuSections: MenuSection[] = [
    {
      title: 'Tổng quan',
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          route: '/dashboard',
        },
      ],
    },
    {
      title: 'Vận hành',
      items: [
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
              key: 'product-items',
              label: 'Serial theo sản phẩm',
              icon: 'barcode',
              route: '/product-items',
            },
            {
              key: 'product-categories',
              label: 'Loại sản phẩm',
              icon: 'shopping',
              route: '/product-category',
            },
          ],
        },
        {
          key: 'warehouse',
          icon: 'inbox',
          label: 'Nhập kho',
          route: '/warehouse-receipt',
        },
        {
          key: 'orders',
          icon: 'shopping-cart',
          label: 'Đơn hàng',
          route: '/order',
        },
      ],
    },
    {
      title: 'Khách hàng',
      items: [
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
              key: 'dealer-level',
              label: 'Giá theo đại lý',
              icon: 'tags',
              route: '/dealer-level',
            },
          ],
        },
      ],
    },
  ];
}
