import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { interval, Subscription } from 'rxjs';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotificationService } from '../services/notification-service';
import {
  NotificationResponse,
  AppNotificationWithOrder,
} from '../models/notification-request.model';
import { UpdateNotificationRequest } from '../models/update-notification.model';

@Component({
  selector: 'notification',
  standalone: true,
  imports: [
    CommonModule,
    NzBadgeModule,
    NzListModule,
    RouterModule,
    NzSpinModule,
    NzIconModule,
  ],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: AppNotificationWithOrder[] = [];
  loading = false;
  lastChecked: string = new Date().toISOString();
  private pollingSub?: Subscription;
  private routerSub?: Subscription;
  isTooltipOpen = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();

    // Polling mỗi 5 giây
    this.pollingSub = interval(5000).subscribe(() => this.fetchNotifications());

    // Optional: xử lý khi navigate cùng URL
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {});
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  toggleTooltip(): void {
    setTimeout(() => {
      this.isTooltipOpen = !this.isTooltipOpen;
      this.cdr.detectChanges();
    });
  }

  fetchNotifications(): void {
    this.loading = true;

    this.notificationService.getNotifications(this.lastChecked).subscribe({
      next: (res: NotificationResponse) => {
        const data = res.Notifications || [];

        // Map API response sang AppNotificationWithOrder
        const apiNotifications: AppNotificationWithOrder[] = data.map((n) => {
          const parts = n.Message?.split('|') ?? [];
          const orderId = parts[0]?.trim();
          const orderCode = parts[1]?.trim();

          return {
            Id: n.Id,
            StoreId: n.StoreId,
            Message: n.Message,
            Type: n.Type,
            UserId: n.UserId,
            createdAt: n.createdAt,
            orderId,
            orderCode,
            customMessage: `Đơn hàng ${orderCode} vừa có sự thay đổi.`,
          };
        });

        // Lọc các notification cũ đã bị xoá trên server
        this.notifications = this.notifications.filter((localItem) =>
          apiNotifications.some((apiItem) => apiItem.Id === localItem.Id)
        );

        // Thêm các notification mới, loại bỏ trùng
        const uniqueNewNotifications = apiNotifications.filter(
          (apiItem) =>
            !this.notifications.some((localItem) => localItem.Id === apiItem.Id)
        );

        this.notifications = [...uniqueNewNotifications, ...this.notifications];

        // Cập nhật lastChecked
        const latest = data
          .map((d) => new Date(d.createdAt || new Date()))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        if (latest) this.lastChecked = latest.toISOString();

        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi fetchNotifications:', err);
        this.loading = false;
      },
    });
  }

  // Chuyển trang khi click notification
  viewDetail(item: AppNotificationWithOrder): void {
    if (item.orderId) {
      const targetUrl = `/order-update/${item.orderId}`;
      this.router.navigate([targetUrl]);
      this.isTooltipOpen = false;
    }
  }

  // Đánh dấu tất cả đã đọc
  markAllAsRead(): void {
    const allIds = this.notifications.map((n) => n.Id);
    if (allIds.length === 0) return;

    const body: UpdateNotificationRequest = { NotificationIds: allIds };
    this.notificationService.UpdateNotification(body).subscribe({
      next: () => {
        this.notifications = [];
      },
      error: (err) => {
        console.error('Lỗi markAllAsRead:', err);
      },
    });
  }

  // Đánh dấu một notification đã đọc
  markAsRead(item: AppNotificationWithOrder): void {
    if (!item.Id) return;

    const body: UpdateNotificationRequest = { NotificationIds: [item.Id] };
    this.notificationService.UpdateNotification(body).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((n) => n.Id !== item.Id);
      },
      error: (err) => {
        console.error('Lỗi markAsRead:', err);
      },
    });
  }
}
