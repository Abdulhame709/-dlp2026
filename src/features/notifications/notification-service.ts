import { INotificationRepository } from './notification-repository-interface';
import { NotificationItem, NotificationType } from './notification-types';
import { DependencyInjector } from '@/core/config/dependency-injector';

export class NotificationService {
  // Dynamic getter handles dependency injection (DI) based on environment
  private static get repository(): INotificationRepository {
    return DependencyInjector.getNotificationRepository();
  }

  static async getNotifications(userId: string): Promise<NotificationItem[]> {
    return this.repository.getNotifications(userId);
  }

  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'ALERT',
    actionUrl?: string
  ): Promise<NotificationItem> {
    return this.repository.sendNotification(userId, title, message, type, actionUrl);
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    return this.repository.markAsRead(notificationId);
  }
}
