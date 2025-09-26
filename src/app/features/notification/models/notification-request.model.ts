export interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationRequest {
  lastChecked: string;
}
