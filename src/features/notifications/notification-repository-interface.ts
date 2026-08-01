import { NotificationItem, NotificationType } from './notification-types';

export interface INotificationRepository {
  getNotifications(userId: string): Promise<NotificationItem[]>;

  sendNotification(
    userId: string,
    title: string,
    message: string,
    type?: NotificationType,
    actionUrl?: string
  ): Promise<NotificationItem>;

  markAsRead(notificationId: string): Promise<boolean>;
}
