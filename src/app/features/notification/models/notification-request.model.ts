export interface NotificationResponse {
  Notifications: AppNotification[];
}

export interface AppNotification {
  Id: string;
  StoreId: string;
  Message: string;
  Type: string;
  createdAt?: string;
  UserId: string;
}
export interface NotificationRequest {
  lastChecked: string;
}

export interface AppNotificationWithOrder extends AppNotification {
  orderId?: string;
  orderCode?: string;
  customMessage?: string;
}
