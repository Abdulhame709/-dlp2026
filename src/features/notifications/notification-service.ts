import { NotificationItem, NotificationType } from './notification-types';

const mockNotificationsStore: NotificationItem[] = [
  {
    id: 'notif-default-1',
    userId: '11111111-1111-1111-1111-111111111111',
    title: 'Welcome to Cortex AI',
    message: 'Your intelligent AI executive assistant is now successfully set up.',
    type: 'ALERT',
    isRead: false,
    createdAt: new Date(),
  }
];

export class NotificationService {
  static async getNotifications(userId: string): Promise<NotificationItem[]> {
    return mockNotificationsStore.filter(n => n.userId === userId);
  }

  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'ALERT'
  ): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      id: `notif-uuid-${Date.now()}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
    };

    mockNotificationsStore.push(newNotif);
    return newNotif;
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    const index = mockNotificationsStore.findIndex(n => n.id === notificationId);
    if (index === -1) return false;

    mockNotificationsStore[index].isRead = true;
    return true;
  }
}
