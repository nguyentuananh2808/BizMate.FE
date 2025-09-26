import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from '../services/notification-service';

@Component({
  selector: 'notification',
  standalone: true,
  imports: [CommonModule, NzBadgeModule, NzListModule, NzSpinModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  lastChecked: string = new Date().toISOString();
  private pollingSub?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications();

    // Polling 5s/lần
    this.pollingSub = interval(5000).subscribe(() => {
      this.fetchNotifications();
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  fetchNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(this.lastChecked).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.notifications = [...data, ...this.notifications];
        }
        this.lastChecked = new Date().toISOString();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
