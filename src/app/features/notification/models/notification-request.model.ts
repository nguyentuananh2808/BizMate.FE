export interface NotificationResponse {
  Notifications: AppNotification[];
}

export interface AppNotification {
  StoreId: string;
  Message: string;
  Type: string;
  createdAt?: string;
  UserId: string;
}


export interface NotificationRequest {
  lastChecked: string;
}
