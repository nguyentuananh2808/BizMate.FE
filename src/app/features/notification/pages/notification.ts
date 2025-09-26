import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from '../services/notification-service';
import {
  NotificationResponse,
  AppNotification,
} from '../models/notification-request.model';

@Component({
  selector: 'notification',
  standalone: true,
  imports: [
    CommonModule,
    NzBadgeModule,
    NzListModule,
    NzSpinModule,
    NzIconModule,
  ],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  loading = false;
  lastChecked: string = new Date().toISOString();
  private pollingSub?: Subscription;

  isTooltipOpen = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications();
    this.pollingSub = interval(5000).subscribe(() => {
      this.fetchNotifications();
    });
  }

  toggleTooltip(): void {
    this.isTooltipOpen = !this.isTooltipOpen;
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  fetchNotifications(): void {
    this.notificationService.getNotifications(this.lastChecked).subscribe({
      next: (res: NotificationResponse) => {
        const data = res.Notifications || [];

        if (data.length > 0) {
          this.notifications = [...data, ...this.notifications];

          // cập nhật lastChecked theo createdAt mới nhất
          const latest = data
            .map((d) => new Date(d.createdAt || new Date()))
            .sort((a, b) => b.getTime() - a.getTime())[0];

          if (latest) {
            this.lastChecked = latest.toISOString();
          }
        } else {
          this.lastChecked = new Date().toISOString();
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi fetchNotifications:', err);
        this.loading = false;
      },
    });
  }

  markAllAsRead(): void {
    this.notifications = [];
  }
}
