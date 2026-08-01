export type NotificationType = 'REMINDER' | 'AI_SUGGESTION' | 'ALERT' | 'TEAM';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: Date;
}
