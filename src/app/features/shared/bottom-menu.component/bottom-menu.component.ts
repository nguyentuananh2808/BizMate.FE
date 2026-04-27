import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface BottomMenuItem {
  id: string;
  label: string;
  icon: string;
  url: string;
  activePaths: string[];
  accent?: boolean;
}

@Component({
  selector: 'bottom-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NzIconModule],
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss'],
})
export class BottomMenuComponent implements OnDestroy {
  active = 'dashboard';
  private readonly routerEventsSub = new Subscription();

  menuItems: BottomMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: 'dashboard',
      url: '/dashboard',
      activePaths: ['/dashboard'],
    },
    {
      id: 'products',
      label: 'Sản phẩm',
      icon: 'appstore',
      url: '/product',
      activePaths: ['/product', '/product-items', '/product-category'],
    },
    {
      id: 'create-order',
      label: 'Tạo đơn',
      icon: 'plus',
      url: '/order-create',
      activePaths: ['/order-create'],
      accent: true,
    },
    {
      id: 'orders',
      label: 'Đơn hàng',
      icon: 'shopping-cart',
      url: '/order',
      activePaths: ['/order', '/order-update'],
    },
    {
      id: 'me',
      label: 'Tài khoản',
      icon: 'user',
      url: '/user-information',
      activePaths: ['/user-information'],
    },
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    this.syncActiveRoute(this.router.url);

    this.routerEventsSub.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.syncActiveRoute(event.urlAfterRedirects);
          this.cdr.detectChanges();
        })
    );
  }

  ngOnDestroy(): void {
    this.routerEventsSub.unsubscribe();
  }

  setActive(id: string) {
    this.active = id;
  }

  private syncActiveRoute(url: string): void {
    const path = url.split('?')[0];
    const current = this.menuItems.find((item) =>
      item.activePaths.some((activePath) => this.matchPath(path, activePath))
    );

    this.active = current?.id ?? '';
  }

  private matchPath(currentPath: string, activePath: string): boolean {
    return (
      currentPath === activePath || currentPath.startsWith(`${activePath}/`)
    );
  }
}
