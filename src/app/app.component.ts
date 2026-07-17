import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { InventoryChatComponent } from './features/inventory-chat/pages/inventory-chat.component';
import { PermissionClaimService } from './features/permission/services/permission-claim.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InventoryChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  protected readonly title = signal('BizMate.FE');
  showInventoryChat = false;
  private readonly authRoutes = new Set([
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
  ]);
  private sub = new Subscription();

  constructor(
    private router: Router,
    private permissionClaimService: PermissionClaimService
  ) {}

  ngOnInit(): void {
    this.updateInventoryChatVisibility(this.router.url);

    this.sub.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => this.updateInventoryChatVisibility(event.urlAfterRedirects))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private updateInventoryChatVisibility(url: string): void {
    const path = url.split('?')[0];
    const hasToken = !!localStorage.getItem('access_token');
    const canViewStock = this.permissionClaimService.hasPermission('stock.view');
    this.showInventoryChat = hasToken && canViewStock && !this.authRoutes.has(path);
  }
}
